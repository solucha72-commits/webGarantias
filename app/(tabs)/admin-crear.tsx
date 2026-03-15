import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminCrearScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.onclick = handleCrear;
    }
  }, [nombre, email, password, passwordConfirm]);

  const handleCrear = () => {
    console.log("BOTON PRESIONADO");

    if (!nombre.trim()) {
      alert("El nombre de usuario no puede estar vacio");
      return;
    }

    if (!email.trim()) {
      alert("El email no puede estar vacio");
      return;
    }

    if (!password.trim()) {
      alert("La password no puede estar vacia");
      return;
    }

    if (password !== passwordConfirm) {
      alert("Las passwords no coinciden");
      return;
    }

    if (confirm(`Crear nuevo usuario?\n\nNombre: ${nombre}\nEmail: ${email}`)) {
      crearUsuario();
    }
  };

  const crearUsuario = async () => {
    setLoading(true);
    try {
      console.log("Insertando usuario:", { nombre, email, password });

      const { data, error } = await supabase.from("usuarios").insert([
        {
          nombre: nombre.trim(),
          email: email.trim(),
          contraseña: password,
          activo: true,
        },
      ]);

      console.log("Respuesta:", { data, error });

      if (error) {
        if (error.message.includes("unique")) {
          alert("Error: El nombre de usuario ya existe");
        } else {
          alert("Error: " + error.message);
        }
        setLoading(false);
        return;
      }

      alert("Usuario creado correctamente!");
      setNombre("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      router.back();
    } catch (err: any) {
      alert("Error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>➕ Crear Nuevo Usuario</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre de Usuario:</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="nombre de usuario" editable={!loading} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email:</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@test.com" editable={!loading} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry editable={!loading} />
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
            {loading ? "Creando..." : "✅ Crear Usuario"}
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
});
