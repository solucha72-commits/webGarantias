import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatFecha } from "@/lib/utils/date";

export default function GarantiaDetalle() {
  const { id } = useLocalSearchParams();
  const [g, setG] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("garantias")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setG(data));
  }, [id]);

  if (!g) return <Text style={{ padding: 20 }}>Cargando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalle garantía</Text>

      <Item label="Tipo" value={g.tipo} />
      <Item label="Marca" value={g.marca} />
      <Item label="Modelo" value={g.modelo} />
      <Item label="Importe" value={`${g.importe} €`} />
      <Item label="Duración" value={g.duracion_garantia} />
      <Item label="Compra" value={formatFecha(g.fechacompra)} />
      <Item label="Centro" value={g.centro_compra} />
      <Item label="Correo" value={g.correo_electronico} />
      <Item label="Observaciones" value={g.observaciones} />

      <Text style={styles.back} onPress={() => router.back()}>
        ← Volver
      </Text>
    </View>
  );
}

function Item({ label, value }: any) {
  return (
    <Text style={styles.row}>
      <Text style={styles.label}>{label}: </Text>
      {value ?? "-"}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },
  row: { fontSize: 15, marginBottom: 6 },
  label: { fontWeight: "600" },
  back: { marginTop: 20, color: "#2563eb", textAlign: "center" },
});
