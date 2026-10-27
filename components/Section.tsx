export function Section({
  id,
  title,
  className = "",
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`container-page border-t border-line py-16 ${className}`}>
      <h2 className="mb-8 text-[1.75rem] font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
