import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Card principal */}
      <View style={styles.card}>
        <Text style={styles.title}>Garantías</Text>
        <Text style={styles.subtitle}>Selecciona una opción</Text>

        {/* Botón Escanear */}
        <Pressable style={styles.scanButton}>
          <Text style={styles.buttonText}>📷 Escanear</Text>
        </Pressable>

        {/* Botón Formulario */}
        <Pressable style={styles.formButton} onPress={() => router.push("/formulario")}>
          <Text style={styles.buttonText}>📝 Ir a formulario</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 320,
    paddingVertical: 30,
    paddingHorizontal: 25,
    backgroundColor: "#ffffff",
    borderRadius: 12,

    // sombra elegante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,

    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 25,
  },
  scanButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  formButton: {
    width: "100%",
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
