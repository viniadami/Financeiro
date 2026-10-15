export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function paint(choice: ThemeChoice) {
  const dark = choice === 'dark' || (choice === 'system' && media.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

/** Aplica (e lembra) o tema. Sem argumento, reaplica a escolha salva. */
export function applyTheme(choice: ThemeChoice = read()): ThemeChoice {
  try {
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* armazenamento indisponível: só não lembra */
  }
  paint(choice);
  return choice;
}

media.addEventListener('change', () => paint(read()));
