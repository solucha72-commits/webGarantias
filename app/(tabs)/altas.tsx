import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";

export default function PantallaAltas() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  const [fecha, setFecha] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const [centros, setCentros] = useState<any[]>([]);
  const [familias, setFamilias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);

  // MODALES
  const [modalFamilia, setModalFamilia] = useState(false);
  const [modalMarca, setModalMarca] = useState(false);
  const [modalCentro, setModalCentro] = useState(false);

  // INPUTS DE MODALES
  const [newFamilia, setNewFamilia] = useState("");
  const [newMarca, setNewMarca] = useState("");
  const [newCentro, setNewCentro] = useState("");

  // LOADING DE BOTONES
  const [loadingFamilia, setLoadingFamilia] = useState(false);
  const [loadingMarca, setLoadingMarca] = useState(false);
  const [loadingCentro, setLoadingCentro] = useState(false);

  const [form, setForm] = useState({
    tipo: "",
    marca: "",
    modelo: "",
    importe: "",
    duracion_garantia: "",
    centro_compra: "",
    observaciones: "",
    nombre_archivo: "",
    correo_electronico: "",
  });

  // ========== CARGAR CATÁLOGOS ==========
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [resC, resF, resM] = await Promise.all([
        supabase.from("centro").select("*").order("centro"),
        supabase.from("familia").select("*").order("familia"),
        supabase.from("marca").select("*").order("marca"),
      ]);
      setCentros(resC.data || []);
      setFamilias(resF.data || []);
      setMarcas(resM.data || []);
    } catch (e) {
      console.error("Error cargando catálogos:", e);
    } finally {
      setLoadingData(false);
    }
  };

  // ========== AGREGAR FAMILIA ==========
  const handleAddFamilia = async () => {
    if (!newFamilia.trim()) {
      alert("⚠️ Ingresa el nombre de la familia");
      return;
    }

    setLoadingFamilia(true);
    try {
      const { data, error } = await supabase
        .from("familia")
        .insert([{ familia: newFamilia.trim() }])
        .select();

      if (error) throw error;

      // Agregar a lista local
      if (data) {
        setFamilias([...familias, data[0]]);
        setForm({ ...form, tipo: data[0].familia });
      }

      alert("✅ Familia agregada exitosamente");
      setNewFamilia("");
      setModalFamilia(false);
    } catch (error: any) {
      alert("❌ Error al agregar familia: " + error.message);
    } finally {
      setLoadingFamilia(false);
    }
  };

  // ========== AGREGAR MARCA ==========
  const handleAddMarca = async () => {
    if (!newMarca.trim()) {
      alert("⚠️ Ingresa el nombre de la marca");
      return;
    }

    setLoadingMarca(true);
    try {
      const { data, error } = await supabase
        .from("marca")
        .insert([{ marca: newMarca.trim() }])
        .select();

      if (error) throw error;

      // Agregar a lista local
      if (data) {
        setMarcas([...marcas, data[0]]);
        setForm({ ...form, marca: data[0].marca });
      }

      alert("✅ Marca agregada exitosamente");
      setNewMarca("");
      setModalMarca(false);
    } catch (error: any) {
      alert("❌ Error al agregar marca: " + error.message);
    } finally {
      setLoadingMarca(false);
    }
  };

  // ========== AGREGAR CENTRO ==========
  const handleAddCentro = async () => {
    if (!newCentro.trim()) {
      alert("⚠️ Ingresa el nombre del establecimiento");
      return;
    }

    setLoadingCentro(true);
    try {
      const { data, error } = await supabase
        .from("centro")
        .insert([{ centro: newCentro.trim() }])
        .select();

      if (error) throw error;

      // Agregar a lista local
      if (data) {
        setCentros([...centros, data[0]]);
        setForm({ ...form, centro_compra: data[0].centro });
      }

      alert("✅ Establecimiento agregado exitosamente");
      setNewCentro("");
      setModalCentro(false);
    } catch (error: any) {
      alert("❌ Error al agregar establecimiento: " + error.message);
    } finally {
      setLoadingCentro(false);
    }
  };

  // ========== ORIGINAL: Manejar fecha ==========
  const handleWebDateChange = (e: any) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) setFecha(newDate);
  };

  // ========== ORIGINAL: Subir PDF ==========
  const seleccionarYSubirPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (result.canceled) return;
      setSubiendo(true);
      const archivo = result.assets[0];
      const nombreUnico = `${Date.now()}_${archivo.name}`;

      let fileBody;
      const res = await fetch(archivo.uri);
      fileBody = await res.blob();

      const { error } = await supabase.storage.from("garantias").upload(nombreUnico, fileBody);
      if (error) throw error;
      setForm({ ...form, nombre_archivo: nombreUnico });
      alert("✅ Ticket anexado.");
    } catch (error: any) {
      alert("Error PDF: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  // ========== ORIGINAL: Guardar garantía ==========
  const handleSave = async () => {
    if (!form.tipo || !form.marca || !form.centro_compra || !form.importe) {
      alert("⚠️ Rellena los campos obligatorios (*)");
      return;
    }
    setLoading(true);
    let guardadoExitoso = false;
    let intentos = 0;

    while (!guardadoExitoso && intentos < 10) {
      intentos++;
      const idAleatorio = Math.floor(Math.random() * 999999) + 1;
      try {
        const { error } = await supabase.from("garantias").insert([
          {
            ...form,
            id: idAleatorio,
            fechacompra: fecha.toISOString(),
          },
        ]);
        if (!error) {
          guardadoExitoso = true;
          alert(`✨ Guardado con éxito. ID: ${idAleatorio}`);
          router.replace("/");
        } else if (error.code !== "23505") {
          throw error;
        }
      } catch (error: any) {
        alert("Fallo al insertar: " + error.message);
        break;
      }
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Registro de Garantía</Text>

        <View style={styles.card}>
          {/* ========== FAMILIA CON BOTÓN + ========== */}
          <View style={styles.labelRow}>
            <Text style={styles.xlLabel}>FAMILIA *</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setModalFamilia(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.xlPickerBox}>
            <Picker selectedValue={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })} style={{ height: 80, fontSize: 22 }}>
              <Picker.Item label="Selecciona..." value="" />
              {familias.map((f) => (
                <Picker.Item key={f.id} label={f.familia} value={f.familia} />
              ))}
            </Picker>
          </View>

          {/* ========== MARCA CON BOTÓN + ========== */}
          <View style={styles.labelRow}>
            <Text style={styles.xlLabel}>MARCA *</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setModalMarca(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.xlPickerBox}>
            <Picker selectedValue={form.marca} onValueChange={(v) => setForm({ ...form, marca: v })} style={{ height: 80, fontSize: 22 }}>
              <Picker.Item label="Selecciona..." value="" />
              {marcas.map((m) => (
                <Picker.Item key={m.id} label={m.marca} value={m.marca} />
              ))}
            </Picker>
          </View>

          <Text style={styles.xlLabel}>MODELO *</Text>
          <TextInput
            style={styles.xlInput}
            placeholder="Modelo del equipo"
            value={form.modelo}
            onChangeText={(t) => setForm({ ...form, modelo: t })}
          />

          <View style={styles.divider} />

          {/* ========== ESTABLECIMIENTO CON BOTÓN + ========== */}
          <View style={styles.labelRow}>
            <Text style={styles.xlLabel}>ESTABLECIMIENTO *</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setModalCentro(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.xlPickerBox}>
            <Picker
              selectedValue={form.centro_compra}
              onValueChange={(v) => setForm({ ...form, centro_compra: v })}
              style={{ height: 80, fontSize: 22 }}
            >
              <Picker.Item label="Selecciona..." value="" />
              {centros.map((c) => (
                <Picker.Item key={c.id} label={c.centro} value={c.centro} />
              ))}
            </Picker>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.xlLabel}>FECHA COMPRA *</Text>
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={fecha.toISOString().split("T")[0]}
                  onChange={handleWebDateChange}
                  style={{
                    padding: 20,
                    borderRadius: 15,
                    border: "3px solid #cbd5e1",
                    width: "100%",
                    fontSize: 22,
                    backgroundColor: "#f0f4f8",
                  }}
                />
              ) : (
                <Pressable style={styles.xlInputBox} onPress={() => setShowCalendar(true)}>
                  <Text style={{ fontSize: 22, fontWeight: "600" }}>📅 {fecha.toLocaleDateString()}</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.half}>
              <Text style={styles.xlLabel}>IMPORTE (€) *</Text>
              <TextInput
                style={styles.xlInput}
                keyboardType="numeric"
                placeholder="0.00"
                value={form.importe}
                onChangeText={(t) => setForm({ ...form, importe: t })}
              />
            </View>
          </View>

          {showCalendar && Platform.OS !== "web" && <DateTimePicker value={fecha} mode="date" display="default" onChange={() => {}} />}

          <Text style={styles.xlLabel}>OBSERVACIONES</Text>
          <TextInput
            style={[styles.xlInput, { height: 120, textAlignVertical: "top" }]}
            multiline
            value={form.observaciones}
            onChangeText={(t) => setForm({ ...form, observaciones: t })}
          />

          <Pressable style={[styles.btnFile, form.nombre_archivo ? styles.btnFileOk : null]} onPress={seleccionarYSubirPDF} disabled={subiendo}>
            <Text style={styles.btnFileText}>{form.nombre_archivo ? `✅ TICKET ADJUNTO` : "📁 SUBIR TICKET PDF"}</Text>
          </Pressable>

          <Pressable style={styles.btnSave} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>REGISTRAR GARANTÍA</Text>}
          </Pressable>
        </View>
      </View>

      {/* ========== MODAL FAMILIA ========== */}
      <Modal visible={modalFamilia} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Familia</Text>
              <Pressable onPress={() => { setModalFamilia(false); setNewFamilia(""); }}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Televisor, Ordenador, Refrigerador..."
              placeholderTextColor="#999"
              value={newFamilia}
              onChangeText={setNewFamilia}
            />

            <Pressable
              style={[styles.modalBtn, loadingFamilia && styles.modalBtnDisabled]}
              onPress={handleAddFamilia}
              disabled={loadingFamilia}
            >
              {loadingFamilia ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>✅ Guardar Familia</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.modalBtnCancel}
              onPress={() => { setModalFamilia(false); setNewFamilia(""); }}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL MARCA ========== */}
      <Modal visible={modalMarca} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Marca</Text>
              <Pressable onPress={() => { setModalMarca(false); setNewMarca(""); }}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Samsung, LG, Sony, Dell..."
              placeholderTextColor="#999"
              value={newMarca}
              onChangeText={setNewMarca}
            />

            <Pressable
              style={[styles.modalBtn, loadingMarca && styles.modalBtnDisabled]}
              onPress={handleAddMarca}
              disabled={loadingMarca}
            >
              {loadingMarca ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>✅ Guardar Marca</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.modalBtnCancel}
              onPress={() => { setModalMarca(false); setNewMarca(""); }}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL CENTRO ========== */}
      <Modal visible={modalCentro} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nuevo Establecimiento</Text>
              <Pressable onPress={() => { setModalCentro(false); setNewCentro(""); }}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: MediaMarkt, Carrefour, Fnac..."
              placeholderTextColor="#999"
              value={newCentro}
              onChangeText={setNewCentro}
            />

            <Pressable
              style={[styles.modalBtn, loadingCentro && styles.modalBtnDisabled]}
              onPress={handleAddCentro}
              disabled={loadingCentro}
            >
              {loadingCentro ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>✅ Guardar Establecimiento</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.modalBtnCancel}
              onPress={() => { setModalCentro(false); setNewCentro(""); }}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#f0f4f8" },
  scroll: { paddingVertical: 40, alignItems: "center" },
  container: { width: "100%", maxWidth: 900, paddingHorizontal: 20 },
  mainTitle: { fontSize: 42, fontWeight: "900", color: "#102a43", marginBottom: 30, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 30, padding: 40, width: "100%", elevation: 10 },

  // ========== LABEL ROW CON BOTÓN + ==========
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  xlLabel: { fontSize: 18, fontWeight: "800", color: "#243b53" },

  addButton: {
    backgroundColor: "#10b981",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  addButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  // ========== INPUTS ORIGINALES ==========
  xlPickerBox: {
    backgroundColor: "#f0f4f8",
    borderWidth: 3,
    borderColor: "#cbd5e1",
    borderRadius: 15,
    marginBottom: 30,
    height: 80,
    justifyContent: "center",
  },

  xlInput: {
    backgroundColor: "#f0f4f8",
    borderWidth: 3,
    borderColor: "#cbd5e1",
    borderRadius: 15,
    padding: 22,
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
  },

  xlInputBox: {
    backgroundColor: "#f0f4f8",
    borderWidth: 3,
    borderColor: "#cbd5e1",
    borderRadius: 15,
    marginBottom: 30,
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  divider: { height: 3, backgroundColor: "#f1f5f9", marginVertical: 20, marginBottom: 35 },
  row: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  half: { width: Platform.OS === "web" ? "48%" : "100%" },

  btnFile: { borderStyle: "dashed", borderColor: "#3b82f6", borderWidth: 3, padding: 30, borderRadius: 20, alignItems: "center", marginVertical: 30 },
  btnFileOk: { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
  btnFileText: { color: "#1e40af", fontWeight: "900", fontSize: 18 },

  btnSave: { backgroundColor: "#2563eb", padding: 25, borderRadius: 20, alignItems: "center" },
  btnSaveText: { color: "#fff", fontWeight: "900", fontSize: 24 },

  // ========== MODAL STYLES ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 30,
    paddingBottom: 50,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#102a43",
    flex: 1,
  },

  closeX: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#999",
  },

  modalInput: {
    backgroundColor: "#f0f4f8",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
  },

  modalBtn: {
    backgroundColor: "#10b981",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },

  modalBtnDisabled: {
    opacity: 0.6,
  },

  modalBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalBtnCancel: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  modalBtnCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
