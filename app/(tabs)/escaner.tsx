import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "../../lib/supabase";

export default function Escaner() {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState(false);
  const [documentoCapturado, setDocumentoCapturado] = useState<any>(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  // ========== FUNCIÓN: Escanear/Seleccionar documento ==========
  const handleEscanearDocumento = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setSubiendo(true);
      const archivo = result.assets[0];
      const nombreUnico = `${Date.now()}_${archivo.name}`;

      let fileBody;
      const res = await fetch(archivo.uri);
      fileBody = await res.blob();

      const { error } = await supabase.storage.from("garantias").upload(nombreUnico, fileBody);
      if (error) throw error;

      setDocumentoCapturado({
        nombre: archivo.name,
        nombreUnico: nombreUnico,
        tipo: archivo.mimeType,
      });

      alert("✅ Documento capturado exitosamente");
      setModalConfirmacion(true);
    } catch (error: any) {
      alert("❌ Error al capturar documento: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  // ========== IR A ALTAS CON DOCUMENTO ==========
  const handleIrAAltas = () => {
    if (documentoCapturado) {
      // Pasar el nombre del archivo a través de los parámetros de ruta
      router.push({
        pathname: "/altas",
        params: { documento: documentoCapturado.nombreUnico },
      });
    } else {
      alert("⚠️ Por favor captura un documento primero");
    }
  };

  // ========== CANCELAR ==========
  const handleCancelar = () => {
    setDocumentoCapturado(null);
    setModalConfirmacion(false);
  };

  return (
    <View style={styles.container}>
      {/* ========== ENCABEZADO ==========  */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Escanear Ticket</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* ========== CONTENIDO PRINCIPAL ==========  */}
      <View style={styles.content}>
        {!documentoCapturado ? (
          <>
            {/* Estado: Sin documento */}
            <View style={styles.emptyState}>
              <Text style={styles.iconLarge}>
                {Platform.OS === "web" ? "📁" : "📸"}
              </Text>
              <Text style={styles.emptyTitle}>
                {Platform.OS === "web"
                  ? "Selecciona un documento"
                  : "Captura una foto del ticket"}
              </Text>
              <Text style={styles.emptySubtext}>
                {Platform.OS === "web"
                  ? "Elige un archivo de tu PC (PDF, imagen, etc.)"
                  : "Abre tu cámara para fotografiar el ticket o recibo"}
              </Text>
            </View>

            {/* Botón escanear */}
            <Pressable
              style={[styles.scanButton, subiendo && styles.buttonDisabled]}
              onPress={handleEscanearDocumento}
              disabled={subiendo}
            >
              {subiendo ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Text style={styles.scanButtonIcon}>
                    {Platform.OS === "web" ? "📁" : "📸"}
                  </Text>
                  <Text style={styles.scanButtonText}>
                    {Platform.OS === "web"
                      ? "Seleccionar Archivo"
                      : "Abrir Cámara"}
                  </Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <>
            {/* Estado: Documento capturado */}
            <View style={styles.successState}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>¡Documento Capturado!</Text>
              <View style={styles.documentoInfo}>
                <Text style={styles.documentoLabel}>Archivo:</Text>
                <Text style={styles.documentoNombre}>{documentoCapturado.nombre}</Text>
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonGroup}>
              <Pressable
                style={styles.continueButton}
                onPress={handleIrAAltas}
              >
                <Text style={styles.continueButtonText}>Continuar con el Registro</Text>
              </Pressable>

              <Pressable
                style={styles.recaptureButton}
                onPress={handleCancelar}
              >
                <Text style={styles.recaptureButtonText}>Capturar Otro</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* ========== INFO FOOTER ==========  */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {documentoCapturado
            ? "Documento listo para el registro"
            : "Los archivos se guardan de forma segura"}
        </Text>

        {/* ========== BOTÓN VOLVER AL MENÚ PRINCIPAL ========== */}
        <Pressable onPress={() => router.push("/")} style={({ pressed }) => [styles.homeButton, pressed && { opacity: 0.85 }]}>
          <Text style={styles.homeButtonText}>← Volver al Menú Principal</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },

  // ========== HEADER ==========
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  backButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#102a43",
  },

  // ========== CONTENIDO ==========
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // ========== ESTADO VACÍO (Sin documento) ==========
  emptyState: {
    alignItems: "center",
    marginBottom: 40,
  },

  iconLarge: {
    fontSize: 120,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#102a43",
    marginBottom: 12,
    textAlign: "center",
  },

  emptySubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 24,
  },

  // ========== BOTÓN ESCANEAR ==========
  scanButton: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#2563eb",
    paddingVertical: 25,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  scanButtonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  // ========== ESTADO ÉXITO (Con documento) ==========
  successState: {
    alignItems: "center",
    marginBottom: 40,
  },

  successIcon: {
    fontSize: 80,
    marginBottom: 15,
  },

  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#10b981",
    marginBottom: 20,
  },

  documentoInfo: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#bbf7d0",
    padding: 15,
    width: "100%",
    maxWidth: 300,
  },

  documentoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 5,
  },

  documentoNombre: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a",
    flexWrap: "wrap",
  },

  // ========== BOTONES DE ACCIÓN ==========
  buttonGroup: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },

  continueButton: {
    backgroundColor: "#10b981",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },

  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  recaptureButton: {
    backgroundColor: "#f0f4f8",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },

  recaptureButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "700",
  },

  // ========== FOOTER ==========
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    gap: 12,
  },

  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // ========== BOTÓN VOLVER AL MENÚ PRINCIPAL ==========
  homeButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(59, 130, 246, 0.3)",
        cursor: "pointer",
      },
    }),
  },

  homeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});
