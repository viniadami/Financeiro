/** Classes compartilhadas pelas peças do sheet (equivalem às medidas do P1). */

const SELECTED = 'aria-pressed:border-2 aria-pressed:border-primary aria-pressed:bg-bg-positive';
const PRESS = 'transition-transform duration-75 active:scale-[.97]';

export const ui = {
  sectionHead: 'flex h-7 flex-none items-center justify-between',
  sectionLabel: 'text-[13px] font-bold text-text-secondary',
  link: '-mr-2.5 flex h-11 items-center gap-0.5 border-0 bg-transparent pl-2.5 pr-1.5 text-sm font-bold text-primary',
  back: '-ml-2.5 flex h-11 items-center border-0 bg-transparent pl-1 pr-2.5 text-sm font-extrabold',

  catGrid: 'mt-2 grid flex-none auto-rows-[60px] grid-cols-4 gap-1.5',
  tile: `relative flex flex-col items-center justify-center gap-[3px] rounded-md border border-border bg-surface px-0.5 py-1 text-center text-[11px] leading-3 font-bold hover:border-primary ${PRESS} ${SELECTED}`,

  subGrid: 'mt-2 grid flex-none auto-rows-[64px] grid-cols-2 gap-1.5',
  // Selecionado: borda de 2px com padding 1px menor, para o conteúdo não pular.
  sub: `flex flex-col justify-start gap-0.5 rounded-md border border-border bg-surface px-2.5 pt-[7px] pb-2.5 text-left hover:border-primary ${PRESS} ${SELECTED} aria-pressed:px-[9px] aria-pressed:pt-1.5 aria-pressed:pb-[9px]`,

  rows: 'mt-2 grid flex-none auto-rows-[60px] gap-1.5',
  row: `flex items-center gap-2.5 rounded-md border border-border bg-surface pl-3 pr-2 text-left hover:border-primary ${SELECTED} aria-pressed:pl-[11px] aria-pressed:pr-[7px]`,
  rowIcon: 'grid size-9 flex-none place-items-center rounded-[11px] bg-surface-subtle',
  rowDetail: 'truncate text-xs font-semibold text-text-secondary',

  chips: '-mx-4 mt-2.5 flex h-11 flex-none gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  chip: `group flex h-11 flex-none items-center gap-1 whitespace-nowrap rounded-pill border border-border bg-surface px-[11px] text-[13px] font-semibold ${PRESS} ${SELECTED} aria-pressed:px-2.5 aria-pressed:font-extrabold`,
  chipIcon: 'flex text-text-secondary group-aria-pressed:text-primary',

  option:
    'group flex min-h-14 items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-left aria-checked:border-2 aria-checked:border-primary aria-checked:bg-bg-positive aria-checked:px-[11px] aria-checked:py-[7px]',

  keypad: 'mt-2.5 grid flex-none auto-rows-[56px] grid-cols-3 gap-x-1.5 gap-y-1 short:auto-rows-[48px]',
  key: 'grid h-14 place-items-center rounded-[14px] border-0 bg-surface-subtle text-2xl font-semibold transition-transform duration-[60ms] hover:bg-hover active:scale-95 active:bg-key-pressed disabled:transform-none disabled:bg-surface-subtle disabled:text-text-secondary short:h-12',
  keyPressed: 'scale-95 bg-key-pressed',
};
