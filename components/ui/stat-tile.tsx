export function StatTile({
  value,
  label,
  tone = 'plain',
  icon,
}: {
  value: string;
  label: string;
  tone?: 'plain' | 'feature';
  icon?: React.ReactNode;
}) {
  const feature = tone === 'feature';

  return (
    <div
      className={`flex flex-col gap-1 rounded-md border p-4 ${
        feature
          ? 'border-transparent bg-surface-feature text-on-feature dark:border-border'
          : 'border-border bg-surface-elevated text-text'
      }`}
    >
      {icon && (
        <span className={feature ? 'text-positive' : 'text-accent'}>{icon}</span>
      )}
      <span className="text-title">{value}</span>
      <span
        className={`text-caption uppercase ${
          feature ? 'text-on-feature-soft' : 'text-text-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
