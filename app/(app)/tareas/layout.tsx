export default function TasksLayout({
  children,
  detalle,
}: Readonly<{ children: React.ReactNode; detalle: React.ReactNode }>) {
  return (
    <div className="master-detail">
      <div className="master-detail__lista">{children}</div>
      {detalle}
    </div>
  );
}
