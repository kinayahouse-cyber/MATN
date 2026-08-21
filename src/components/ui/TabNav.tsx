import Link from 'next/link';

// Onglets portés par l'URL (?param=valeur) et non par un useState : un lien vers une vue
// précise reste partageable, le rafraîchissement conserve la vue, et le bouton retour du
// navigateur défait bien le changement d'onglet. À préférer à ProjectSectionTabs partout où
// la vue mérite d'être adressable.
export function TabNav({
  items,
  active,
  basePath,
  param = 'vue',
}: {
  items: { value: string; label: string }[];
  active: string;
  basePath: string;
  param?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-line pb-2">
      {items.map(({ value, label }) => {
        const isActive = value === active;
        // La première entrée est la vue par défaut : pas de paramètre dans son URL, pour que
        // /finance et /finance?vue=apercu ne soient pas deux adresses de la même page.
        const href = value === items[0].value ? basePath : `${basePath}?${param}=${value}`;
        return (
          <Link
            key={value}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-md px-2.5 py-1.5 text-xs uppercase tracking-[0.08em] transition-colors duration-fast ${
              isActive ? 'bg-line/60 text-fg' : 'text-muted hover:bg-line/30 hover:text-fg'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
