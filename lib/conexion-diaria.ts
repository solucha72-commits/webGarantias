import { supabase } from "@/lib/supabase";

/**
 * CONECTAR A SUPABASE CADA 24 HORAS
 * Úsalo donde quieras (en tu main, en App.tsx, en index.tsx)
 */

export function iniciarConexionDiaria() {
  // Conectar ahora
  conectarSupabase();

  // Conectar cada 24 horas
  setInterval(() => {
    conectarSupabase();
  }, 24 * 60 * 60 * 1000);
}

async function conectarSupabase() {
  try {
    const { data } = await supabase.from("garantias").select("id").limit(1);
    console.log("✅ Conexión Supabase OK");
  } catch (error) {
    console.log("❌ Error conexión:", error);
  }
}
