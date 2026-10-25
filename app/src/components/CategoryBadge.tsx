import type { CategoryId } from '@/data/reference';
import { Icon } from './Icon';

interface Props {
  categoryId: CategoryId;
  icon: string;
  size: number;
  iconSize: number;
  radius: number;
}

/** Quadrado com o ícone na cor da categoria (tokens --cat-*). */
export function CategoryBadge({ categoryId, icon, size, iconSize, radius }: Props) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `var(--cat-${categoryId}-bg)`,
        color: `var(--cat-${categoryId}-icon)`,
        display: 'grid',
        placeItems: 'center',
        flex: 'none',
      }}
    >
      <Icon name={icon} size={iconSize} />
    </span>
  );
}
