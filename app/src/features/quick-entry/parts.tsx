import { BudgetBar } from '../../components/BudgetBar';
import { CategoryBadge } from '../../components/CategoryBadge';
import { Icon } from '../../components/Icon';
import {
  ACCOUNTS,
  ACCOUNT_ORDER,
  CATEGORIES,
  TOP_CATEGORIES,
  categoryById,
  type Account,
  type AccountId,
} from '../../data/reference';
import type { BudgetInfo } from '../../lib/budget';
import { brl, type KeypadKey } from '../../lib/money';
import { accountDetail, type Selectors } from '../../state/ledger';
import { moreCount, type Draft, type DraftAction } from './draft';

type Dispatch = (a: DraftAction) => void;

/* ───── Categorias (A) ───── */

export function CategoryGrid({ draft, dispatch, all }: { draft: Draft; dispatch: Dispatch; all?: boolean }) {
  const ids = all ? CATEGORIES.map((c) => c.id) : TOP_CATEGORIES;
  return (
    <div className="qe-cat-grid" role="group" aria-label="Categoria">
      {ids.map((id) => {
        const cat = categoryById(id);
        const selected = draft.categoryId === id;
        return (
          <button
            key={id}
            type="button"
            className="qe-tile"
            aria-pressed={selected}
            onClick={() => dispatch({ type: 'category', id })}
          >
            <CategoryBadge categoryId={id} icon={cat.icon} size={26} iconSize={17} radius={8} />
            {cat.name}
            {selected && (
              <span className="qe-tile__check">
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

export function StatusLabel({ info, size = 13 }: { info: BudgetInfo; size?: number }) {
  const text = info.remainingCents >= 0 ? `restam ${brl(info.remainingCents)}` : `! passou ${brl(-info.remainingCents)}`;
  return (
    <span className={`qe-status${info.status === 'ok' ? '' : ` is-${info.status}-text`}`} style={{ fontSize: size }}>
      {info.status === 'alert' && <Icon name="warning" size={16} filled />}
      {info.pct}% · {text}
    </span>
  );
}

export function SubcategoryGrid({ draft, dispatch, s }: { draft: Draft; dispatch: Dispatch; s: Selectors }) {
  const cat = categoryById(draft.categoryId!);
  return (
    <div className="qe-sub-grid" role="group" aria-label={`Subcategorias de ${cat.name}`}>
      {cat.subcategories!.map((sub) => {
        const info = s.subBudget(cat.id, sub.id)!;
        const selected = draft.subId === sub.id;
        const tone = info.status === 'ok' ? '' : ` is-${info.status}-text`;
        const left =
          info.status === 'over' ? `! estourado em ${brl(-info.remainingCents)}` : `restam ${brl(info.remainingCents)}`;
        return (
          <button
            key={sub.id}
            type="button"
            className="qe-sub"
            aria-pressed={selected}
            aria-label={`${sub.name}, ${info.pct}% usado, ${left.replace('! ', '')}`}
            onClick={() => dispatch({ type: 'subcategory', id: sub.id })}
          >
            <span className="qe-sub__top">
              <span className="qe-sub__name">
                {selected && (
                  <span>
                    <Icon name="check_circle" size={15} filled />
                  </span>
                )}
                {sub.name}
              </span>
              <span className={`qe-sub__pct${tone}`}>
                {info.status === 'alert' && <Icon name="warning" size={14} filled />}
                {info.status === 'over' && <span className="qe-bang">!</span>}
                {info.pct}%
              </span>
            </span>
            <span className={`qe-sub__left${tone}`}>{left}</span>
            <BudgetBar ratio={info.ratio} status={info.status} />
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
  chevron?: boolean;
  onClick: () => void;
}

export function AccountRow({ account, label, detail, selected, chevron = true, onClick }: AccountRowProps) {
  return (
    <button
      type="button"
      className="qe-row"
      aria-pressed={selected}
      aria-label={label ? `${label}: ${account.name}` : undefined}
      onClick={onClick}
    >
      {label && <span className="qe-row__label">{label}</span>}
      <span className="qe-row__icon">
        <Icon name={account.icon} size={20} />
      </span>
      <span className="qe-row__text">
        <span className="qe-row__title">{account.name}</span>
        <span className="qe-row__detail">{detail ?? account.detail}</span>
      </span>
      {chevron && (
        <span className="qe-row__chevron">
          <Icon name={selected ? 'check_circle' : 'chevron_right'} size={22} filled={selected} />
        </span>
      )}
    </button>
  );
}

export function AccountPicker({ current, s, onPick }: { current: AccountId; s: Selectors; onPick: (id: AccountId) => void }) {
  return (
    <div className="qe-rows" role="group" style={{ marginTop: 0 }}>
      {ACCOUNT_ORDER.map((id) => (
        <AccountRow
          key={id}
          account={ACCOUNTS[id]}
          detail={accountDetail(id, s)}
          selected={id === current}
          onClick={() => onPick(id)}
        />
      ))}
    </div>
  );
}

/* ───── Chips de padrões inteligentes ───── */

export function SmartChips({ draft, dispatch }: { draft: Draft; dispatch: Dispatch }) {
  const more = moreCount(draft);
  const account = ACCOUNTS[draft.accountId];
  return (
    <div className="qe-chips">
      <button
        type="button"
        className="qe-chip"
        aria-label={`Data: ${draft.when === 'hoje' ? 'hoje' : 'ontem'}. Tocar para trocar`}
        onClick={() => dispatch({ type: 'toggle-when' })}
      >
        {draft.when === 'hoje' ? 'Hoje' : 'Ontem'}
      </button>
      {draft.kind === 'transferencia' ? (
        <button
          type="button"
          className="qe-chip"
          aria-pressed={draft.payInvoice}
          onClick={() => dispatch({ type: 'toggle-pay-invoice' })}
        >
          {draft.payInvoice && (
            <span>
              <Icon name="check_circle" size={16} filled />
            </span>
          )}
          Pagar fatura
        </button>
      ) : (
        <>
          <button
            type="button"
            className="qe-chip"
            aria-label={`Conta: ${account.name}. Tocar para trocar`}
            onClick={() => dispatch({ type: 'panel', panel: 'account' })}
          >
            <span>
              <Icon name={account.icon} size={16} />
            </span>
            {account.name}
          </button>
          <button
            type="button"
            className="qe-chip"
            aria-label={draft.scope === 'casa' ? 'Gasto da casa. Tocar para marcar como pessoal' : 'Gasto pessoal. Tocar para marcar como da casa'}
            onClick={() => dispatch({ type: 'toggle-scope' })}
            disabled={draft.private}
          >
            {draft.private && (
              <span>
                <Icon name="lock" size={16} filled />
              </span>
            )}
            {draft.scope === 'casa' ? 'Casa' : 'Pessoal'}
          </button>
        </>
      )}
      <button
        type="button"
        className="qe-chip"
        aria-pressed={draft.panel === 'more'}
        aria-label={more ? `Mais opções, ${more} ligada${more > 1 ? 's' : ''}` : 'Mais opções'}
        onClick={() => dispatch({ type: 'panel', panel: draft.panel === 'more' ? 'categories' : 'more' })}
      >
        + Mais
        {more > 0 && <span className="qe-chip__count">{more}</span>}
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
    <div className="qe-options">
      <div className="qe-field">
        <label htmlFor="qe-desc">Descrição</label>
        <input
          id="qe-desc"
          value={draft.description}
          placeholder="Opcional"
          maxLength={60}
          autoComplete="off"
          onChange={(e) => set({ description: e.target.value })}
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
          className="is-private"
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
  className?: string;
  onClick: () => void;
}

function Option({ icon, title, detail, checked, state, className, onClick }: OptionProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={['qe-option', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <span className="qe-row__icon">
        <Icon name={icon} size={20} filled={checked && icon === 'lock'} />
      </span>
      <span className="qe-option__text">
        <span className="qe-option__title">{title}</span>
        <span className="qe-option__detail">{detail}</span>
      </span>
      <span className="qe-option__state">{state ?? (checked ? <Icon name="check_circle" size={22} filled /> : null)}</span>
    </button>
  );
}

/* ───── Teclado 3×4 ───── */

const KEYS: KeypadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'];

export function Keypad({ onKey, disabled, pressed }: { onKey: (k: KeypadKey) => void; disabled?: boolean; pressed?: string | null }) {
  return (
    <div className="qe-keypad" role="group" aria-label="Teclado numérico" aria-busy={disabled || undefined}>
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className={`qe-key${pressed === k ? ' is-pressed' : ''}`}
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
