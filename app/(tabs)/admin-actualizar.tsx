import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminActualizarScreen() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (buttonRef.current && !loading) {
      buttonRef.current.onclick = handleGuardar;
    }
  }, [nombre, email, passwordActual, passwordNueva, passwordConfirm, loading]);

  const cargarDatos = async () => {
    try {
      const usuario = sessionStorage.getItem("usuarioActual");
      if (usuario) {
        const parsed = JSON.parse(usuario);
        setUsuarioActual(parsed);

        const { data } = await supabase.from("usuarios").select("*").eq("id", parsed.id).single();

        if (data) {
          setNombre(data.nombre || "");
          setEmail(data.email || "");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    console.log("Guardando cambios...");

    if (!nombre.trim()) {
      alert("El nombre no puede estar vacio");
      return;
    }

    if (!email.trim()) {
      alert("El email no puede estar vacio");
      return;
    }

    if (passwordNueva && !passwordActual) {
      alert("Debes ingresar tu password actual para cambiarla");
      return;
    }

    if (passwordNueva && passwordNueva !== passwordConfirm) {
      alert("Las passwords nuevas no coinciden");
      return;
    }

    if (passwordNueva) {
      const { data } = await supabase.from("usuarios").select("contraseña").eq("id", usuarioActual.id).single();

      if (!data || data.contraseña !== passwordActual) {
        alert("Password actual incorrecta");
        return;
      }
    }

    let cambios = [];
    if (nombre !== usuarioActual.nombre) cambios.push(`Nombre: "${usuarioActual.nombre}" -> "${nombre}"`);
    if (email !== usuarioActual.email) cambios.push(`Email: "${usuarioActual.email}" -> "${email}"`);
    if (passwordNueva) cambios.push(`Password: sera actualizada`);

    if (cambios.length === 0) {
      alert("No hay cambios para guardar");
      return;
    }

    const mensaje = "Confirmas estos cambios?\n\n" + cambios.join("\n");

    if (confirm(mensaje)) {
      guardarCambios();
    }
  };

  const guardarCambios = async () => {
    setLoading(true);
    try {
      const updates: any = {
        nombre,
        email,
      };

      if (passwordNueva) {
        updates.contraseña = passwordNueva;
      }

      const { error } = await supabase.from("usuarios").update(updates).eq("id", usuarioActual.id);

      if (error) {
        alert("Error: " + error.message);
        setLoading(false);
        return;
      }

      const usuarioActualizado = {
        ...usuarioActual,
        nombre,
        email,
      };
      sessionStorage.setItem("usuarioActual", JSON.stringify(usuarioActualizado));

      alert("Cambios guardados correctamente");
      router.back();
    } catch (err: any) {
      alert("Error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
        <View style={styles.screen}>
          <View style={styles.card}>
            <Text>Cargando...</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Actualizar Perfil</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre de Usuario:</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre de usuario" editable={!loading} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Cambiar Contraseña (opcional)</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contraseña Actual:</Text>
            <TextInput
              style={styles.input}
              value={passwordActual}
              onChangeText={setPasswordActual}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nueva Contraseña:</Text>
            <TextInput
              style={styles.input}
              value={passwordNueva}
              onChangeText={setPasswordNueva}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmar Contraseña:</Text>
            <TextInput
              style={styles.input}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <button
            ref={buttonRef}
            disabled={loading}
            style={
              {
                backgroundColor: "#10b981",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "16px",
                width: "100%",
                opacity: loading ? 0.6 : 1,
              } as any
            }
          >
            {loading ? "Guardando..." : "✅ Guardar Cambios"}
          </button>

          <button
            onClick={() => router.back()}
            disabled={loading}
            style={
              {
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #ef4444",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
                width: "100%",
                opacity: loading ? 0.6 : 1,
              } as any
            }
          >
            ❌ Cancelar
          </button>

          <button
            onClick={() => router.replace("/(tabs)")}
            disabled={loading}
            style={
              {
                backgroundColor: "#6b7280",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
                width: "100%",
                opacity: loading ? 0.6 : 1,
              } as any
            }
          >
            🏠 Volver al Menú Principal
          </button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  screen: {
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },
});
