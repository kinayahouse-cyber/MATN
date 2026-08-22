// Marque MATN — étincelle à 8 branches (deux étincelles à 4 branches superposées, la seconde
// tournée de 45° et atténuée), dans l'esprit du repère graphique fourni en référence.

type Props = { className?: string };

const BRANCHE =
  'M12 2C12 2 12.8 9.2 14.5 10.9C16.2 12.6 22 12 22 12C22 12 16.2 12.6 14.5 14.5C12.8 16.4 12 22 12 22C12 22 11.2 16.4 9.5 14.5C7.8 12.6 2 12 2 12C2 12 7.8 12.6 9.5 10.9C11.2 9.2 12 2 12 2Z';

export function IconMarque({ className = 'h-4 w-4' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path d={BRANCHE} />
      <path d={BRANCHE} opacity="0.55" transform="rotate(45 12 12)" />
    </svg>
  );
}
