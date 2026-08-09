export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 py-3 text-sm">{children}</div>;
}

export const toolbarInputClass =
  'border border-line bg-bg px-2 py-1.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-fast';
