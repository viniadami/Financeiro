import { Prototype } from '@/features/prototype/Prototype';
import { parseFrame } from '@/features/prototype/frames';

export default async function Page({ searchParams }: { searchParams: Promise<{ frame?: string | string[] }> }) {
  const frame = parseFrame((await searchParams).frame);
  // key: trocar de frame remonta o protótipo no estado daquele frame.
  return <Prototype key={frame ?? 'livre'} frame={frame} />;
}
