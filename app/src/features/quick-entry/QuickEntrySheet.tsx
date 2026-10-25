'use client';

import { useCallback, useEffect, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Icon } from '@/components/Icon';
import { ACCOUNTS, categoryById, type AccountId } from '@/data/reference';
import { formatAmount, type KeypadKey } from '@/lib/money';
import { cn } from '@/lib/cn';
import { accountDetail, entryPath, type EntryKind, type Selectors } from '@/state/ledger';
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
import { ui } from './ui';

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
        <span className="flex text-primary">
          <Icon name="info" size={16} />
        </span>
        Transferência não conta como despesa
      </>
    );
  } else if (draft.kind === 'receita') {
    hint = (
      <>
        <span className="flex text-primary">
          <Icon name="south_west" size={16} />
        </span>
        Receita em {ACCOUNTS[draft.accountId].name}
      </>
    );
  } else if (draft.categoryId) {
    const cat = categoryById(draft.categoryId);
    hint = (
      <>
        <span className="flex" style={{ color: `var(--cat-${cat.id}-icon)` }}>
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
      <div className="flex h-[462px] min-h-0 flex-none flex-col">
        <div className={ui.sectionHead}>
          <button type="button" className={ui.back} onClick={backToGrid}>
            <Icon name="chevron_left" size={22} />
            {titles[fullPanel!]}
          </button>
        </div>
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-1">
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
          <div className={ui.sectionHead}>
            <span className={ui.sectionLabel}>De → Para</span>
            <button type="button" className={ui.link} aria-label="Inverter origem e destino" onClick={() => dispatch({ type: 'swap' })}>
              <Icon name="swap_vert" size={20} />
              Inverter
            </button>
          </div>
          <div className={ui.rows}>
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
          <div className={ui.sectionHead}>
            <span className={ui.sectionLabel}>Entra em</span>
          </div>
          <div className={ui.rows}>
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
          <div className={ui.sectionHead}>
            <button type="button" className={ui.back} onClick={backToGrid} aria-label={`Voltar para categorias. ${cat.name} selecionada`}>
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
        <div className={ui.sectionHead}>
          <span className={ui.sectionLabel}>Categoria</span>
          <button type="button" className={ui.link} onClick={() => dispatch({ type: 'panel', panel: 'all-categories' })}>
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

  return (
    <>
      <div
        className={cn(
          'absolute inset-0 z-20 transition-colors duration-(--motion-sheet-out) ease-out',
          dragging || confirm ? 'bg-scrim-dragging' : 'bg-scrim',
          closing ? 'animate-sheet-fade-out' : 'animate-sheet-fade-in',
        )}
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
        data-dragging={dragging || confirm}
        className={cn(
          'group absolute inset-x-0 bottom-0 top-[clamp(8px,calc(100%_-_728px),116px)] z-[21] flex flex-col overflow-hidden',
          'rounded-t-sheet bg-surface px-4 pb-[22px] text-text shadow-sheet tabular-nums',
          closing ? 'animate-sheet-out motion-reduce:animate-sheet-fade-out' : 'animate-sheet-in motion-reduce:animate-sheet-fade-in',
          !dragging && !closing && 'transition-transform duration-(--motion-sheet-out) ease-out',
        )}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) onClosed();
        }}
      >
        <div
          className="flex-none cursor-grab touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex h-[22px] justify-center pt-2">
            <span className="h-[5px] w-10 rounded-[3px] bg-handle transition-all duration-[120ms] group-data-[dragging=true]:w-[52px] group-data-[dragging=true]:bg-handle-active" />
          </div>
          <div className="flex h-11 gap-2">
            <button
              type="button"
              className="grid size-11 flex-none place-items-center rounded-full border-0 bg-surface-subtle hover:bg-hover"
              aria-label="Fechar sem salvar"
              onClick={requestClose}
            >
              <Icon name="close" size={22} />
            </button>
            <div className="grid flex-1 grid-cols-3 gap-0.5 rounded-[14px] bg-surface-subtle p-[3px]" role="tablist" aria-label="Tipo de lançamento">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="tab"
                  aria-selected={draft.kind === k.id}
                  tabIndex={draft.kind === k.id ? 0 : -1}
                  className="rounded-[11px] border-0 bg-transparent text-[13px] font-semibold text-text-secondary aria-selected:bg-surface aria-selected:font-extrabold aria-selected:text-text aria-selected:shadow-segment"
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
          <div className="mt-2.5 flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex h-16 items-baseline gap-1.5 whitespace-nowrap" aria-live="polite" aria-atomic="true">
                <span className="text-[26px] font-bold text-text-secondary">R$</span>
                <span className={cn('leading-16 font-extrabold tracking-[-0.035em]', !cents && 'text-text-secondary')} style={{ fontSize: amountSize }}>
                  {digitsText}
                </span>
              </div>
              <div className="flex h-5 items-center gap-1.5 overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap text-text-secondary">
                {hint}
              </div>
            </div>
            <button type="button" className="mt-1.5 grid size-[52px] flex-none place-items-center rounded-md border border-border bg-surface hover:bg-surface-subtle" aria-label="Lançar por foto do comprovante">
              <Icon name="photo_camera" size={24} />
            </button>
          </div>
        </div>

        {/* Tudo entre a faixa superior e o Salvar. Só rola em telas baixas; 6px embaixo para o anel de foco. */}
        <div className="-mx-4 flex min-h-0 flex-auto flex-col overflow-y-auto overscroll-contain px-4 pb-1.5">
          <div className="min-h-0 flex-[1_1_0]" />
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

        <div className="mt-1 flex flex-none gap-2">
          <button type="button" className="h-14 flex-none rounded-button border-[1.5px] border-primary bg-surface px-3.5 text-sm font-bold text-primary enabled:hover:bg-bg-positive disabled:border-transparent disabled:bg-surface-subtle disabled:text-text-secondary" disabled={!!missing || busy} onClick={() => save('next')}>
            {saving === 'next' ? 'Salvando…' : 'Salvar e lançar outro'}
          </button>
          <button
            type="button"
            className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-button border-0 bg-primary text-[17px] font-extrabold text-on-primary transition-transform duration-75 enabled:hover:bg-primary-hover enabled:active:scale-[.97] enabled:active:bg-primary-pressed enabled:active:shadow-[inset_0_2px_4px_rgba(0,0,0,.25)] disabled:bg-surface-subtle disabled:text-text-secondary aria-busy:cursor-progress aria-busy:bg-primary aria-busy:text-[15px] aria-busy:text-on-primary"
            disabled={!!missing && !busy}
            aria-busy={saving === 'save' || undefined}
            aria-describedby={missing ? 'qe-missing' : undefined}
            onClick={() => save('save')}
          >
            {saving === 'save' ? (
              <>
                <Icon name="progress_activity" size={20} className="animate-spin motion-reduce:animate-none" />
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
            <span id="qe-missing" className="sr-only">
              {missing}
            </span>
          )}
        </div>
      </div>

      {confirm && !closing && (
        <>
          <div className="absolute inset-0 z-30 animate-dialog-fade-in bg-scrim-dialog" aria-hidden="true" onClick={keepEditing} />
          <div ref={dialogRef} className="absolute inset-x-3 bottom-6 z-[31] flex animate-dialog-in flex-col gap-1.5 rounded-sheet bg-surface px-5 pt-[22px] pb-5 text-text shadow-dialog motion-reduce:animate-dialog-fade-in"
            role="alertdialog" aria-modal="true" aria-labelledby="qe-discard-title" aria-describedby="qe-discard-desc">
            <h2 id="qe-discard-title" className="m-0 text-[22px] font-extrabold tracking-[-0.01em]">Descartar R$ {formatAmount(cents)}?</h2>
            <p id="qe-discard-desc" className="m-0 text-sm leading-[1.45] text-text-secondary">{discardText}</p>
            <div className="mt-3.5 flex gap-2">
              <button type="button" className="h-14 flex-1 rounded-button border-[1.5px] border-border bg-surface text-[15px] font-bold hover:bg-surface-subtle" onClick={startClosing}>
                Descartar
              </button>
              <button type="button" className="h-14 flex-[1.5] rounded-button border-0 bg-primary text-[15px] font-extrabold text-on-primary hover:bg-primary-hover" onClick={keepEditing}>
                Continuar editando
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
