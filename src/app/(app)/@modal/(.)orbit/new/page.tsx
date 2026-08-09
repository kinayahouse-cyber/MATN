import { FournisseurForm } from '@/components/FournisseurForm';
import { SlideOver } from '@/components/SlideOver';

export default function NewFournisseurModal() {
  return (
    <SlideOver>
      <FournisseurForm />
    </SlideOver>
  );
}
