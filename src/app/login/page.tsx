export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next || '/';
  const hasError = sp.error === '1';

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="k-frame w-full max-w-sm p-8">
        <p className="mb-6 text-[32px] text-accent">،</p>
        <h1 className="mb-1 font-serif text-title text-fg">Matn</h1>
        <p className="mb-8 text-data text-fg-secondary">Accès réservé — Kinaya.</p>

        <form action="/api/auth/login" method="POST" className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="password" className="mb-2 block text-label uppercase text-fg-secondary">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="k-field w-full"
            />
          </div>
          {hasError && (
            <p className="text-data text-state-late">Mot de passe incorrect.</p>
          )}
          <button type="submit" className="k-btn k-btn--primary mt-2 w-full">
            Entrer
          </button>
        </form>
      </div>
    </main>
  );
}
