/** Junta classes, ignorando as falsas. */
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

/** Cor do texto para cada estado de orçamento (nunca o único sinal: sempre há ícone ou texto). */
export const toneText = (status: 'ok' | 'alert' | 'over') =>
  status === 'alert' ? 'text-amber-text' : status === 'over' ? 'text-terracotta' : '';
