import { Sidebar } from '@/components/Sidebar';
import { getCurrentRole } from '@/lib/auth/current-user';

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const role = await getCurrentRole();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="min-w-0 flex-1 px-8 py-6 md:px-10">{children}</main>
      {modal}
    </div>
  );
}
