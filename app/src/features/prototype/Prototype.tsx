'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Toast } from '@/components/Toast';
import { PENDING_BILLS, type PendingBill } from '@/data/reference';
import { BottomNav, Home } from '@/features/home/Home';
import { QuickEntrySheet } from '@/features/quick-entry/QuickEntrySheet';
import { emptyDraft, type Draft } from '@/features/quick-entry/draft';
import { cn } from '@/lib/cn';
import { centsToDigits } from '@/lib/money';
import { readTheme, setTheme, watchSystemTheme, type ThemeChoice } from '@/lib/theme';
import { toastLines, type Entry } from '@/state/ledger';
import { useLedger } from '@/state/useLedger';
import { FRAMES, demoState, toEntry, type Frame } from './frames';

const TOAST_MS = 5000; // --toast-duration

interface SheetState {
  key: number;
  draft: Draft;
  confirm?: boolean;
  billId?: string;
}

/**
 * Protótipo navegável do P1: a Início com o "+" e o sheet de lançamento
 * rápido. No desktop aparece num aparelho de 390×844 ao lado do seletor
 * de frames; no celular ocupa a tela inteira.
 */
export function Prototype({ frame }: { frame: Frame | null }) {
  const demo = useMemo(() => demoState(frame), [frame]);
  const ledger = useLedger(demo.entries);
  const [paidBills, setPaidBills] = useState<Record<string, string>>({});
  const [sheet, setSheet] = useState<SheetState | null>(demo.sheet ? { key: 0, ...demo.sheet } : null);
  const [toast, setToast] = useState<{ entry: Entry; placement: 'bottom' | 'top'; pinned?: boolean } | null>(
    demo.entries ? { entry: demo.entries[0], placement: 'bottom', pinned: demo.toastPinned } : null,
  );
  const addRef = useRef<HTMLButtonElement>(null);
  const sheetKey = useRef(1);
  const [theme, setThemeChoice] = useState<ThemeChoice>('system');

  useEffect(() => {
    setThemeChoice(readTheme());
    return watchSystemTheme();
  }, []);

  const openSheet = (draft: Draft = emptyDraft(), billId?: string) => {
    setSheet({ key: sheetKey.current++, draft, billId });
    // Um toast ainda visível sobe para cima do sheet, sem cobrir o Salvar.
    setToast((t) => (t ? { ...t, placement: 'top' } : t));
  };

  const payBill = (bill: PendingBill) =>
    openSheet({ ...emptyDraft(), digits: centsToDigits(bill.amountCents), categoryId: bill.categoryId, description: bill.name }, bill.id);

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
  const frameLink = 'flex min-h-11 items-center gap-2.5 rounded-sm px-2.5 text-sm font-semibold text-text no-underline hover:bg-surface aria-[current=page]:bg-surface aria-[current=page]:font-extrabold';
  const frameBadge = 'grid size-[26px] flex-none place-items-center rounded-[7px] bg-text text-[13px] font-extrabold text-bg';

  return (
    <div className="flex min-h-full items-center justify-center gap-12 p-12 phone:block phone:h-full phone:p-0">
      <aside className="flex w-[260px] flex-col gap-4 text-text phone:hidden" aria-label="Demonstração">
        <div className="text-[22px] font-extrabold tracking-[-0.02em]">P1 · Lançamento rápido</div>
        <p className="m-0 text-sm leading-normal text-text-secondary">Abra pelo “+”. Os frames do design abrem já no estado correspondente.</p>
        <nav className="flex flex-col gap-1">
          <Link href="/" className={frameLink} aria-current={frame === null ? 'page' : undefined}>
            <span className={frameBadge}>·</span>Livre
          </Link>
          {FRAMES.map((f) => (
            <Link key={f.id} href={`/?frame=${f.id}`} className={frameLink} aria-current={frame === f.id ? 'page' : undefined}>
              <span className={frameBadge}>{f.id}</span>
              {f.label}
            </Link>
          ))}
        </nav>
        <div className="grid grid-cols-3 gap-0.5 rounded-[14px] bg-surface-subtle p-[3px]" role="radiogroup" aria-label="Tema">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              onClick={() => {
                setTheme(t);
                setThemeChoice(t);
              }}
              className="flex min-h-10 items-center justify-center gap-1 rounded-[11px] border-0 bg-transparent text-xs font-semibold text-text-secondary aria-checked:bg-surface aria-checked:font-extrabold aria-checked:text-text aria-checked:shadow-segment"
            >
              <Icon name={t === 'system' ? 'contrast' : t === 'light' ? 'light_mode' : 'dark_mode'} size={18} />
              {t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Escuro'}
            </button>
          ))}
        </div>
      </aside>

      <div
        className={cn(
          'relative isolate h-[844px] w-[390px] flex-none overflow-hidden rounded-[44px] border border-device-border bg-bg',
          'shadow-[0_1px_2px_rgba(0,0,0,.05),0_16px_40px_rgba(28,35,33,.1)]',
          'phone:h-full phone:min-h-dvh phone:w-full phone:rounded-none phone:border-0 phone:shadow-none',
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[47px] items-center justify-between pr-[26px] pl-[34px] text-[15px] font-bold text-text phone:hidden"
          aria-hidden="true"
        >
          <span>9:41</span>
          <span className="flex items-center gap-1">
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

        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -ml-[67px] h-[5px] w-[134px] rounded-[3px] bg-text phone:hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
