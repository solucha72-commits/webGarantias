export function formatFecha(fecha: string | null) {
  if (!fecha) return "-";

  const d = new Date(fecha);

  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
