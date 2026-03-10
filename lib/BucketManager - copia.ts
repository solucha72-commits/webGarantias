import { supabase } from "./supabase";

/**
 * BucketManager.ts
 * Maneja subida y lectura de archivos con fallback a múltiples buckets
 */

const BUCKETS_PRIORIDAD = ["garantias", "garantias1", "garantias2", "garantias3", "garantias4"];

/**
 * SUBIR archivo a buckets con fallback
 * Intenta garantias → garantias1 → garantias2 → etc.
 * @returns { bucketUsado: string, nombreArchivo: string } | null
 */
export async function subirArchivoConFallback(
  archivo: Blob,
  nombreArchivo: string
): Promise<{ bucketUsado: string; nombreArchivo: string } | null> {
  console.log(`📤 Intentando subir: ${nombreArchivo}`);

  for (const bucket of BUCKETS_PRIORIDAD) {
    try {
      console.log(`  → Intentando bucket: ${bucket}`);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(`pdf/${nombreArchivo}`, archivo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.warn(`  ❌ ${bucket} falló: ${error.message}`);
        continue;
      }

      console.log(`  ✅ Subido a ${bucket}`);
      return { bucketUsado: bucket, nombreArchivo };
    } catch (e) {
      console.warn(`  ❌ Error en ${bucket}:`, e);
      continue;
    }
  }

  console.error("❌ Fallaron todos los buckets");
  return null;
}

/**
 * OBTENER URL pública del PDF con búsqueda en todos los buckets
 * @returns URL pública si existe, null si no encuentra
 */
export async function obtenerUrlPdfConFallback(
  nombreArchivo: string
): Promise<string | null> {
  console.log(`🔍 Buscando PDF: ${nombreArchivo}`);

  for (const bucket of BUCKETS_PRIORIDAD) {
    try {
      console.log(`  → Buscando en bucket: ${bucket}`);

      // Verificar que el archivo existe
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("pdf", {
          limit: 10000,
        });

      if (error) {
        console.warn(`  ❌ Error listando ${bucket}: ${error.message}`);
        continue;
      }

      // Buscar el archivo en la lista
      const existe = data?.some((f) => f.name === nombreArchivo);

      if (existe) {
        const url = supabase.storage
          .from(bucket)
          .getPublicUrl(`pdf/${nombreArchivo}`).data.publicUrl;

        console.log(`  ✅ Encontrado en ${bucket}`);
        return url;
      }

      console.warn(`  ❌ No existe en ${bucket}`);
    } catch (e) {
      console.warn(`  ❌ Error en ${bucket}:`, e);
      continue;
    }
  }

  console.error(`❌ Archivo no encontrado en ningún bucket: ${nombreArchivo}`);
  return null;
}

/**
 * VERIFICAR si un PDF existe en cualquier bucket
 */
export async function existePdfEnAlgunBucket(
  nombreArchivo: string
): Promise<boolean> {
  for (const bucket of BUCKETS_PRIORIDAD) {
    try {
      const { data } = await supabase.storage
        .from(bucket)
        .list("pdf", {
          limit: 10000,
        });

      if (data?.some((f) => f.name === nombreArchivo)) {
        return true;
      }
    } catch (e) {
      continue;
    }
  }
  return false;
}

/**
 * DESCARGAR archivo desde cualquier bucket
 */
export async function descargarPdfConFallback(
  nombreArchivo: string
): Promise<Blob | null> {
  console.log(`⬇️ Descargando PDF: ${nombreArchivo}`);

  for (const bucket of BUCKETS_PRIORIDAD) {
    try {
      console.log(`  → Intentando bucket: ${bucket}`);

      const { data, error } = await supabase.storage
        .from(bucket)
        .download(`pdf/${nombreArchivo}`);

      if (error) {
        console.warn(`  ❌ ${bucket} falló: ${error.message}`);
        continue;
      }

      console.log(`  ✅ Descargado de ${bucket}`);
      return data;
    } catch (e) {
      console.warn(`  ❌ Error en ${bucket}:`, e);
      continue;
    }
  }

  console.error(`❌ No se pudo descargar: ${nombreArchivo}`);
  return null;
}
