type CardTone = 'plain' | 'feature' | 'sunken';

const TONES: Record<CardTone, string> = {
  plain: 'bg-surface-elevated border-border text-text shadow-soft',
  feature: 'bg-surface-feature border-transparent text-on-feature shadow-lift dark:border-border',
  sunken: 'bg-surface-sunken border-transparent text-text',
};

export function Card({
  tone = 'plain',
  as: Tag = 'div',
  className = '',
  children,
  ...props
}: {
  tone?: CardTone;
  as?: 'div' | 'article' | 'section';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-lg border p-5 ${TONES[tone]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
