import { View, Text, StyleSheet, Pressable, Platform, ScrollView, Modal, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { obtenerUrlPdfConFallback } from "@/lib/BucketManager";
import { formatFecha } from "@/lib/utils/date";

export default function GarantiaDetalle() {
  const { id } = useLocalSearchParams();
  const [g, setG] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fechaVencimiento, setFechaVencimiento] = useState<string | null>(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalAdvertencia, setModalAdvertencia] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formEditar, setFormEditar] = useState<any>(null);

  // ========== CATÁLOGOS ==========
  const [familias, setFamilias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);

  // ========== MODALES DE AGREGAR ==========
  const [modalAgregarFamilia, setModalAgregarFamilia] = useState(false);
  const [modalAgregarMarca, setModalAgregarMarca] = useState(false);
  const [modalAgregarCentro, setModalAgregarCentro] = useState(false);
  const [modalEliminarItem, setModalEliminarItem] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState<any>(null);

  // ========== INPUTS PARA NUEVOS ITEMS ==========
  const [newFamilia, setNewFamilia] = useState("");
  const [newMarca, setNewMarca] = useState("");
  const [newCentro, setNewCentro] = useState("");

  // ========== LOADINGS ==========
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingFamilia, setLoadingFamilia] = useState(false);
  const [loadingMarca, setLoadingMarca] = useState(false);
  const [loadingCentro, setLoadingCentro] = useState(false);

  // Buckets gestionados por BucketManager
  const router = useRouter();

  useEffect(() => {
    fetchGarantia();
    cargarCatalogos();
  }, [id]);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const [resF, resM, resC] = await Promise.all([
        supabase.from("familia").select("*").order("familia"),
        supabase.from("marca").select("*").order("marca"),
        supabase.from("centro").select("*").order("centro"),
      ]);

      setFamilias(resF.data || []);
      setMarcas(resM.data || []);
      setCentros(resC.data || []);
    } catch (e) {
      console.error("Error cargando catálogos:", e);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const fetchGarantia = async () => {
    const { data } = await supabase.from("garantias").select("*").eq("id", id).single();

    if (data) {
      setG(data);

      if (data.fechacompra && data.duracion_garantia) {
        const fechaCompra = new Date(data.fechacompra);
        const duracion = parseInt(data.duracion_garantia) || 0;
        const fechaVencimientoCalc = new Date(fechaCompra);
        fechaVencimientoCalc.setFullYear(fechaVencimientoCalc.getFullYear() + duracion);

        const fechaFormato = fechaVencimientoCalc.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        setFechaVencimiento(fechaFormato);
      }

      if (data.nombre_archivo) {
        await obtenerArchivoDeMultiplesBuckets(data.nombre_archivo);
      }
    }
  };

  const obtenerArchivoDeMultiplesBuckets = async (nombreArchivo: string) => {
    const nombreLimpio = nombreArchivo.replace(/[\r\n\t]/g, "").trim();
    const url = await obtenerUrlPdfConFallback(nombreLimpio);
    setFileUrl(url);
  };

  const handleAgregarFamilia = async () => {
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
        setFormEditar({ ...formEditar, tipo: data[0].familia });
      }

      alert("✅ Familia agregada correctamente");
      setNewFamilia("");
      setModalAgregarFamilia(false);
    } catch (error: any) {
      alert("❌ Error al agregar familia: " + error.message);
    } finally {
      setLoadingFamilia(false);
    }
  };

  const handleAgregarMarca = async () => {
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
        setFormEditar({ ...formEditar, marca: data[0].marca });
      }

      alert("✅ Marca agregada correctamente");
      setNewMarca("");
      setModalAgregarMarca(false);
    } catch (error: any) {
      alert("❌ Error al agregar marca: " + error.message);
    } finally {
      setLoadingMarca(false);
    }
  };

  const handleAgregarCentro = async () => {
    if (!newCentro.trim()) {
      alert("⚠️ Ingresa el nombre del centro");
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
        setFormEditar({ ...formEditar, centro_compra: data[0].centro });
      }

      alert("✅ Centro agregado correctamente");
      setNewCentro("");
      setModalAgregarCentro(false);
    } catch (error: any) {
      alert("❌ Error al agregar centro: " + error.message);
    } finally {
      setLoadingCentro(false);
    }
  };

  const handleEliminarItem = async () => {
    if (!itemAEliminar) return;
    try {
      const { error } = await supabase.from(itemAEliminar.tipo).delete().eq("id", itemAEliminar.id);

      if (error) throw error;

      if (itemAEliminar.tipo === "familia") {
        setFamilias(familias.filter((f) => f.id !== itemAEliminar.id));
      } else if (itemAEliminar.tipo === "marca") {
        setMarcas(marcas.filter((m) => m.id !== itemAEliminar.id));
      } else if (itemAEliminar.tipo === "centro") {
        setCentros(centros.filter((c) => c.id !== itemAEliminar.id));
      }

      alert("✅ Elemento eliminado correctamente");
      setModalEliminarItem(false);
      setItemAEliminar(null);
    } catch (error: any) {
      alert("❌ Error al eliminar: " + error.message);
    }
  };

  if (!g)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );

  const handleAbrirEditar = () => {
    setFormEditar({ ...g });
    setModalEditar(true);
  };

  const handleEliminarGarantia = () => {
    setModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    try {
      setEditando(true);
      const idNumber = parseInt(id as string);

      const { error } = await supabase.from("garantias").delete().eq("id", idNumber);

      if (error) throw error;

      alert("✅ Garantía eliminada correctamente");
      setModalEliminar(false);
      router.push("/formulario");
    } catch (error: any) {
      alert("❌ Error al eliminar: " + error.message);
    } finally {
      setEditando(false);
    }
  };

  const handleGuardarCambios = async () => {
    if (!formEditar) return;

    setEditando(true);
    try {
      const { error } = await supabase
        .from("garantias")
        .update({
          tipo: formEditar.tipo,
          marca: formEditar.marca,
          modelo: formEditar.modelo,
          importe: formEditar.importe,
          duracion_garantia: formEditar.duracion_garantia,
          centro_compra: formEditar.centro_compra,
          observaciones: formEditar.observaciones,
        })
        .eq("id", id);

      if (error) throw error;

      setG(formEditar);
      setModalEditar(false);
      alert("✅ Garantía actualizada correctamente");
    } catch (error: any) {
      alert("❌ Error al actualizar: " + error.message);
    } finally {
      setEditando(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!emailDestino.trim()) {
      alert("⚠️ Por favor ingresa un correo válido");
      return;
    }

    if (!emailDestino.toLowerCase().endsWith("@gmail.com")) {
      alert("❌ Esta función solo funciona con @gmail.com");
      return;
    }

    setEnviandoEmail(true);

    try {
      let cuerpoEmail = `Información de Garantía\n\n`;
      cuerpoEmail += `Familia: ${g.tipo || "-"}\n`;
      cuerpoEmail += `Marca: ${g.marca || "-"}\n`;
      cuerpoEmail += `Modelo: ${g.modelo || "-"}\n`;
      cuerpoEmail += `Importe: ${g.importe || "-"} EUR\n`;
      cuerpoEmail += `Duración garantía: ${g.duracion_garantia || "-"} años\n`;
      cuerpoEmail += `Centro de compra: ${g.centro_compra || "-"}\n`;
      cuerpoEmail += `Fecha de compra: ${formatFecha(g.fechacompra) || "-"}\n`;
      cuerpoEmail += `Fecha de vencimiento: ${fechaVencimiento || "-"}\n`;

      if (g.observaciones) {
        cuerpoEmail += `Observaciones: ${g.observaciones}\n`;
      }

      if (fileUrl) {
        cuerpoEmail += `\nDocumento PDF: ${fileUrl}`;
      }

      const asunto = encodeURIComponent(`Garantía: ${g.marca} ${g.modelo}`);
      const cuerpo = encodeURIComponent(cuerpoEmail);
      const mailtoLink = `mailto:${emailDestino}?subject=${asunto}&body=${cuerpo}`;

      if (Platform.OS === "web") {
        window.location.href = mailtoLink;
      } else {
        const { Linking } = require("react-native");
        await Linking.openURL(mailtoLink);
      }

      alert(`✅ Cliente de correo abierto\nEnviando a: ${emailDestino}`);
      setModalEmail(false);
      setEmailDestino("");
    } catch (error: any) {
      alert("❌ Error al abrir el correo: " + error.message);
    } finally {
      setEnviandoEmail(false);
    }
  };

  const isPDF = g.nombre_archivo?.toLowerCase().endsWith(".pdf");

  return (
    <ScrollView style={styles.mainBackground} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentWrapper}>
        <Text style={styles.headerTitle}>Ficha de Garantía</Text>

        <View style={styles.infoCard}>
          <View style={styles.gridRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Familia</Text>
              <Text style={styles.topValue}>{g.tipo || "-"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Marca</Text>
              <Text style={styles.topValue}>{g.marca || "-"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Modelo</Text>
              <Text style={styles.topValue}>{g.modelo || "-"}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.gridRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Importe</Text>
              <Text style={[styles.topValue, { color: "#2563eb" }]}>{g.importe} €</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha Compra</Text>
              <Text style={styles.topValue}>{formatFecha(g.fechacompra)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Documento</Text>
              {g.nombre_archivo ? (
                <Pressable onPress={() => setModalVisible(true)} style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>👁️ Ver {isPDF ? "PDF" : "Imagen"}</Text>
                </Pressable>
              ) : (
                <Text style={styles.topValue}>No adjunto</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.gridRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Duración Garantía</Text>
              <Text style={styles.topValue}>{g.duracion_garantia ? `${g.duracion_garantia} años` : "-"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha Vencimiento</Text>
              <Text style={[styles.topValue, { color: fechaVencimiento ? "#dc2626" : "#6b7280" }]}>{fechaVencimiento || "-"}</Text>
            </View>
            <View style={styles.column} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleAbrirEditar} style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.editButtonText}>✏️ Editar</Text>
          </Pressable>

          <Pressable onPress={() => setModalAdvertencia(true)} style={({ pressed }) => [styles.emailButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.emailButtonText}>📧 Email</Text>
          </Pressable>

          <Pressable onPress={handleEliminarGarantia} style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/formulario")} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}>
          <Text style={styles.backButtonText}>← Volver a Mis Garantías</Text>
        </Pressable>

        {/* ========== MODAL VER DOCUMENTO ========== */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{g.nombre_archivo}</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.viewer}>
                {fileUrl ? (
                  isPDF ? (
                    // PDF: iframe en web, mensaje en móvil
                    Platform.OS === "web" ? (
                      <iframe src={fileUrl} style={{ width: "100%", height: "100%", border: "none" } as any} />
                    ) : (
                      <View style={styles.loadingState}>
                        <Text style={styles.loadingStateText}>📄 Abre el PDF en el navegador</Text>
                      </View>
                    )
                  ) : (
                    // JPG/PNG: img en web, Image en móvil
                    Platform.OS === "web" ? (
                      <img src={fileUrl} style={{ width: "100%", height: "100%", objectFit: "contain" } as any} />
                    ) : (
                      <Image source={{ uri: fileUrl }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                    )
                  )
                ) : (
                  <View style={styles.loadingState}>
                    <Text style={styles.loadingStateText}>❌ Archivo no disponible</Text>
                  </View>
                )}
              </View>

              <Pressable style={styles.closeFullBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeFullBtnText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ========== MODAL ADVERTENCIA EMAIL ========== */}
        <Modal visible={modalAdvertencia} transparent={true} animationType="fade">
          <View style={styles.modalAdvertenciaOverlay}>
            <View style={styles.modalAdvertenciaContent}>
              <Text style={styles.modalAdvertenciaIcon}>⚠️</Text>
              <Text style={styles.modalAdvertenciaTitle}>Función limitada a Gmail</Text>
              <Text style={styles.modalAdvertenciaText}>Esta función solo funciona con @gmail.com</Text>

              <View style={styles.modalAdvertenciaButtons}>
                <Pressable style={styles.modalAdvertenciaBtnVolver} onPress={() => setModalAdvertencia(false)}>
                  <Text style={styles.modalAdvertenciaBtnVolverText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={styles.modalAdvertenciaBtnContinuar}
                  onPress={() => {
                    setModalAdvertencia(false);
                    setModalEmail(true);
                  }}
                >
                  <Text style={styles.modalAdvertenciaBtnContinuarText}>Continuar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========== MODAL EMAIL ========== */}
        <Modal visible={modalEmail} transparent={true} animationType="fade">
          <View style={styles.modalEmailOverlay}>
            <View style={styles.modalEmailContent}>
              <Text style={styles.modalEmailTitle}>Enviar por Email</Text>

              <Text style={styles.modalEmailLabel}>Email Gmail:</Text>
              <TextInput
                style={styles.modalEmailInput}
                placeholder="tu@gmail.com"
                value={emailDestino}
                onChangeText={setEmailDestino}
                keyboardType="email-address"
                editable={!enviandoEmail}
              />

              <View style={styles.modalEmailButtons}>
                <Pressable
                  onPress={() => {
                    setModalEmail(false);
                    setEmailDestino("");
                  }}
                  style={styles.modalEmailBtnCancel}
                  disabled={enviandoEmail}
                >
                  <Text style={styles.modalEmailBtnCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable onPress={handleEnviarEmail} style={styles.modalEmailBtnSend} disabled={enviandoEmail}>
                  {enviandoEmail ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalEmailBtnSendText}>Enviar</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========== MODAL CONFIRMAR ELIMINACIÓN ========== */}
        <Modal visible={modalEliminar} transparent={true} animationType="fade">
          <View style={styles.modalAdvertenciaOverlay}>
            <View style={styles.modalAdvertenciaContent}>
              <Text style={styles.modalAdvertenciaIcon}>⚠️</Text>
              <Text style={styles.modalAdvertenciaTitle}>¿Estás seguro?</Text>
              <Text style={styles.modalAdvertenciaText}>Esta acción eliminará la garantía permanentemente</Text>

              <View style={styles.modalAdvertenciaButtons}>
                <Pressable style={styles.modalAdvertenciaBtnVolver} onPress={() => setModalEliminar(false)} disabled={editando}>
                  <Text style={styles.modalAdvertenciaBtnVolverText}>Cancelar</Text>
                </Pressable>

                <Pressable style={styles.modalAdvertenciaBtnContinuar} onPress={confirmarEliminacion} disabled={editando}>
                  {editando ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalAdvertenciaBtnContinuarText}>Eliminar</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========== MODAL EDITAR GARANTÍA ========== */}
        <Modal visible={modalEditar} transparent={true} animationType="slide">
          <View style={styles.modalEditOverlay}>
            <View style={styles.modalEditContent}>
              <View style={styles.modalEditHeader}>
                <Text style={styles.modalEditTitle}>Editar Garantía</Text>
                <Pressable onPress={() => setModalEditar(false)} disabled={editando}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.editForm}>
                {formEditar && (
                  <>
                    {/* FAMILIA */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Familia</Text>
                      <View style={styles.pickerWithButtonRow}>
                        <View style={styles.pickerBoxSmall}>
                          <Picker
                            selectedValue={formEditar.tipo}
                            onValueChange={(itemValue) => setFormEditar({ ...formEditar, tipo: itemValue })}
                            style={{ height: 60, fontSize: 16 }}
                          >
                            <Picker.Item label="Seleccionar familia" value="" />
                            {familias.map((f) => (
                              <Picker.Item key={f.id} label={f.familia} value={f.familia} />
                            ))}
                          </Picker>
                        </View>
                        <Pressable style={styles.addButton} onPress={() => setModalAgregarFamilia(true)}>
                          <Text style={styles.addButtonText}>+</Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* MARCA */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Marca</Text>
                      <View style={styles.pickerWithButtonRow}>
                        <View style={styles.pickerBoxSmall}>
                          <Picker
                            selectedValue={formEditar.marca}
                            onValueChange={(itemValue) => setFormEditar({ ...formEditar, marca: itemValue })}
                            style={{ height: 60, fontSize: 16 }}
                          >
                            <Picker.Item label="Seleccionar marca" value="" />
                            {marcas.map((m) => (
                              <Picker.Item key={m.id} label={m.marca} value={m.marca} />
                            ))}
                          </Picker>
                        </View>
                        <Pressable style={styles.addButton} onPress={() => setModalAgregarMarca(true)}>
                          <Text style={styles.addButtonText}>+</Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* MODELO */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Modelo</Text>
                      <TextInput
                        style={styles.textInput}
                        value={formEditar.modelo || ""}
                        onChangeText={(text) => setFormEditar({ ...formEditar, modelo: text.toUpperCase() })}
                        editable={!editando}
                      />
                    </View>

                    {/* IMPORTE */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Importe (€)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={formEditar.importe || ""}
                        onChangeText={(text) => setFormEditar({ ...formEditar, importe: text })}
                        keyboardType="decimal-pad"
                        editable={!editando}
                      />
                    </View>

                    {/* DURACIÓN */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Duración (años)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={formEditar.duracion_garantia || ""}
                        onChangeText={(text) => setFormEditar({ ...formEditar, duracion_garantia: text })}
                        keyboardType="number-pad"
                        editable={!editando}
                      />
                    </View>

                    {/* CENTRO */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Centro Compra</Text>
                      <View style={styles.pickerWithButtonRow}>
                        <View style={styles.pickerBoxSmall}>
                          <Picker
                            selectedValue={formEditar.centro_compra}
                            onValueChange={(itemValue) => setFormEditar({ ...formEditar, centro_compra: itemValue })}
                            style={{ height: 60, fontSize: 16 }}
                          >
                            <Picker.Item label="Seleccionar centro" value="" />
                            {centros.map((c) => (
                              <Picker.Item key={c.id} label={c.centro} value={c.centro} />
                            ))}
                          </Picker>
                        </View>
                        <Pressable style={styles.addButton} onPress={() => setModalAgregarCentro(true)}>
                          <Text style={styles.addButtonText}>+</Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* OBSERVACIONES */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Observaciones</Text>
                      <TextInput
                        style={[styles.textInput, { height: 80, textAlignVertical: "top" }]}
                        value={formEditar.observaciones || ""}
                        onChangeText={(text) => setFormEditar({ ...formEditar, observaciones: text })}
                        multiline
                        editable={!editando}
                      />
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalEditButtons}>
                <Pressable style={styles.btnCancelar} onPress={() => setModalEditar(false)} disabled={editando}>
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </Pressable>

                <Pressable style={styles.btnGuardar} onPress={handleGuardarCambios} disabled={editando}>
                  <Text style={styles.btnGuardarText}>{editando ? "Guardando..." : "✅ Guardar"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========== MODALES AGREGAR/ELIMINAR ========== */}
        {/* FAMILIA */}
        <Modal visible={modalAgregarFamilia} transparent={true} animationType="fade">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Familia</Text>
                <Pressable onPress={() => setModalAgregarFamilia(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de la familia"
                value={newFamilia}
                onChangeText={setNewFamilia}
                editable={!loadingFamilia}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.modalBtnCancel}
                  onPress={() => {
                    setModalAgregarFamilia(false);
                    setNewFamilia("");
                  }}
                  disabled={loadingFamilia}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalBtn, loadingFamilia && styles.modalBtnDisabled]}
                  onPress={handleAgregarFamilia}
                  disabled={loadingFamilia}
                >
                  {loadingFamilia ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Agregar</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MARCA */}
        <Modal visible={modalAgregarMarca} transparent={true} animationType="fade">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Marca</Text>
                <Pressable onPress={() => setModalAgregarMarca(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de la marca"
                value={newMarca}
                onChangeText={setNewMarca}
                editable={!loadingMarca}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.modalBtnCancel}
                  onPress={() => {
                    setModalAgregarMarca(false);
                    setNewMarca("");
                  }}
                  disabled={loadingMarca}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable style={[styles.modalBtn, loadingMarca && styles.modalBtnDisabled]} onPress={handleAgregarMarca} disabled={loadingMarca}>
                  {loadingMarca ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Agregar</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* CENTRO */}
        <Modal visible={modalAgregarCentro} transparent={true} animationType="fade">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Centro</Text>
                <Pressable onPress={() => setModalAgregarCentro(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Nombre del centro"
                value={newCentro}
                onChangeText={setNewCentro}
                editable={!loadingCentro}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.modalBtnCancel}
                  onPress={() => {
                    setModalAgregarCentro(false);
                    setNewCentro("");
                  }}
                  disabled={loadingCentro}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable style={[styles.modalBtn, loadingCentro && styles.modalBtnDisabled]} onPress={handleAgregarCentro} disabled={loadingCentro}>
                  {loadingCentro ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Agregar</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ELIMINAR ITEM */}
        <Modal visible={modalEliminarItem} transparent={true} animationType="fade">
          <View style={styles.modalAdvertenciaOverlay}>
            <View style={styles.modalAdvertenciaContent}>
              <Text style={styles.modalAdvertenciaIcon}>⚠️</Text>
              <Text style={styles.modalAdvertenciaTitle}>¿Eliminar?</Text>
              <Text style={styles.modalAdvertenciaText}>¿Estás seguro de que deseas eliminar este elemento?</Text>

              <View style={styles.modalAdvertenciaButtons}>
                <Pressable
                  style={styles.modalAdvertenciaBtnVolver}
                  onPress={() => {
                    setModalEliminarItem(false);
                    setItemAEliminar(null);
                  }}
                >
                  <Text style={styles.modalAdvertenciaBtnVolverText}>Cancelar</Text>
                </Pressable>

                <Pressable style={styles.modalAdvertenciaBtnContinuar} onPress={handleEliminarItem}>
                  <Text style={styles.modalAdvertenciaBtnContinuarText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: { flex: 1, backgroundColor: "#f0f4f8" },
  scrollContent: { alignItems: "center", paddingVertical: 40 },
  contentWrapper: { width: "100%", maxWidth: 850, paddingHorizontal: 20 },
  headerTitle: { fontSize: 32, fontWeight: "900", marginBottom: 24, color: "#102a43", textAlign: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f4f8" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#6b7280" },
  infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 28, elevation: 3, marginBottom: 40 },
  gridRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  column: { flex: 1 },
  label: { fontSize: 11, color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  topValue: { fontSize: 16, fontWeight: "700", marginTop: 8, color: "#1f2937" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 24 },
  viewBtn: { backgroundColor: "#dbeafe", padding: 8, borderRadius: 8, marginTop: 8, alignSelf: "flex-start", borderWidth: 2, borderColor: "#3b82f6" },
  viewBtnText: { color: "#1e40af", fontSize: 13, fontWeight: "700" },
  buttonsContainer: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 20 },
  editButton: {
    flex: 1,
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  editButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  emailButton: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  emailButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  deleteButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", height: "85%", backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, alignItems: "center" },
  modalTitle: { fontSize: 15, fontWeight: "800", flex: 1, color: "#1f2937" },
  closeX: { fontSize: 24, fontWeight: "bold", color: "#6b7280" },
  viewer: { flex: 1, backgroundColor: "#374151", borderRadius: 10, overflow: "hidden" },
  loadingState: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingStateText: { marginTop: 16, color: "#ef4444", fontSize: 16, fontWeight: "700" },
  closeFullBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, marginTop: 16, alignItems: "center", elevation: 2 },
  closeFullBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalAdvertenciaOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalAdvertenciaContent: { width: "90%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center" },
  modalAdvertenciaIcon: { fontSize: 48, marginBottom: 16 },
  modalAdvertenciaTitle: { fontSize: 18, fontWeight: "800", color: "#dc2626", marginBottom: 12, textAlign: "center" },
  modalAdvertenciaText: { fontSize: 14, fontWeight: "500", color: "#6b7280", marginBottom: 12, textAlign: "center", lineHeight: 20 },
  modalAdvertenciaButtons: { flexDirection: "row", gap: 12, marginTop: 20, width: "100%" },
  modalAdvertenciaBtnVolver: { flex: 1, borderWidth: 2, borderColor: "#cbd5e1", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalAdvertenciaBtnVolverText: { color: "#6b7280", fontWeight: "700" },
  modalAdvertenciaBtnContinuar: { flex: 1, backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalAdvertenciaBtnContinuarText: { color: "#fff", fontWeight: "800" },
  modalEmailOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalEmailContent: { width: "90%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalEmailTitle: { fontSize: 18, fontWeight: "800", color: "#102a43", marginBottom: 16 },
  modalEmailLabel: { fontSize: 14, fontWeight: "700", color: "#6b7280", marginBottom: 12 },
  modalEmailInput: {
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  modalEmailButtons: { flexDirection: "row", gap: 12 },
  modalEmailBtnCancel: { flex: 1, borderWidth: 2, borderColor: "#cbd5e1", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalEmailBtnCancelText: { color: "#6b7280", fontWeight: "700" },
  modalEmailBtnSend: { flex: 1, backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalEmailBtnSendText: { color: "#fff", fontWeight: "800" },
  modalEditOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalEditContent: { width: "100%", maxWidth: 500, backgroundColor: "#fff", borderRadius: 16, padding: 24, maxHeight: "85%" },
  modalEditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalEditTitle: { fontSize: 18, fontWeight: "800", color: "#102a43" },
  editForm: { paddingBottom: 16, maxHeight: "70%" },
  formGroup: { marginBottom: 18 },
  labelWithButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  formLabel: { fontSize: 12, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: 0 },
  addButton: { backgroundColor: "#10b981", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  addButtonText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  pickerBox: {
    backgroundColor: "#f0f4f8",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    marginBottom: 8,
  },
  pickerWithButtonRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 8 },
  pickerBoxSmall: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
  },
  deleteItemButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fca5a5",
    alignItems: "center",
  },
  deleteItemButtonText: { color: "#dc2626", fontSize: 12, fontWeight: "700" },
  textInput: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, fontSize: 15, color: "#1f2937" },
  modalEditButtons: { flexDirection: "row", gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  btnCancelar: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnCancelarText: { color: "#6b7280", fontWeight: "700" },
  btnGuardar: { flex: 1, backgroundColor: "#10b981", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnGuardarText: { color: "#fff", fontWeight: "800" },
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalView: { width: "90%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 20, padding: 25, elevation: 5 },
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
  modalButtons: { flexDirection: "row", gap: 12 },
  modalBtn: { flex: 1, backgroundColor: "#10b981", padding: 15, borderRadius: 12, alignItems: "center", elevation: 3 },
  modalBtnDisabled: { opacity: 0.6 },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalBtnCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1" },
  modalBtnCancelText: { color: "#666", fontSize: 16, fontWeight: "600" },
});
