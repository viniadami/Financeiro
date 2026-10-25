import { BudgetBar } from '@/components/BudgetBar';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Icon } from '@/components/Icon';
import { ACCOUNTS, ACCOUNT_ORDER, CATEGORIES, TOP_CATEGORIES, categoryById, type Account, type AccountId } from '@/data/reference';
import type { BudgetInfo } from '@/lib/budget';
import { cn, toneText } from '@/lib/cn';
import { brl, type KeypadKey } from '@/lib/money';
import { accountDetail, type Selectors } from '@/state/ledger';
import { moreCount, type Draft, type DraftAction } from './draft';
import { ui } from './ui';

type Dispatch = (a: DraftAction) => void;

/* ───── Categorias (A) ───── */

export function CategoryGrid({ draft, dispatch, all }: { draft: Draft; dispatch: Dispatch; all?: boolean }) {
  const ids = all ? CATEGORIES.map((c) => c.id) : TOP_CATEGORIES;
  return (
    <div className={cn(ui.catGrid, all && 'mt-0')} role="group" aria-label="Categoria">
      {ids.map((id) => {
        const cat = categoryById(id);
        const selected = draft.categoryId === id;
        return (
          <button key={id} type="button" className={ui.tile} aria-pressed={selected} onClick={() => dispatch({ type: 'category', id })}>
            <CategoryBadge categoryId={id} icon={cat.icon} size={26} iconSize={17} radius={8} />
            {cat.name}
            {selected && (
              <span className="absolute top-[3px] right-[3px] flex text-primary">
                <Icon name="check_circle" size={16} filled />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ───── Subcategorias com envelopes (B) ───── */

export function StatusLabel({ info }: { info: BudgetInfo }) {
  const text = info.remainingCents >= 0 ? `restam ${brl(info.remainingCents)}` : `! passou ${brl(-info.remainingCents)}`;
  return (
    <span className={cn('flex items-center gap-1 text-[13px] font-bold', toneText(info.status))}>
      {info.status === 'alert' && <Icon name="warning" size={16} filled />}
      {info.pct}% · {text}
    </span>
  );
}

function Bang() {
  return <span className="grid size-[15px] flex-none place-items-center rounded-full bg-terracotta text-[10px] font-extrabold text-surface">!</span>;
}

export function SubcategoryGrid({ draft, dispatch, s }: { draft: Draft; dispatch: Dispatch; s: Selectors }) {
  const cat = categoryById(draft.categoryId!);
  return (
    <div className={ui.subGrid} role="group" aria-label={`Subcategorias de ${cat.name}`}>
      {cat.subcategories!.map((sub) => {
        const info = s.subBudget(cat.id, sub.id)!;
        const selected = draft.subId === sub.id;
        const tone = toneText(info.status);
        const left = info.status === 'over' ? `! estourado em ${brl(-info.remainingCents)}` : `restam ${brl(info.remainingCents)}`;
        return (
          <button
            key={sub.id}
            type="button"
            className={ui.sub}
            aria-pressed={selected}
            aria-label={`${sub.name}, ${info.pct}% usado, ${left.replace('! ', '')}`}
            onClick={() => dispatch({ type: 'subcategory', id: sub.id })}
          >
            <span className="flex items-center justify-between gap-1 text-[13px] font-bold">
              <span className="flex min-w-0 items-center gap-[3px]">
                {selected && (
                  <span className="flex text-primary">
                    <Icon name="check_circle" size={15} filled />
                  </span>
                )}
                {sub.name}
              </span>
              <span className={cn('flex items-center gap-[3px] text-xs font-extrabold', tone)}>
                {info.status === 'alert' && <Icon name="warning" size={14} filled />}
                {info.status === 'over' && <Bang />}
                {info.pct}%
              </span>
            </span>
            <span className={cn('text-xs font-bold', tone || 'text-text-secondary')}>{left}</span>
            <BudgetBar ratio={info.ratio} status={info.status} className="mt-auto" />
          </button>
        );
      })}
    </div>
  );
}

/* ───── Linha de conta (De/Para, receita, seletor) ───── */

interface AccountRowProps {
  account: Account;
  label?: string;
  detail?: string;
  selected?: boolean;
  onClick: () => void;
}

export function AccountRow({ account, label, detail, selected, onClick }: AccountRowProps) {
  return (
    <button type="button" className={ui.row} aria-pressed={selected} aria-label={label ? `${label}: ${account.name}` : undefined} onClick={onClick}>
      {label && <span className="w-[34px] flex-none text-xs font-bold text-text-secondary">{label}</span>}
      <span className={ui.rowIcon}>
        <Icon name={account.icon} size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-[15px] font-bold">{account.name}</span>
        <span className={ui.rowDetail}>{detail ?? account.detail}</span>
      </span>
      <span className={cn('flex', selected ? 'text-primary' : 'text-text-secondary')}>
        <Icon name={selected ? 'check_circle' : 'chevron_right'} size={22} filled={selected} />
      </span>
    </button>
  );
}

export function AccountPicker({ current, s, onPick }: { current: AccountId; s: Selectors; onPick: (id: AccountId) => void }) {
  return (
    <div className={cn(ui.rows, 'mt-0')} role="group">
      {ACCOUNT_ORDER.map((id) => (
        <AccountRow key={id} account={ACCOUNTS[id]} detail={accountDetail(id, s)} selected={id === current} onClick={() => onPick(id)} />
      ))}
    </div>
  );
}

/* ───── Chips de padrões inteligentes ───── */

export function SmartChips({ draft, dispatch }: { draft: Draft; dispatch: Dispatch }) {
  const more = moreCount(draft);
  const account = ACCOUNTS[draft.accountId];
  return (
    <div className={ui.chips}>
      <button
        type="button"
        className={ui.chip}
        aria-label={`Data: ${draft.when}. Tocar para trocar`}
        onClick={() => dispatch({ type: 'toggle-when' })}
      >
        {draft.when === 'hoje' ? 'Hoje' : 'Ontem'}
      </button>
      {draft.kind === 'transferencia' ? (
        <button type="button" className={ui.chip} aria-pressed={draft.payInvoice} onClick={() => dispatch({ type: 'toggle-pay-invoice' })}>
          {draft.payInvoice && (
            <span className={ui.chipIcon}>
              <Icon name="check_circle" size={16} filled />
            </span>
          )}
          Pagar fatura
        </button>
      ) : (
        <>
          <button
            type="button"
            className={ui.chip}
            aria-label={`Conta: ${account.name}. Tocar para trocar`}
            onClick={() => dispatch({ type: 'panel', panel: 'account' })}
          >
            <span className={ui.chipIcon}>
              <Icon name={account.icon} size={16} />
            </span>
            {account.name}
          </button>
          <button
            type="button"
            className={ui.chip}
            aria-label={draft.scope === 'casa' ? 'Gasto da casa. Tocar para marcar como pessoal' : 'Gasto pessoal. Tocar para marcar como da casa'}
            onClick={() => dispatch({ type: 'toggle-scope' })}
            disabled={draft.private}
          >
            {draft.private && (
              <span className={ui.chipIcon}>
                <Icon name="lock" size={16} filled />
              </span>
            )}
            {draft.scope === 'casa' ? 'Casa' : 'Pessoal'}
          </button>
        </>
      )}
      <button
        type="button"
        className={ui.chip}
        aria-pressed={draft.panel === 'more'}
        aria-label={more ? `Mais opções, ${more} ligada${more > 1 ? 's' : ''}` : 'Mais opções'}
        onClick={() => dispatch({ type: 'panel', panel: draft.panel === 'more' ? 'categories' : 'more' })}
      >
        + Mais
        {more > 0 && (
          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-primary px-[5px] text-[11px] font-extrabold text-on-primary">
            {more}
          </span>
        )}
      </button>
    </div>
  );
}

/* ───── "+ Mais" ───── */

export function MorePanel({ draft, dispatch }: { draft: Draft; dispatch: Dispatch }) {
  const set = (patch: Extract<DraftAction, { type: 'more' }>['patch']) => dispatch({ type: 'more', patch });
  const nextInstallments = draft.installments === null ? 2 : draft.installments >= 12 ? null : draft.installments + 1;
  const isExpense = draft.kind === 'despesa';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="mb-1 flex flex-col gap-1.5">
        <label htmlFor="qe-desc" className="text-[13px] font-bold text-text-secondary">
          Descrição
        </label>
        <input
          id="qe-desc"
          value={draft.description}
          placeholder="Opcional"
          maxLength={60}
          autoComplete="off"
          onChange={(e) => set({ description: e.target.value })}
          className="h-[52px] rounded-md border border-border bg-surface px-3.5 text-base font-medium focus-visible:outline-offset-0"
        />
      </div>
      <Option
        icon="receipt"
        title="Anexar comprovante"
        detail={draft.hasReceipt ? 'foto anexada' : 'foto ou PDF'}
        checked={draft.hasReceipt}
        onClick={() => set({ hasReceipt: !draft.hasReceipt })}
      />
      {isExpense && (
        <Option
          icon="credit_card"
          title="Parcelado"
          detail={draft.installments ? `${draft.installments}× · tocar para mudar` : 'tocar para dividir'}
          checked={draft.installments !== null}
          state={draft.installments ? `${draft.installments}×` : undefined}
          onClick={() => set({ installments: nextInstallments })}
        />
      )}
      <Option
        icon="event_repeat"
        title="Repetir todo mês"
        detail="lança de novo no mesmo dia"
        checked={draft.recurring}
        onClick={() => set({ recurring: !draft.recurring })}
      />
      {isExpense && (
        <Option
          icon="lock"
          title="Meu dinheiro livre"
          detail="privado: só você vê os detalhes"
          checked={draft.private}
          inverseIcon
          onClick={() => set({ private: !draft.private })}
        />
      )}
    </div>
  );
}

interface OptionProps {
  icon: string;
  title: string;
  detail: string;
  checked: boolean;
  state?: string;
  /** Ícone invertido quando ligado (cadeado do dinheiro livre). */
  inverseIcon?: boolean;
  onClick: () => void;
}

function Option({ icon, title, detail, checked, state, inverseIcon, onClick }: OptionProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={ui.option} onClick={onClick}>
      <span className={cn(ui.rowIcon, inverseIcon && 'group-aria-checked:bg-text group-aria-checked:text-bg')}>
        <Icon name={icon} size={20} filled={checked && inverseIcon} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-[15px] font-bold">{title}</span>
        <span className="text-xs font-semibold text-text-secondary">{detail}</span>
      </span>
      <span className="text-[13px] font-extrabold text-primary">{state ?? (checked ? <Icon name="check_circle" size={22} filled /> : null)}</span>
    </button>
  );
}

/* ───── Teclado 3×4 ───── */

const KEYS: KeypadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'];

export function Keypad({ onKey, disabled, pressed }: { onKey: (k: KeypadKey) => void; disabled?: boolean; pressed?: string | null }) {
  return (
    <div className={ui.keypad} role="group" aria-label="Teclado numérico" aria-busy={disabled || undefined}>
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className={cn(ui.key, pressed === k && ui.keyPressed)}
          aria-label={k === 'del' ? 'Apagar' : undefined}
          disabled={disabled}
          onClick={() => onKey(k)}
        >
          {k === 'del' ? <Icon name="backspace" size={24} /> : k}
        </button>
      ))}
    </div>
  );
}
