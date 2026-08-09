'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function SlideOver({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-6 shadow-xl">
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-200"
          aria-label="Fermer"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
