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
      {/* pb-20 : dégage la barre d'onglets fixe en bas sur mobile (voir Sidebar/MobileTabBar) */}
      <main className="min-w-0 flex-1 px-4 pb-20 pt-6 md:px-10 md:pb-6">{children}</main>
      {modal}
    </div>
  );
}
