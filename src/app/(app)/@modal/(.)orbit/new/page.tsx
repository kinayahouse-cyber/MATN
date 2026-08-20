import { FournisseurForm } from '@/components/FournisseurForm';
import { SlideOver } from '@/components/SlideOver';
import { requireAdmin } from '@/lib/auth/current-user';

export default async function NewFournisseurModal() {
  await requireAdmin();
  return (
    <SlideOver>
      <FournisseurForm />
    </SlideOver>
  );
}
