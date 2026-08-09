import { Sidebar } from '@/components/Sidebar';
import { StructuralLine } from '@/components/grid/StructuralLine';

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <StructuralLine direction="vertical" weight="primary" />
      <main className="min-w-0 flex-1 px-8 py-6 md:px-10">{children}</main>
      {modal}
    </div>
  );
}
