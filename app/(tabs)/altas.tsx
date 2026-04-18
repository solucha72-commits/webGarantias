import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";

export default function PantallaAltas() {
  const router = useRouter();
  const params = useLocalSearchParams();
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
  const [modalEscanear, setModalEscanear] = useState(false);
  const [modalNuevaGarantia, setModalNuevaGarantia] = useState(false);

  // MODAL DE CONFIRMACIÓN PARA ELIMINAR
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState<{ tipo: string; id: number; nombre: string } | null>(null);

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

  // ========== RECIBIR DOCUMENTO DE /escaner ==========
  useEffect(() => {
    if (params.documento) {
      setForm({ ...form, nombre_archivo: params.documento as string });
    }
  }, [params.documento]);

  // ========== CARGAR CATÁLOGOS ==========
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [resC, resF, resM] = await Promise.all([
        supabase.from("centro").select("*"),
        supabase.from("familia").select("*"),
        supabase.from("marca").select("*"),
      ]);

      // Ordenar alfabéticamente sin importar mayúsculas (A-Z)
      const centrosOrdenados = (resC.data || []).sort((a, b) => a.centro.toLowerCase().localeCompare(b.centro.toLowerCase()));
      const familiasOrdenadas = (resF.data || []).sort((a, b) => a.familia.toLowerCase().localeCompare(b.familia.toLowerCase()));
      const marcasOrdenadas = (resM.data || []).sort((a, b) => a.marca.toLowerCase().localeCompare(b.marca.toLowerCase()));

      setCentros(centrosOrdenados);
      setFamilias(familiasOrdenadas);
      setMarcas(marcasOrdenadas);
    } catch (e) {
      console.error("Error cargando catálogos:", e);
    } finally {
      setLoadingData(false);
    }
  };

  // ========== ELIMINAR FAMILIA ==========
  const handleEliminarFamilia = async (id: number, familia: string) => {
    setItemAEliminar({ tipo: "familia", id, nombre: familia });
    setModalConfirmarEliminar(true);
  };

  // ========== ELIMINAR FAMILIA CONFIRMADO ==========
  const confirmarEliminarFamilia = async () => {
    if (!itemAEliminar) return;
    try {
      const { error } = await supabase.from("familia").delete().eq("id", itemAEliminar.id);

      if (error) throw error;

      setFamilias(familias.filter((f) => f.id !== itemAEliminar.id));
      alert("✅ Familia eliminada");
      setModalConfirmarEliminar(false);
      setItemAEliminar(null);
    } catch (error: any) {
      alert("❌ Error al eliminar: " + error.message);
    }
  };
  const handleAddFamilia = async () => {
    if (!newFamilia.trim()) {
      alert("⚠️ Ingresa el nombre de la familia");
      return;
    }

    setLoadingFamilia(true);
    try {
      const familiaMAYUS = newFamilia.trim().toUpperCase();
      const { data, error } = await supabase
        .from("familia")
        .insert([{ familia: familiaMAYUS }])
        .select();

      if (error) throw error;

      if (data) {
        setFamilias([...familias, data[0]]);
        setForm({ ...form, tipo: data[0].familia });
      }

      alert("✅ Familia agregada correctamente");
      setNewFamilia("");
      setModalFamilia(false);
    } catch (error: any) {
      alert("❌ Error al agregar familia: " + error.message);
    } finally {
      setLoadingFamilia(false);
    }
  };

  // ========== ELIMINAR MARCA ==========
  const handleEliminarMarca = async (id: number, marca: string) => {
    setItemAEliminar({ tipo: "marca", id, nombre: marca });
    setModalConfirmarEliminar(true);
  };

  // ========== ELIMINAR MARCA CONFIRMADO ==========
  const confirmarEliminarMarca = async () => {
    if (!itemAEliminar) return;
    try {
      const { error } = await supabase.from("marca").delete().eq("id", itemAEliminar.id);

      if (error) throw error;

      setMarcas(marcas.filter((m) => m.id !== itemAEliminar.id));
      alert("✅ Marca eliminada");
      setModalConfirmarEliminar(false);
      setItemAEliminar(null);
    } catch (error: any) {
      alert("❌ Error al eliminar: " + error.message);
    }
  };
  const handleAddMarca = async () => {
    if (!newMarca.trim()) {
      alert("⚠️ Ingresa el nombre de la marca");
      return;
    }

    setLoadingMarca(true);
    try {
      const marcaMAYUS = newMarca.trim().toUpperCase();
      const { data, error } = await supabase
        .from("marca")
        .insert([{ marca: marcaMAYUS }])
        .select();

      if (error) throw error;

      if (data) {
        setMarcas([...marcas, data[0]]);
        setForm({ ...form, marca: data[0].marca });
      }

      alert("✅ Marca agregada correctamente");
      setNewMarca("");
      setModalMarca(false);
    } catch (error: any) {
      alert("❌ Error al agregar marca: " + error.message);
    } finally {
      setLoadingMarca(false);
    }
  };

  // ========== ELIMINAR CENTRO ==========
  const handleEliminarCentro = async (id: number, centro: string) => {
    setItemAEliminar({ tipo: "centro", id, nombre: centro });
    setModalConfirmarEliminar(true);
  };

  // ========== ELIMINAR CENTRO CONFIRMADO ==========
  const confirmarEliminarCentro = async () => {
    if (!itemAEliminar) return;
    try {
      const { error } = await supabase.from("centro").delete().eq("id", itemAEliminar.id);

      if (error) throw error;

      setCentros(centros.filter((c) => c.id !== itemAEliminar.id));
      alert("✅ Establecimiento eliminado");
      setModalConfirmarEliminar(false);
      setItemAEliminar(null);
    } catch (error: any) {
      alert("❌ Error al eliminar: " + error.message);
    }
  };
  const handleAddCentro = async () => {
    if (!newCentro.trim()) {
      alert("⚠️ Ingresa el nombre del establecimiento");
      return;
    }

    setLoadingCentro(true);
    try {
      const centroMAYUS = newCentro.trim().toUpperCase();
      const { data, error } = await supabase
        .from("centro")
        .insert([{ centro: centroMAYUS }])
        .select();

      if (error) throw error;

      if (data) {
        setCentros([...centros, data[0]]);
        setForm({ ...form, centro_compra: data[0].centro });
      }

      alert("✅ Establecimiento agregado correctamente");
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

  // ========== ESCANEAR TICKET: Abre Modal ==========
  const handleAbrirModalEscaneo = () => {
    setModalEscanear(true);
  };

  // ========== FUNCIÓN DENTRO DEL MODAL: Seleccionar documento ==========
  const handleEscanearDocumento = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setSubiendo(true);
      const archivo = result.assets[0];

      // Generar nombre con estructura: año_mes_día_código_nombre
      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, "0");
      const día = String(ahora.getDate()).padStart(2, "0");
      const codigoAleatorio = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

      // Obtener nombre sin extensión y extension
      const partes = archivo.name.split(".");
      const extension = partes[partes.length - 1];
      const nombreSinExtension = partes.slice(0, -1).join(".");

      const nombreUnico = `${año}_${mes}_${día}_${codigoAleatorio}_${nombreSinExtension}.${extension}`;

      let fileBody;
      const res = await fetch(archivo.uri);
      fileBody = await res.blob();

      // Subir a la carpeta pdf/ dentro del bucket garantias
      const { error } = await supabase.storage.from("garantias").upload(`pdf/${nombreUnico}`, fileBody);
      if (error) throw error;

      // Guardar SOLO EL NOMBRE en la BD (sin la carpeta pdf/)
      setForm({ ...form, nombre_archivo: nombreUnico });
      alert("✅ Documento capturado y anexado correctamente.");
      setModalEscanear(false);
    } catch (error: any) {
      alert("Error al capturar documento: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  // ========== FUNCIÓN: Nueva garantía ==========
  const handleNuevaGarantia = () => {
    setModalNuevaGarantia(false);
    setForm({
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
    setFecha(new Date());
  };

  // ========== FUNCIÓN: Ir al menú principal ==========
  const handleIrAlMenu = () => {
    setModalNuevaGarantia(false);
    router.replace("/");
  };

  // ========== ORIGINAL: Guardar garantía ==========
  const handleSave = async () => {
    // Validar campos obligatorios: tipo, marca, modelo, importe, centro_compra
    if (!form.tipo || !form.tipo.trim()) {
      alert("⚠️ El campo FAMILIA (*) es obligatorio");
      return;
    }
    if (!form.marca || !form.marca.trim()) {
      alert("⚠️ El campo MARCA (*) es obligatorio");
      return;
    }
    if (!form.modelo || !form.modelo.trim()) {
      alert("⚠️ El campo MODELO (*) es obligatorio");
      return;
    }
    if (!form.duracion_garantia || !form.duracion_garantia.trim()) {
      alert("⚠️ El campo DURACIÓN (*) es obligatorio");
      return;
    }
    if (!form.importe || !form.importe.trim()) {
      alert("⚠️ El campo PRECIO (*) es obligatorio");
      return;
    }
    if (!form.centro_compra || !form.centro_compra.trim()) {
      alert("⚠️ El campo CENTRO DE COMPRA (*) es obligatorio");
      return;
    }

    // Validar que importe sea un número válido
    const precioNum = parseFloat(form.importe);
    if (isNaN(precioNum) || precioNum <= 0) {
      alert("⚠️ El PRECIO debe ser un número válido mayor a 0");
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
          setModalNuevaGarantia(true);
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
          {/* ========== FAMILIA CON BOTÓN + Y - AL MISMO NIVEL ==========  */}
          <Text style={styles.xlLabel}>FAMILIA *</Text>
          <View style={styles.pickerWithButton}>
            <View style={styles.xlPickerBox}>
              <Picker selectedValue={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })} style={{ height: 80, fontSize: 22 }}>
                <Picker.Item label="Selecciona..." value="" />
                {familias.map((f) => (
                  <Picker.Item key={f.id} label={f.familia} value={f.familia} />
                ))}
              </Picker>
            </View>
            <Pressable style={styles.addButton} onPress={() => setModalFamilia(true)}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, styles.deleteButton]}
              onPress={() => {
                const familia = familias.find((f) => f.familia === form.tipo);
                if (familia) {
                  handleEliminarFamilia(familia.id, familia.familia);
                } else {
                  alert("⚠️ Selecciona una familia primero");
                }
              }}
            >
              <Text style={styles.deleteButtonText}>−</Text>
            </Pressable>
          </View>

          {/* ========== MARCA CON BOTÓN + Y - AL MISMO NIVEL ==========  */}
          <Text style={styles.xlLabel}>MARCA *</Text>
          <View style={styles.pickerWithButton}>
            <View style={styles.xlPickerBox}>
              <Picker selectedValue={form.marca} onValueChange={(v) => setForm({ ...form, marca: v })} style={{ height: 80, fontSize: 22 }}>
                <Picker.Item label="Selecciona..." value="" />
                {marcas.map((m) => (
                  <Picker.Item key={m.id} label={m.marca} value={m.marca} />
                ))}
              </Picker>
            </View>
            <Pressable style={styles.addButton} onPress={() => setModalMarca(true)}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, styles.deleteButton]}
              onPress={() => {
                const marca = marcas.find((m) => m.marca === form.marca);
                if (marca) {
                  handleEliminarMarca(marca.id, marca.marca);
                } else {
                  alert("⚠️ Selecciona una marca primero");
                }
              }}
            >
              <Text style={styles.deleteButtonText}>−</Text>
            </Pressable>
          </View>

          <Text style={styles.xlLabel}>MODELO * / DURACIÓN *</Text>
          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <TextInput
                style={[styles.xlInput, { marginBottom: 0 }]}
                placeholder="Modelo del equipo"
                value={form.modelo}
                onChangeText={(t) => setForm({ ...form, modelo: t })}
              />
            </View>
            <View style={styles.halfInput}>
              <View style={styles.xlInputBox}>
                <Picker
                  selectedValue={form.duracion_garantia}
                  onValueChange={(v) => setForm({ ...form, duracion_garantia: v })}
                  style={{ height: 80, fontSize: 22 }}
                >
                  <Picker.Item label="Selecciona años..." value="" />
                  <Picker.Item label="1 año" value="1" />
                  <Picker.Item label="2 años" value="2" />
                  <Picker.Item label="3 años" value="3" />
                  <Picker.Item label="4 años" value="4" />
                  <Picker.Item label="5 años" value="5" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ========== ESTABLECIMIENTO CON BOTÓN + Y - AL MISMO NIVEL ==========  */}
          <Text style={styles.xlLabel}>ESTABLECIMIENTO *</Text>
          <View style={styles.pickerWithButton}>
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
            <Pressable style={styles.addButton} onPress={() => setModalCentro(true)}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, styles.deleteButton]}
              onPress={() => {
                const centro = centros.find((c) => c.centro === form.centro_compra);
                if (centro) {
                  handleEliminarCentro(centro.id, centro.centro);
                } else {
                  alert("⚠️ Selecciona un establecimiento primero");
                }
              }}
            >
              <Text style={styles.deleteButtonText}>−</Text>
            </Pressable>
          </View>

          <View style={styles.rowLabels}>
            <Text style={[styles.xlLabel, { flex: 1 }]}>FECHA COMPRA *</Text>
            <Text style={[styles.xlLabel, { flex: 1, marginLeft: 20 }]}>IMPORTE (€) *</Text>
          </View>
          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
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
                    height: 80,
                    fontSize: 22,
                    backgroundColor: "#f0f4f8",
                    marginRight: 10,
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <Pressable style={styles.xlInputBox} onPress={() => setShowCalendar(true)}>
                  <Text style={{ fontSize: 22, fontWeight: "600" }}>📅 {fecha.toLocaleDateString()}</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.halfInput}>
              <TextInput
                style={[styles.xlInput, { marginLeft: 10, marginBottom: 0, height: 80 }]}
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

          <Pressable style={[styles.btnFile, form.nombre_archivo ? styles.btnFileOk : null]} onPress={handleAbrirModalEscaneo} disabled={subiendo}>
            <Text style={styles.btnFileText}>{form.nombre_archivo ? `📎 DOCUMENTACIÓN ADJUNTADA PREVIA` : "📸 ESCANEAR TICKET"}</Text>
          </Pressable>

          <Pressable style={styles.btnSave} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>REGISTRAR GARANTÍA</Text>}
          </Pressable>

          {/* ========== BOTÓN VOLVER AL MENÚ ==========  */}
          <Pressable style={styles.btnBack} onPress={() => router.push("/")}>
            <Text style={styles.btnBackText}>← Volver al Menú Principal</Text>
          </Pressable>
        </View>
      </View>

      {/* ========== MODAL NUEVA GARANTÍA ========== */}
      <Modal visible={modalNuevaGarantia} transparent={true} animationType="fade">
        <View style={[styles.centeredView, { justifyContent: "center" }]}>
          <View style={[styles.modalView, { width: "85%", maxWidth: 350 }]}>
            <Text style={[styles.modalTitle, { textAlign: "center", marginBottom: 15, fontSize: 20 }]}>✨ ¡Garantía Registrada!</Text>
            <Text style={[styles.modalTitle, { textAlign: "center", marginBottom: 25, fontSize: 15, fontWeight: "400", color: "#6b7280" }]}>
              ¿Deseas registrar otra garantía?
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#ef4444", flex: 1 }]} onPress={handleIrAlMenu}>
                <Text style={styles.modalBtnText}>❌ No, Ir al Menú</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#10b981", flex: 1 }]} onPress={handleNuevaGarantia}>
                <Text style={styles.modalBtnText}>✅ Sí, Nueva</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL FAMILIA (PEQUEÑO) ========== */}
      <Modal visible={modalFamilia} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Familia</Text>
              <Pressable
                onPress={() => {
                  setModalFamilia(false);
                  setNewFamilia("");
                }}
              >
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Televisor, Ordenador..."
              placeholderTextColor="#999"
              value={newFamilia}
              onChangeText={setNewFamilia}
            />

            <Pressable style={[styles.modalBtn, loadingFamilia && styles.modalBtnDisabled]} onPress={handleAddFamilia} disabled={loadingFamilia}>
              {loadingFamilia ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>✅ Guardar</Text>}
            </Pressable>

            <Pressable
              style={styles.modalBtnCancel}
              onPress={() => {
                setModalFamilia(false);
                setNewFamilia("");
              }}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL MARCA (PEQUEÑO) ========== */}
      <Modal visible={modalMarca} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Marca</Text>
              <Pressable
                onPress={() => {
                  setModalMarca(false);
                  setNewMarca("");
                }}
              >
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Samsung, LG, Sony..."
              placeholderTextColor="#999"
              value={newMarca}
              onChangeText={setNewMarca}
            />

            <Pressable style={[styles.modalBtn, loadingMarca && styles.modalBtnDisabled]} onPress={handleAddMarca} disabled={loadingMarca}>
              {loadingMarca ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>✅ Guardar</Text>}
            </Pressable>

            <Pressable
              style={styles.modalBtnCancel}
              onPress={() => {
                setModalMarca(false);
                setNewMarca("");
              }}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL CENTRO (PEQUEÑO) ========== */}
      <Modal visible={modalCentro} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Establecimiento</Text>
              <Pressable
                onPress={() => {
                  setModalCentro(false);
                  setNewCentro("");
                }}
              >
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: MediaMarkt, Carrefour..."
              placeholderTextColor="#999"
              value={newCentro}
              onChangeText={setNewCentro}
            />

            <Pressable style={[styles.modalBtn, loadingCentro && styles.modalBtnDisabled]} onPress={handleAddCentro} disabled={loadingCentro}>
              {loadingCentro ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>✅ Guardar</Text>}
            </Pressable>

            <Pressable
              style={styles.modalBtnCancel}
              onPress={() => {
                setModalCentro(false);
                setNewCentro("");
              }}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL ESCANEAR DOCUMENTO (PRINCIPAL) ========== */}
      <Modal visible={modalEscanear} transparent={true} animationType="slide">
        <View style={styles.centeredView}>
          <View style={[styles.modalView, styles.modalEscaneoView]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escanear Documento</Text>
              <Pressable onPress={() => setModalEscanear(false)}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.escaneoContent}>
              <Text style={styles.escaneoInfo}>
                {Platform.OS === "web" ? "Selecciona un documento desde tu PC" : "Captura una foto del ticket con tu cámara"}
              </Text>

              {Platform.OS === "web" ? (
                <>
                  <Text style={styles.escaneoIcon}>📁</Text>
                  <Text style={styles.escaneoSubtext}>Haz click en el botón para seleccionar un archivo</Text>
                </>
              ) : (
                <>
                  <Text style={styles.escaneoIcon}>📸</Text>
                  <Text style={styles.escaneoSubtext}>Abre tu cámara para fotografiar el ticket</Text>
                </>
              )}
            </View>

            <Pressable
              style={[styles.modalBtn, styles.escaneoBtn, subiendo && styles.modalBtnDisabled]}
              onPress={handleEscanearDocumento}
              disabled={subiendo}
            >
              {subiendo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>{Platform.OS === "web" ? "📁 Seleccionar Archivo" : "📸 Abrir Cámara"}</Text>
              )}
            </Pressable>

            <Pressable style={styles.modalBtnCancel} onPress={() => setModalEscanear(false)} disabled={subiendo}>
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL CONFIRMAR ELIMINACIÓN ==========  */}
      <Modal visible={modalConfirmarEliminar} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>⚠️ Confirmar Eliminación</Text>

            <Text style={styles.confirmText}>¿Estás seguro de que quieres eliminar "{itemAEliminar?.nombre}"?</Text>
            <Text style={styles.warningText}>Esta acción no se puede deshacer</Text>

            <View style={styles.buttonGroupConfirm}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setModalConfirmarEliminar(false);
                  setItemAEliminar(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.deleteConfirmBtn}
                onPress={() => {
                  if (itemAEliminar?.tipo === "familia") {
                    confirmarEliminarFamilia();
                  } else if (itemAEliminar?.tipo === "marca") {
                    confirmarEliminarMarca();
                  } else if (itemAEliminar?.tipo === "centro") {
                    confirmarEliminarCentro();
                  }
                }}
              >
                <Text style={styles.deleteConfirmBtnText}>Eliminar</Text>
              </Pressable>
            </View>
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

  // ========== LABEL CON BOTÓN AL LADO ==========
  labelWithButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // ========== PICKER CON BOTÓN AL MISMO NIVEL ==========
  pickerWithButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },

  xlLabel: { fontSize: 18, fontWeight: "800", color: "#243b53" },

  rowLabels: {
    flexDirection: "row",
    marginBottom: 12,
  },

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

  deleteButton: {
    backgroundColor: "#ef4444",
  },

  deleteButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  // ========== MODAL CONFIRMACIÓN ==========
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 15,
  },

  warningText: {
    fontSize: 13,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 25,
  },

  buttonGroupConfirm: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelBtnText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
  },

  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteConfirmBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  // ========== INPUTS ORIGINALES ==========
  xlPickerBox: {
    backgroundColor: "#f0f4f8",
    borderWidth: 3,
    borderColor: "#cbd5e1",
    borderRadius: 15,
    height: 80,
    justifyContent: "center",
    flex: 1,
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

  rowInputs: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, gap: 10 },
  halfInput: { flex: 1, height: 80 },

  btnFile: { borderStyle: "dashed", borderColor: "#3b82f6", borderWidth: 3, padding: 30, borderRadius: 20, alignItems: "center", marginVertical: 30 },
  btnFileOk: { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
  btnFileText: { color: "#1e40af", fontWeight: "900", fontSize: 18 },

  btnSave: { backgroundColor: "#2563eb", padding: 25, borderRadius: 20, alignItems: "center" },
  btnSaveText: { color: "#fff", fontWeight: "900", fontSize: 24 },

  // ========== MODAL STYLES (PEQUEÑOS) ==========
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalView: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102a43",
    flex: 1,
  },

  closeX: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#999",
  },

  modalInput: {
    backgroundColor: "#f0f4f8",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },

  modalBtn: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
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
    padding: 12,
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

  // ========== BOTÓN VOLVER ==========
  btnBack: {
    marginTop: 30,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    backgroundColor: "#f0f4f8",
    borderWidth: 2,
    borderColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },

  btnBackText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    textAlign: "center",
  },

  // ========== MODAL ESCANEO ==========
  modalEscaneoView: {
    maxWidth: 450,
    width: "95%",
  },

  escaneoContent: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 20,
  },

  escaneoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },

  escaneoInfo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102a43",
    textAlign: "center",
    marginBottom: 15,
  },

  escaneoSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  escaneoBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
});
