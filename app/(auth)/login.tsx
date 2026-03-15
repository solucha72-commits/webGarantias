import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const MAX_INTENTOS = 3;

  // Verificar sesión al cargar
  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const usuarioGuardado = sessionStorage.getItem("usuarioActual");
      if (usuarioGuardado) {
        // Ya hay sesión, ir a tabs
        // @ts-ignore
        router.replace("/(tabs)");
      } else {
        setVerificando(false);
      }
    } catch (error) {
      console.error("Error verificando sesión:", error);
      setVerificando(false);
    }
  };

  const handleLogin = async () => {
    if (!nombre.trim()) {
      Alert.alert("⚠️", "Por favor ingresa tu nombre");
      return;
    }
    if (!contraseña.trim()) {
      Alert.alert("⚠️", "Por favor ingresa tu contraseña");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("nombre", nombre.trim())
        .eq("contraseña", contraseña)
        .eq("activo", true)
        .single();

      if (error || !data) {
        const nuevosIntentos = intentos + 1;
        setIntentos(nuevosIntentos);

        if (nuevosIntentos >= MAX_INTENTOS) {
          Alert.alert("❌ Acceso Denegado", `Máximo de intentos alcanzado (${MAX_INTENTOS}). La aplicación se cerrará.`, [
            {
              text: "Salir",
              onPress: () => {
                if (Platform.OS === "web") {
                  window.close();
                }
              },
            },
          ]);
          setLoading(false);
          return;
        }

        Alert.alert("❌ Error", `Usuario o contraseña incorrectos.\nIntento ${nuevosIntentos}/${MAX_INTENTOS}`);
        setLoading(false);
        return;
      }

      if (data) {
        const sesionData = {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          loginTime: new Date().toISOString(),
        };

        sessionStorage.setItem("usuarioActual", JSON.stringify(sesionData));

        setIntentos(0);

        // @ts-ignore
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Error al conectar");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (verificando) {
    return <View style={{ flex: 1, backgroundColor: "#f0f4f8" }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.headerSection}>
          <Text style={styles.logo}>📋</Text>
          <Text style={styles.title}>Garantías</Text>
          <Text style={styles.subtitle}>Gestor de Garantías</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>👤 Nombre de Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre de usuario"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={setNombre}
              editable={!loading && intentos < MAX_INTENTOS}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>🔒 Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={contraseña}
                onChangeText={setContraseña}
                editable={!loading && intentos < MAX_INTENTOS}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} disabled={intentos >= MAX_INTENTOS}>
                <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </Pressable>
            </View>
          </View>

          {intentos > 0 && intentos < MAX_INTENTOS && (
            <View style={styles.intentosBox}>
              <Text style={styles.intentosText}>⚠️ Intentos restantes: {MAX_INTENTOS - intentos}</Text>
            </View>
          )}

          {intentos >= MAX_INTENTOS && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ Máximo de intentos alcanzado. La aplicación se cerrará.</Text>
            </View>
          )}

          <Pressable
            style={[styles.loginButton, (loading || intentos >= MAX_INTENTOS) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || intentos >= MAX_INTENTOS}
          >
            {loading ? <ActivityIndicator color="#fff" size="large" /> : <Text style={styles.loginButtonText}>🚀 Iniciar Sesión</Text>}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v2.4.3 - 2026</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoldText}>🧪 Datos de prueba:</Text>
          <Text style={styles.infoText}>Nombre: admin</Text>
          <Text style={styles.infoText}>Contraseña: admin</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  intentosBox: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    padding: 12,
    borderRadius: 8,
  },
  intentosText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f1d1d",
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 4,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  infoBox: {
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  infoBoldText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
});
