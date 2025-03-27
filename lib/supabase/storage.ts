import { createClient } from '@/lib/supabase/client'

export type ImageBucket = 'event-images' | 'executive-images' | 'developer-images'

export async function uploadImage(file: File, bucket: ImageBucket, path: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

export async function deleteImage(bucket: ImageBucket, path: string) {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw error
  }
}

export function getImageUrl(bucket: ImageBucket, path: string) {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return publicUrl
} 