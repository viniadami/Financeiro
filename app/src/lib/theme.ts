export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'theme';

/**
 * Roda no <head>, antes da pintura, para o modo escuro não "piscar" claro.
 * Mantenha em sincronia com paint() abaixo.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var c=localStorage.getItem('${KEY}');var d=c==='dark'||(c!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);var h=document.documentElement;h.dataset.theme=d?'dark':'light';h.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export function readTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function paint(choice: ThemeChoice) {
  const dark = choice === 'dark' || (choice === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

/** Aplica e lembra o tema escolhido. */
export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* armazenamento indisponível: só não lembra */
  }
  paint(choice);
}

/** Acompanha a troca de tema do sistema. Devolve a função para parar. */
export function watchSystemTheme() {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => paint(readTheme());
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
