'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Track, Engagement } from '@prisma/client';

export async function createProjet(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim();
  const nom = String(formData.get('nom') ?? '').trim();
  if (!code || !nom) throw new Error('Code et nom requis');

  const organisationId = String(formData.get('organisationId') ?? '').trim() || null;
  const trackRaw = String(formData.get('track') ?? '');
  const engagementRaw = String(formData.get('engagement') ?? '');
  const description = String(formData.get('description') ?? '').trim() || null;

  const projet = await prisma.projet.create({
    data: {
      code,
      nom,
      organisationId,
      track: trackRaw ? (trackRaw as Track) : null,
      engagement: engagementRaw ? (engagementRaw as Engagement) : null,
      description,
    },
  });

  revalidatePath('/projets');
  redirect(`/projets/${projet.id}`);
}
