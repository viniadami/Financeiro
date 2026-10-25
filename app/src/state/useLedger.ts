'use client';

import { useCallback, useMemo, useState } from 'react';
import { makeSelectors, type Entry } from './ledger';

export function useLedger(initial: Entry[] = []) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const add = useCallback((e: Entry) => setEntries((xs) => [e, ...xs]), []);
  const remove = useCallback((id: string) => setEntries((xs) => xs.filter((x) => x.id !== id)), []);
  const selectors = useMemo(() => makeSelectors(entries), [entries]);
  return { entries, add, remove, ...selectors };
}

export type Ledger = ReturnType<typeof useLedger>;
