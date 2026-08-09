import { createClient } from '@supabase/supabase-js';

// Client service_role — bypass RLS, usage serveur uniquement (Server Actions/Components).
// Ne jamais importer depuis un composant client ni exposer la clé au navigateur.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const STORAGE_BUCKET = 'matn-files';

export async function uploadToStorage(file: File, pathPrefix: string): Promise<string> {
  const path = `${pathPrefix}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, Buffer.from(arrayBuffer), { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(`Échec de l'upload : ${error.message}`);
  return path;
}

// Les liens externes (Drive, etc.) restent stockés tels quels ; seuls les fichiers uploadés
// via MATN sont des chemins de storage nécessitant une URL signée à la demande.
export async function resolveFileUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(url, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
