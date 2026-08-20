import { FournisseurForm } from '@/components/FournisseurForm';
import { requireAdmin } from '@/lib/auth/current-user';

export default async function NewFournisseurPage() {
  await requireAdmin();
  return <FournisseurForm />;
}
