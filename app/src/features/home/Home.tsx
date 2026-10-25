import type { Ref } from 'react';
import { BudgetBar } from '@/components/BudgetBar';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Icon } from '@/components/Icon';
import { ACCOUNTS, CURRENT_USER, TODAY, categoryById, subcategoryById, type PendingBill, type Person } from '@/data/reference';
import { cn, toneText } from '@/lib/cn';
import { brl, expense } from '@/lib/money';
import { entryTitle, signedAmount, type Entry } from '@/state/ledger';
import type { Ledger } from '@/state/useLedger';

const CARD = 'rounded-card border border-border bg-surface shadow-card';
const ROW = 'grid min-h-16 grid-cols-[40px_minmax(0,1fr)_auto_44px] items-center gap-x-3 gap-y-2 py-2.5 pr-1.5 pl-3.5 [&+&]:border-t [&+&]:border-border';

interface Props {
  ledger: Ledger;
  bills: PendingBill[];
  onPayBill: (bill: PendingBill) => void;
  hidden?: boolean;
}

export function Avatar({ who, size = 36, ring }: { who: Person; size?: number; ring?: boolean }) {
  return (
    <span
      className={cn(
        'grid flex-none place-items-center rounded-full leading-none font-extrabold',
        who === 'V' ? 'bg-primary text-on-primary' : 'border-text bg-surface-subtle text-text',
        who === 'V' && ring && 'border-2 border-bg',
        who === 'P' && (size < 30 ? 'border-[1.5px]' : 'border-2'),
      )}
      style={{ width: size, height: size, fontSize: size < 30 ? 10 : 14 }}
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
    // Começa abaixo da status bar (47px) para o conteúdo não rolar por baixo dela.
    <main className="absolute inset-x-0 top-[47px] bottom-[88px] overflow-y-auto px-4 pt-[9px] pb-[120px] text-text tabular-nums" aria-hidden={hidden || undefined}>
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="m-0 mb-0.5 text-2xl leading-[1.2] font-extrabold tracking-[-0.02em]">Oi, {CURRENT_USER.name}</h1>
          <div className="text-[13px] font-semibold text-text-secondary">
            {TODAY.label} · faltam {TODAY.daysLeft} dias
          </div>
        </div>
        <div className="flex">
          <Avatar who="V" ring />
          <span className="-ml-2">
            <Avatar who="P" />
          </span>
        </div>
      </header>

      <section className={cn(CARD, 'mt-[21px] flex flex-col gap-1.5 px-5 py-[18px]')} aria-label="Pode gastar">
        <div className="text-sm font-semibold text-text-secondary">Pode gastar até {TODAY.periodEnd}</div>
        <div className="text-[42px] leading-[1.05] font-extrabold tracking-[-0.03em]">{brl(available)}</div>
        <div className="text-[13px] text-text-secondary">
          ≈ R$ {perDay}/dia · faltam {TODAY.daysLeft} dias
        </div>
        <BudgetBar ratio={v.ratio} status={v.status} className="mt-2.5" />
        <div className="mt-1 flex justify-between text-xs font-semibold text-text-secondary">
          <span>
            Variáveis: {brl(v.spentCents)} de {brl(v.limitCents)}
          </span>
          <span className="font-extrabold text-text">{v.pct}%</span>
        </div>
      </section>

      <section className={cn(CARD, 'mt-4 flex flex-col gap-2.5 px-5 py-4')} aria-label="Alimentação">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-base font-bold">
            <CategoryBadge categoryId="alimentacao" icon="restaurant" size={34} iconSize={19} radius={10} />
            Alimentação
          </span>
          <span className={cn('flex items-center gap-1 text-[15px] font-extrabold', toneText(food.status))}>
            {food.status === 'alert' && <Icon name="warning" size={17} filled />}
            {food.status === 'over' && '! '}
            {food.pct}%
          </span>
        </div>
        <BudgetBar ratio={food.ratio} status={food.status} />
        <div className="flex justify-between gap-2 text-[13px] whitespace-nowrap text-text-secondary">
          <span>
            {brl(food.spentCents)} de {brl(food.limitCents)}
          </span>
          <span className={cn('font-bold', toneText(food.status))}>
            {food.remainingCents >= 0 ? `restam ${brl(food.remainingCents)}` : `! passou ${brl(-food.remainingCents)}`}
          </span>
        </div>
      </section>

      <h2 className="mx-1 mt-[29px] mb-2.5 text-[13px] font-bold text-text-secondary">Últimos lançamentos</h2>
      <section className={cn(CARD, 'flex flex-col rounded-[20px]')}>
        {recent.length === 0 && bills.length === 0 && (
          <div className="flex flex-col items-center gap-3.5 px-6 py-9 text-lg">
            <span className="grid size-14 place-items-center rounded-[18px] bg-surface-subtle text-text-secondary">
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

function MoreButton() {
  return (
    <button type="button" className="grid size-11 place-items-center rounded-sm border-0 bg-transparent text-text-secondary hover:bg-surface-subtle" aria-label="Ações do lançamento">
      <Icon name="more_vert" size={22} />
    </button>
  );
}

const TITLE = 'line-clamp-2 text-[15px] leading-[1.3] font-bold';

function EntryRow({ entry: e }: { entry: Entry }) {
  const sub = e.categoryId ? subcategoryById(e.categoryId, e.subId) : undefined;
  const icon = e.kind === 'transferencia' ? 'swap_horiz' : (sub?.icon ?? (e.categoryId ? categoryById(e.categoryId).icon : 'south_west'));
  const where = e.kind === 'transferencia' ? 'transferência' : e.accountId ? ACCOUNTS[e.accountId].short : '';
  return (
    <div className={ROW}>
      {e.categoryId && !e.private ? (
        <CategoryBadge categoryId={e.categoryId} icon={icon} size={40} iconSize={21} radius={12} />
      ) : (
        <span className="grid size-10 place-items-center rounded-sm bg-surface-subtle">
          <Icon name={e.private ? 'lock' : icon} size={21} filled={e.private} />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-[3px]">
        <div className={TITLE}>{entryTitle(e)}</div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
          <Avatar who={e.by} size={20} />
          {where} · {e.when === 'hoje' ? 'agora' : 'ontem'}
          {e.private && (
            <span className="inline-flex h-[22px] items-center gap-1 rounded-pill bg-text px-2 text-xs font-bold text-bg">
              <Icon name="lock" size={14} filled />
              privado
            </span>
          )}
        </div>
      </div>
      <div className={cn('text-[15px] font-extrabold whitespace-nowrap', e.kind === 'receita' && 'text-primary')}>{signedAmount(e)}</div>
      <MoreButton />
    </div>
  );
}

function BillRow({ bill, onPay }: { bill: PendingBill; onPay: () => void }) {
  const cat = categoryById(bill.categoryId);
  return (
    <div className={ROW}>
      <CategoryBadge categoryId={cat.id} icon={cat.icon} size={40} iconSize={22} radius={12} />
      <div className="flex min-w-0 flex-col gap-[3px]">
        <div className={TITLE}>{bill.name}</div>
      </div>
      <div className="text-[15px] font-extrabold whitespace-nowrap text-text-secondary">{expense(bill.amountCents)}</div>
      <MoreButton />
      <div className="col-span-3 col-start-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 flex-none items-center gap-[5px] rounded-pill border-[1.5px] border-dashed border-text-secondary px-2.5 text-xs font-bold text-text-secondary">
            <Icon name="schedule" size={16} />
            previsto
          </span>
          {bill.overdueDays > 0 && <span className="text-xs font-bold text-terracotta">! atrasada há {bill.overdueDays} dias</span>}
        </div>
        <button
          type="button"
          className="mr-1 h-11 flex-none rounded-sm border-[1.5px] border-primary bg-surface px-[18px] text-sm font-extrabold text-primary hover:bg-bg-positive"
          onClick={onPay}
        >
          Pagar
        </button>
      </div>
    </div>
  );
}

const NAV = [
  { icon: 'home', label: 'Início', active: true },
  { icon: 'receipt_long', label: 'Lançamentos' },
  null,
  { icon: 'donut_large', label: 'Orçamento' },
  { icon: 'more_horiz', label: 'Mais' },
];

export function BottomNav({ onAdd, addRef, hidden }: { onAdd: () => void; addRef: Ref<HTMLButtonElement>; hidden?: boolean }) {
  return (
    <nav
      className="absolute inset-x-0 bottom-0 grid h-[88px] grid-cols-5 items-center border-t border-border bg-surface px-2 pt-1.5 pb-[22px]"
      aria-label="Principal"
      aria-hidden={hidden || undefined}
    >
      {NAV.map((it, i) =>
        it ? (
          <button
            key={it.label}
            type="button"
            aria-current={it.active ? 'page' : undefined}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-sm border-0 bg-transparent text-[11px]',
              it.active ? 'font-extrabold text-primary' : 'font-semibold text-text-secondary',
            )}
          >
            <span className={cn('grid h-[30px] place-items-center', it.active && 'w-[52px] rounded-pill bg-bg-positive')}>
              <Icon name={it.icon} size={22} filled={it.active} />
            </span>
            {it.label}
          </button>
        ) : (
          <div key={i} className="flex justify-center">
            <button
              ref={addRef}
              type="button"
              className="grid size-14 place-items-center rounded-[20px] border-0 bg-primary text-on-primary hover:bg-primary-hover active:scale-[.97] active:bg-primary-pressed"
              aria-label="Novo lançamento"
              onClick={onAdd}
            >
              <Icon name="add" size={30} />
            </button>
          </div>
        ),
      )}
    </nav>
  );
}
