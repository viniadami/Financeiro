import { useCallback, useMemo, useRef, useState } from 'react';
import { Icon } from './components/Icon';
import { Toast } from './components/Toast';
import { CURRENT_USER, PENDING_BILLS, type PendingBill } from './data/reference';
import { BottomNav, Home } from './features/home/Home';
import { QuickEntrySheet } from './features/quick-entry/QuickEntrySheet';
import { draftCents, draftReducer, emptyDraft, type Draft } from './features/quick-entry/draft';
import { centsToDigits } from './lib/money';
import { newEntryId, toastLines, useLedger, type Entry } from './state/ledger';
import { applyTheme, type ThemeChoice } from './theme';
import './App.css';

const TOAST_MS = 5000; // --toast-duration

type Frame = 'A' | 'B' | 'C' | 'D' | 'E';
const FRAMES: { id: Frame; label: string }[] = [
  { id: 'A', label: 'Valor digitado, Alimentação' },
  { id: 'B', label: 'Subcategorias de Alimentação' },
  { id: 'C', label: 'Salvo, com Desfazer' },
  { id: 'D', label: 'Transferência: Pagar fatura' },
  { id: 'E', label: 'Arrastar para baixo' },
];

function toEntry(d: Draft): Entry {
  const base = {
    id: newEntryId(),
    kind: d.kind,
    cents: draftCents(d),
    by: CURRENT_USER.initial,
    when: d.when,
    scope: d.scope,
    description: d.description.trim() || undefined,
    hasReceipt: d.hasReceipt || undefined,
    recurring: d.recurring || undefined,
  };
  if (d.kind === 'transferencia') return { ...base, fromId: d.fromId, toId: d.toId };
  if (d.kind === 'receita') return { ...base, accountId: d.accountId };
  return {
    ...base,
    categoryId: d.categoryId,
    subId: d.subId,
    accountId: d.accountId,
    installments: d.installments ?? undefined,
    private: d.private || undefined,
  };
}

/** Estados de demonstração dos frames A–E (?frame=A). */
function demoState(frame: Frame | null) {
  const typed: Draft = { ...emptyDraft(), digits: '8740', categoryId: 'alimentacao', subId: 'supermercado', accountId: 'va' };
  switch (frame) {
    case 'A':
      return { sheet: { draft: typed } };
    case 'B':
      return { sheet: { draft: { ...typed, panel: 'subcategories' as const } } };
    case 'C':
      return { entries: [toEntry(typed)], toastPinned: true };
    case 'D':
      return { sheet: { draft: draftReducer(emptyDraft(), { type: 'kind', kind: 'transferencia' }) } };
    case 'E':
      return { sheet: { draft: typed, confirm: true } };
    default:
      return {};
  }
}

function readFrame(): Frame | null {
  const f = new URLSearchParams(window.location.search).get('frame')?.toUpperCase();
  return FRAMES.some((x) => x.id === f) ? (f as Frame) : null;
}

interface SheetState {
  key: number;
  draft: Draft;
  confirm?: boolean;
  billId?: string;
}

export default function App() {
  const frame = useMemo(readFrame, []);
  const demo = useMemo(() => demoState(frame), [frame]);
  const ledger = useLedger(demo.entries);
  const [paidBills, setPaidBills] = useState<Record<string, string>>({});
  const [sheet, setSheet] = useState<SheetState | null>(demo.sheet ? { key: 0, ...demo.sheet } : null);
  const [toast, setToast] = useState<{ entry: Entry; placement: 'bottom' | 'top'; pinned?: boolean } | null>(
    demo.entries ? { entry: demo.entries[0], placement: 'bottom', pinned: demo.toastPinned } : null,
  );
  const addRef = useRef<HTMLButtonElement>(null);
  const sheetKey = useRef(1);
  const [theme, setTheme] = useState<ThemeChoice>(() => applyTheme());

  const openSheet = (draft: Draft = emptyDraft(), billId?: string) => {
    setSheet({ key: sheetKey.current++, draft, billId });
    // Um toast ainda visível sobe para cima do sheet, sem cobrir o Salvar.
    setToast((t) => (t ? { ...t, placement: 'top' } : t));
  };

  const payBill = (bill: PendingBill) =>
    openSheet(
      {
        ...emptyDraft(),
        digits: centsToDigits(bill.amountCents),
        categoryId: bill.categoryId,
        description: bill.name,
      },
      bill.id,
    );

  const handleSave = (draft: Draft, keepOpen: boolean) => {
    const entry = toEntry(draft);
    ledger.add(entry);
    if (sheet?.billId) {
      const billId = sheet.billId;
      setPaidBills((p) => ({ ...p, [billId]: entry.id }));
    }
    setToast({ entry, placement: keepOpen ? 'top' : 'bottom' });
  };

  const undo = () => {
    if (!toast) return;
    const id = toast.entry.id;
    ledger.remove(id);
    setPaidBills((p) => Object.fromEntries(Object.entries(p).filter(([, entryId]) => entryId !== id)));
    setToast(null);
  };

  const onSheetClosed = useCallback(() => {
    setSheet(null);
    setToast((t) => (t ? { ...t, placement: 'bottom' } : t));
    addRef.current?.focus({ preventScroll: true });
  }, []);

  const bills = PENDING_BILLS.filter((b) => !paidBills[b.id]);

  return (
    <div className="stage">
      <aside className="demo" aria-label="Demonstração">
        <div className="demo__title">P1 · Lançamento rápido</div>
        <p className="demo__text">Abra pelo “+”. Os frames do design abrem já no estado correspondente.</p>
        <nav className="demo__frames">
          <a href="?" aria-current={frame === null ? 'page' : undefined}>
            <span>·</span>Livre
          </a>
          {FRAMES.map((f) => (
            <a key={f.id} href={`?frame=${f.id}`} aria-current={frame === f.id ? 'page' : undefined}>
              <span>{f.id}</span>
              {f.label}
            </a>
          ))}
        </nav>
        <div className="demo__theme" role="radiogroup" aria-label="Tema">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={theme === t} onClick={() => setTheme(applyTheme(t))}>
              <Icon name={t === 'system' ? 'contrast' : t === 'light' ? 'light_mode' : 'dark_mode'} size={18} />
              {t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Escuro'}
            </button>
          ))}
        </div>
      </aside>

      <div className="device">
        <div className="device__status" aria-hidden="true">
          <span>9:41</span>
          <span>
            <Icon name="signal_cellular_alt" size={18} />
            <Icon name="wifi" size={18} />
            <Icon name="battery_full" size={20} />
          </span>
        </div>

        <Home ledger={ledger} bills={bills} onPayBill={payBill} hidden={!!sheet} />
        <BottomNav onAdd={() => openSheet()} addRef={addRef} hidden={!!sheet} />

        {sheet && (
          <QuickEntrySheet
            key={sheet.key}
            initialDraft={sheet.draft}
            initialConfirm={sheet.confirm}
            selectors={ledger}
            onSave={(d) => handleSave(d, false)}
            onSaveNext={(d) => handleSave(d, true)}
            onClosed={onSheetClosed}
          />
        )}

        {toast && (
          <Toast
            key={toast.entry.id}
            lines={toastLines(toast.entry, ledger)}
            placement={toast.placement}
            duration={toast.pinned ? null : TOAST_MS}
            onUndo={undo}
            onDone={() => setToast(null)}
          />
        )}

        <div className="device__home-indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
