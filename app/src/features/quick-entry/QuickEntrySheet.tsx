import { useCallback, useEffect, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Icon } from '../../components/Icon';
import { ACCOUNTS, categoryById, type AccountId } from '../../data/reference';
import { formatAmount, type KeypadKey } from '../../lib/money';
import { accountDetail, entryPath, type EntryKind, type Selectors } from '../../state/ledger';
import { draftCents, draftReducer, missingField, type Draft } from './draft';
import {
  AccountPicker,
  AccountRow,
  CategoryGrid,
  Keypad,
  MorePanel,
  SmartChips,
  StatusLabel,
  SubcategoryGrid,
} from './parts';
import { useFocusTrap } from './useFocusTrap';
import './QuickEntry.css';

/** Arrastar além disso fecha (ou pede confirmação). */
const CLOSE_THRESHOLD = 120;
/** Onde o sheet para enquanto pergunta "Descartar?" (frame E: 262 − 116). */
const CONFIRM_OFFSET = 146;
/** Tempo do estado "Salvando…". */
const SAVE_DELAY = 350;

const KINDS: { id: EntryKind; label: string }[] = [
  { id: 'despesa', label: 'Despesa' },
  { id: 'receita', label: 'Receita' },
  { id: 'transferencia', label: 'Transferência' },
];

interface Props {
  initialDraft: Draft;
  /** Abre já com a confirmação de descarte (demo do frame E). */
  initialConfirm?: boolean;
  selectors: Selectors;
  onSave: (draft: Draft) => void;
  /** "Salvar e lançar outro": salva e mantém o sheet aberto. */
  onSaveNext: (draft: Draft) => void;
  onClosed: () => void;
}

export function QuickEntrySheet({ initialDraft, initialConfirm = false, selectors: s, onSave, onSaveNext, onClosed }: Props) {
  const [draft, dispatch] = useReducer(draftReducer, initialDraft);
  const [closing, setClosing] = useState(false);
  const [confirm, setConfirm] = useState(initialConfirm);
  const [dragY, setDragY] = useState(initialConfirm ? CONFIRM_OFFSET : 0);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState<null | 'save' | 'next'>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; startY: number; lastY: number; lastT: number; v: number; active: boolean } | null>(null);

  const cents = draftCents(draft);
  const missing = missingField(draft);
  const busy = saving !== null;

  useFocusTrap(sheetRef, !confirm && !closing);
  useFocusTrap(dialogRef, confirm && !closing);

  const startClosing = useCallback(() => {
    setConfirm(false);
    setClosing(true);
  }, []);

  // Fallback caso animationend não dispare (aba em segundo plano, por exemplo).
  useEffect(() => {
    if (!closing) return;
    const t = window.setTimeout(onClosed, 450);
    return () => window.clearTimeout(t);
  }, [closing, onClosed]);

  /** ✕, Esc, toque fora ou arrastar: com valor digitado, pergunta antes. */
  const requestClose = useCallback(() => {
    if (busy) return;
    if (cents > 0) {
      setConfirm(true);
      setDragY(CONFIRM_OFFSET);
    } else {
      startClosing();
    }
  }, [busy, cents, startClosing]);

  const keepEditing = () => {
    setConfirm(false);
    setDragY(0);
  };

  const save = useCallback(
    (mode: 'save' | 'next') => {
      if (missing || busy) return;
      setSaving(mode);
      window.setTimeout(() => {
        setSaving(null);
        if (mode === 'next') {
          onSaveNext(draft);
          dispatch({ type: 'reset-for-next' });
        } else {
          onSave(draft);
          startClosing();
        }
      }, SAVE_DELAY);
    },
    [busy, draft, missing, onSave, onSaveNext, startClosing],
  );

  const pressKey = useCallback((key: KeypadKey) => dispatch({ type: 'key', key }), []);

  // Teclado físico: dígitos, Backspace, Enter e Esc.
  useEffect(() => {
    if (closing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (confirm) keepEditing();
        else if (draft.panel !== 'categories') dispatch({ type: 'panel', panel: 'categories' });
        else requestClose();
        return;
      }
      const target = e.target as HTMLElement;
      if (confirm || busy || target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key) || e.key === 'Backspace') {
        e.preventDefault();
        const key = (e.key === 'Backspace' ? 'del' : e.key) as KeypadKey;
        pressKey(key);
        setPressedKey(key);
        window.setTimeout(() => setPressedKey(null), 90);
      } else if (e.key === 'Enter' && target.tagName !== 'BUTTON') {
        e.preventDefault();
        save('save');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, closing, confirm, draft.panel, pressKey, requestClose, save]);

  /* ───── Arrastar para baixo ───── */

  const onPointerDown = (e: ReactPointerEvent) => {
    if (confirm || busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0, active: false };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.startY;
    if (!d.active) {
      if (Math.abs(dy) < 6) return;
      // Só captura depois de mover, para não roubar o clique dos botões.
      d.active = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
    }
    d.v = (e.clientY - d.lastY) / Math.max(1, e.timeStamp - d.lastT);
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    setDragY(dy > 0 ? dy : dy / 6);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.active) return;
    setDragging(false);
    const dy = e.clientY - d.startY;
    if (dy > CLOSE_THRESHOLD || (dy > 40 && d.v > 0.8)) {
      if (cents > 0) {
        setConfirm(true);
        setDragY(CONFIRM_OFFSET);
      } else {
        startClosing();
      }
    } else {
      setDragY(0);
    }
  };

  /* ───── Faixa superior ───── */

  const digitsText = formatAmount(cents);
  const amountSize = digitsText.length <= 6 ? 60 : digitsText.length <= 8 ? 56 : digitsText.length <= 10 ? 46 : 38;

  let hint;
  if (draft.kind === 'transferencia') {
    hint = (
      <>
        <span style={{ color: 'var(--color-primary)' }}>
          <Icon name="info" size={16} />
        </span>
        Transferência não conta como despesa
      </>
    );
  } else if (draft.kind === 'receita') {
    hint = (
      <>
        <span style={{ color: 'var(--color-primary)' }}>
          <Icon name="south_west" size={16} />
        </span>
        Receita em {ACCOUNTS[draft.accountId].name}
      </>
    );
  } else if (draft.categoryId) {
    const cat = categoryById(draft.categoryId);
    hint = (
      <>
        <span style={{ color: `var(--cat-${cat.id}-icon)` }}>
          <Icon name={cat.icon} size={16} />
        </span>
        {draft.panel === 'subcategories'
          ? `${cat.name} › escolha a subcategoria`
          : entryPath({ categoryId: draft.categoryId, subId: draft.subId })}
        {draft.private && <Icon name="lock" size={14} filled />}
      </>
    );
  } else {
    hint = 'Escolha a categoria';
  }

  /* ───── Zona do meio ───── */

  const fullPanel = (['all-categories', 'more', 'account', 'from', 'to'] as const).find((p) => p === draft.panel);
  const backToGrid = () => dispatch({ type: 'panel', panel: 'categories' });

  const renderFullPanel = () => {
    const titles = {
      'all-categories': 'Todas as categorias',
      more: 'Mais opções',
      account: 'Conta',
      from: 'De',
      to: 'Para',
    } as const;
    const pickAccount = (id: AccountId) => dispatch({ type: 'account', id });
    const current = draft.panel === 'from' ? draft.fromId : draft.panel === 'to' ? draft.toId : draft.accountId;
    return (
      <div className="qe-panel">
        <div className="qe-section-head">
          <button type="button" className="qe-back" onClick={backToGrid}>
            <Icon name="chevron_left" size={22} />
            {titles[fullPanel!]}
          </button>
        </div>
        <div className="qe-panel__body">
          {draft.panel === 'all-categories' && <CategoryGrid draft={draft} dispatch={dispatch} all />}
          {draft.panel === 'more' && <MorePanel draft={draft} dispatch={dispatch} />}
          {(draft.panel === 'account' || draft.panel === 'from' || draft.panel === 'to') && (
            <AccountPicker current={current} s={s} onPick={pickAccount} />
          )}
        </div>
      </div>
    );
  };

  const renderMiddle = () => {
    if (draft.kind === 'transferencia') {
      return (
        <>
          <div className="qe-section-head">
            <span className="qe-section-head__label">De → Para</span>
            <button type="button" className="qe-link" aria-label="Inverter origem e destino" onClick={() => dispatch({ type: 'swap' })}>
              <Icon name="swap_vert" size={20} />
              Inverter
            </button>
          </div>
          <div className="qe-rows">
            <AccountRow
              label="De"
              account={ACCOUNTS[draft.fromId]}
              detail={accountDetail(draft.fromId, s)}
              onClick={() => dispatch({ type: 'panel', panel: 'from' })}
            />
            <AccountRow
              label="Para"
              account={ACCOUNTS[draft.toId]}
              detail={accountDetail(draft.toId, s)}
              onClick={() => dispatch({ type: 'panel', panel: 'to' })}
            />
          </div>
        </>
      );
    }
    if (draft.kind === 'receita') {
      return (
        <>
          <div className="qe-section-head">
            <span className="qe-section-head__label">Entra em</span>
          </div>
          <div className="qe-rows">
            <AccountRow
              label="Para"
              account={ACCOUNTS[draft.accountId]}
              detail={accountDetail(draft.accountId, s)}
              onClick={() => dispatch({ type: 'panel', panel: 'account' })}
            />
          </div>
        </>
      );
    }
    if (draft.panel === 'subcategories' && draft.categoryId) {
      const cat = categoryById(draft.categoryId);
      const b = s.categoryBudget(cat.id);
      return (
        <>
          <div className="qe-section-head">
            <button type="button" className="qe-back" onClick={backToGrid} aria-label={`Voltar para categorias. ${cat.name} selecionada`}>
              <Icon name="chevron_left" size={22} />
              {cat.name}
            </button>
            {b && <StatusLabel info={b} />}
          </div>
          <SubcategoryGrid draft={draft} dispatch={dispatch} s={s} />
        </>
      );
    }
    return (
      <>
        <div className="qe-section-head">
          <span className="qe-section-head__label">Categoria</span>
          <button type="button" className="qe-link" onClick={() => dispatch({ type: 'panel', panel: 'all-categories' })}>
            Todas
            <Icon name="chevron_right" size={20} />
          </button>
        </div>
        <CategoryGrid draft={draft} dispatch={dispatch} />
      </>
    );
  };

  const discardText =
    draft.kind === 'transferencia'
      ? `A transferência de ${ACCOUNTS[draft.fromId].name} para ${ACCOUNTS[draft.toId].name} ainda não foi salva.`
      : draft.categoryId && draft.kind === 'despesa'
        ? `O lançamento em ${entryPath({ categoryId: draft.categoryId, subId: draft.subId })} ainda não foi salvo.`
        : 'O lançamento ainda não foi salvo.';

  const sheetClass = [
    'qe-sheet',
    closing && 'is-closing',
    (dragging || confirm) && 'is-dragging',
    !dragging && !closing && 'is-settling',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={`qe-scrim${closing ? ' is-closing' : ''}${dragging || confirm ? ' is-dragging' : ''}`}
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Novo lançamento"
        aria-hidden={confirm || undefined}
        tabIndex={-1}
        className={sheetClass}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) onClosed();
        }}
      >
        <div
          className="qe-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="qe-handle">
            <span />
          </div>
          <div className="qe-top">
            <button type="button" className="qe-close" aria-label="Fechar sem salvar" onClick={requestClose}>
              <Icon name="close" size={22} />
            </button>
            <div className="qe-segment" role="tablist" aria-label="Tipo de lançamento">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="tab"
                  aria-selected={draft.kind === k.id}
                  tabIndex={draft.kind === k.id ? 0 : -1}
                  onClick={() => dispatch({ type: 'kind', kind: k.id })}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                    const i = KINDS.findIndex((x) => x.id === draft.kind);
                    const next = KINDS[(i + (e.key === 'ArrowRight' ? 1 : KINDS.length - 1)) % KINDS.length];
                    dispatch({ type: 'kind', kind: next.id });
                    const tabs = e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role=tab]');
                    tabs[KINDS.indexOf(next)].focus();
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
          <div className="qe-amount-row">
            <div className="qe-amount">
              <div className="qe-amount__value" aria-live="polite" aria-atomic="true">
                <span className="qe-amount__currency">R$</span>
                <span className={`qe-amount__digits${cents ? '' : ' is-empty'}`} style={{ fontSize: amountSize }}>
                  {digitsText}
                </span>
              </div>
              <div className="qe-amount__hint">{hint}</div>
            </div>
            <button type="button" className="qe-photo" aria-label="Lançar por foto do comprovante">
              <Icon name="photo_camera" size={24} />
            </button>
          </div>
        </div>

        <div className="qe-scroll">
          <div className="qe-spacer" />
          {fullPanel ? (
            renderFullPanel()
          ) : (
            <>
              {renderMiddle()}
              <SmartChips draft={draft} dispatch={dispatch} />
              <Keypad onKey={pressKey} disabled={busy} pressed={pressedKey} />
            </>
          )}
        </div>

        <div className="qe-actions">
          <button type="button" className="qe-save-next" disabled={!!missing || busy} onClick={() => save('next')}>
            {saving === 'next' ? 'Salvando…' : 'Salvar e lançar outro'}
          </button>
          <button
            type="button"
            className="qe-save"
            disabled={!!missing && !busy}
            aria-busy={saving === 'save' || undefined}
            aria-describedby={missing ? 'qe-missing' : undefined}
            onClick={() => save('save')}
          >
            {saving === 'save' ? (
              <>
                <Icon name="progress_activity" size={20} className="spin" />
                Salvando…
              </>
            ) : (
              <>
                <Icon name="check" size={22} />
                Salvar
              </>
            )}
          </button>
          {missing && (
            <span id="qe-missing" className="visually-hidden">
              {missing}
            </span>
          )}
        </div>
      </div>

      {confirm && !closing && (
        <>
          <div className="qe-dialog-scrim" aria-hidden="true" onClick={keepEditing} />
          <div ref={dialogRef} className="qe-dialog" role="alertdialog" aria-modal="true" aria-labelledby="qe-discard-title" aria-describedby="qe-discard-desc">
            <h2 id="qe-discard-title">Descartar R$ {formatAmount(cents)}?</h2>
            <p id="qe-discard-desc">{discardText}</p>
            <div className="qe-dialog__actions">
              <button type="button" className="qe-dialog__discard" onClick={startClosing}>
                Descartar
              </button>
              <button type="button" className="qe-dialog__keep" onClick={keepEditing}>
                Continuar editando
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
