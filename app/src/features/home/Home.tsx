import { BudgetBar } from '../../components/BudgetBar';
import { CategoryBadge } from '../../components/CategoryBadge';
import { Icon } from '../../components/Icon';
import {
  ACCOUNTS,
  CURRENT_USER,
  TODAY,
  categoryById,
  subcategoryById,
  type PendingBill,
  type Person,
} from '../../data/reference';
import { brl, expense } from '../../lib/money';
import { entryTitle, signedAmount, type Entry, type Ledger } from '../../state/ledger';
import './Home.css';

interface Props {
  ledger: Ledger;
  bills: PendingBill[];
  onPayBill: (bill: PendingBill) => void;
  hidden?: boolean;
}

export function Avatar({ who, size = 36 }: { who: Person; size?: number }) {
  return (
    <span
      className={`avatar avatar--${who}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-label={`Lançado por ${who === 'V' ? 'Vini' : 'Panty'}`}
    >
      {who}
    </span>
  );
}

export function Home({ ledger, bills, onPayBill, hidden }: Props) {
  const v = ledger.variable;
  const available = v.limitCents - v.spentCents;
  const perDay = Math.round(available / TODAY.daysLeft / 100);
  const food = ledger.categoryBudget('alimentacao')!;
  const recent = ledger.entries.slice(0, 5);

  return (
    <main className="home" aria-hidden={hidden || undefined}>
      <header className="home__header">
        <div>
          <h1 className="home__hello">Oi, {CURRENT_USER.name}</h1>
          <div className="home__date">
            {TODAY.label} · faltam {TODAY.daysLeft} dias
          </div>
        </div>
        <div className="home__people">
          <span className="avatar avatar--V avatar--ring">V</span>
          <span className="avatar avatar--P" style={{ marginLeft: -8 }}>
            P
          </span>
        </div>
      </header>

      <section className="card home__free" aria-label="Pode gastar">
        <div className="home__label">Pode gastar até {TODAY.periodEnd}</div>
        <div className="home__value">{brl(available)}</div>
        <div className="home__sub">
          ≈ R$ {perDay}/dia · faltam {TODAY.daysLeft} dias
        </div>
        <BudgetBar ratio={v.ratio} status={v.status} className="home__bar" />
        <div className="home__bar-legend">
          <span>
            Variáveis: {brl(v.spentCents)} de {brl(v.limitCents)}
          </span>
          <span className="home__pct">{v.pct}%</span>
        </div>
      </section>

      <section className="card home__cat" aria-label="Alimentação">
        <div className="home__cat-head">
          <span className="home__cat-name">
            <CategoryBadge categoryId="alimentacao" icon="restaurant" size={34} iconSize={19} radius={10} />
            Alimentação
          </span>
          <span className={`home__cat-pct${food.status === 'ok' ? '' : ` is-${food.status}-text`}`}>
            {food.status === 'alert' && <Icon name="warning" size={17} filled />}
            {food.status === 'over' && '! '}
            {food.pct}%
          </span>
        </div>
        <BudgetBar ratio={food.ratio} status={food.status} />
        <div className="home__cat-foot">
          <span>
            {brl(food.spentCents)} de {brl(food.limitCents)}
          </span>
          <span className={`home__cat-left${food.status === 'ok' ? '' : ` is-${food.status}-text`}`}>
            {food.remainingCents >= 0 ? `restam ${brl(food.remainingCents)}` : `! passou ${brl(-food.remainingCents)}`}
          </span>
        </div>
      </section>

      <h2 className="home__section">Últimos lançamentos</h2>
      <section className="card home__list">
        {recent.length === 0 && bills.length === 0 && (
          <div className="home__empty">
            <span>
              <Icon name="receipt_long" size={28} />
            </span>
            <strong>Nenhum lançamento ainda</strong>
          </div>
        )}
        {recent.map((e) => (
          <EntryRow key={e.id} entry={e} />
        ))}
        {bills.map((b) => (
          <BillRow key={b.id} bill={b} onPay={() => onPayBill(b)} />
        ))}
      </section>
    </main>
  );
}

function EntryRow({ entry: e }: { entry: Entry }) {
  const sub = e.categoryId ? subcategoryById(e.categoryId, e.subId) : undefined;
  const icon = e.kind === 'transferencia' ? 'swap_horiz' : sub?.icon ?? (e.categoryId ? categoryById(e.categoryId).icon : 'south_west');
  const where = e.kind === 'transferencia' ? 'transferência' : e.accountId ? ACCOUNTS[e.accountId].short : '';
  return (
    <div className="row">
      {e.categoryId && !e.private ? (
        <CategoryBadge categoryId={e.categoryId} icon={icon} size={40} iconSize={21} radius={12} />
      ) : (
        <span className="row__icon">
          <Icon name={e.private ? 'lock' : icon} size={21} filled={e.private} />
        </span>
      )}
      <div className="row__text">
        <div className="row__title">{entryTitle(e)}</div>
        <div className="row__meta">
          <Avatar who={e.by} size={20} />
          {where} · {e.when === 'hoje' ? 'agora' : 'ontem'}
          {e.private && (
            <span className="seal seal--private">
              <Icon name="lock" size={14} filled />
              privado
            </span>
          )}
        </div>
      </div>
      <div className={`row__amount${e.kind === 'receita' ? ' is-income' : ''}`}>{signedAmount(e)}</div>
      <button type="button" className="row__more" aria-label="Ações do lançamento">
        <Icon name="more_vert" size={22} />
      </button>
    </div>
  );
}

function BillRow({ bill, onPay }: { bill: PendingBill; onPay: () => void }) {
  const cat = categoryById(bill.categoryId);
  return (
    <div className="row row--bill">
      <CategoryBadge categoryId={cat.id} icon={cat.icon} size={40} iconSize={22} radius={12} />
      <div className="row__text">
        <div className="row__title">{bill.name}</div>
      </div>
      <div className="row__amount is-planned">{expense(bill.amountCents)}</div>
      <button type="button" className="row__more" aria-label="Ações do lançamento">
        <Icon name="more_vert" size={22} />
      </button>
      <div className="row__bill-foot">
        <div className="row__bill-tags">
          <span className="seal seal--planned">
            <Icon name="schedule" size={16} />
            previsto
          </span>
          {bill.overdueDays > 0 && <span className="is-over-text row__late">! atrasada há {bill.overdueDays} dias</span>}
        </div>
        <button type="button" className="row__pay" onClick={onPay}>
          Pagar
        </button>
      </div>
    </div>
  );
}

export function BottomNav({ onAdd, addRef, hidden }: { onAdd: () => void; addRef: React.Ref<HTMLButtonElement>; hidden?: boolean }) {
  const items = [
    { icon: 'home', label: 'Início', active: true },
    { icon: 'receipt_long', label: 'Lançamentos' },
    null,
    { icon: 'donut_large', label: 'Orçamento' },
    { icon: 'more_horiz', label: 'Mais' },
  ];
  return (
    <nav className="nav" aria-label="Principal" aria-hidden={hidden || undefined}>
      {items.map((it, i) =>
        it ? (
          <button key={it.label} type="button" className={`nav__item${it.active ? ' is-active' : ''}`} aria-current={it.active ? 'page' : undefined}>
            <span className="nav__icon">
              <Icon name={it.icon} size={22} filled={it.active} />
            </span>
            {it.label}
          </button>
        ) : (
          <div key={i} className="nav__add-wrap">
            <button ref={addRef} type="button" className="nav__add" aria-label="Novo lançamento" onClick={onAdd}>
              <Icon name="add" size={30} />
            </button>
          </div>
        ),
      )}
    </nav>
  );
}
