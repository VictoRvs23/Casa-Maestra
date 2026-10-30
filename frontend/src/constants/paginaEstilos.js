export const FUENTES = {
  elegante: { label: "Elegante", family: "'Playfair Display', serif" },
  clasica: { label: "Clásica", family: "'Lora', serif" },
  simple: { label: "Simple", family: "'Montserrat', sans-serif" },
  calida: { label: "Cálida", family: "'Nunito', sans-serif" },
  moderna: { label: "Moderna", family: "'Space Grotesk', sans-serif" },
};

export const FUENTE_POR_DEFECTO = "elegante";

export const COLORES_ACENTO = [
  { nombre: "Café", hex: "#845736" },
  { nombre: "Verde bosque", hex: "#1d3d2a" },
  { nombre: "Terracota", hex: "#a3523a" },
  { nombre: "Mostaza", hex: "#8a6414" },
  { nombre: "Azul pizarra", hex: "#3b5565" },
  { nombre: "Ciruela", hex: "#6d3b52" },
];

export const COLORES_FONDO = [
  { nombre: "Papel", hex: "#f6f1e8" },
  { nombre: "Beige", hex: "#ecdfc7" },
  { nombre: "Marfil", hex: "#fffcf5" },
  { nombre: "Verde suave", hex: "#dcece3" },
  { nombre: "Azul suave", hex: "#dbe6ec" },
  { nombre: "Rosa suave", hex: "#f5dddb" },
];

export const MAX_BLOQUES = 30;
export const MAX_FOTOS_GALERIA = 6;

export const TIPOS_BLOQUE = [
  { tipo: "texto", label: "Texto" },
  { tipo: "imagen", label: "Imagen" },
  { tipo: "galeria", label: "Galería" },
  { tipo: "separador", label: "Separador" },
  { tipo: "redes", label: "Redes" },
];

export const ESTADISTICAS_EJEMPLO = [
  { etiqueta: "Visitas del mes", valor: 130 },
  { etiqueta: "Agendas generadas", valor: 35 },
  { etiqueta: "Seguidores", valor: 86 },
];

export const textoSobre = (hex) => {
  const limpio = (hex || "").replace("#", "");
  if (limpio.length !== 6) return "#ffffff";

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16) / 255);
  const lineal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminancia = 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);

  return luminancia > 0.4 ? "#2b1f15" : "#ffffff";
};

const nuevoId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const crearBloque = (tipo) => {
  const id = nuevoId();
  switch (tipo) {
    case "texto":
      return { id, tipo, contenido: "" };
    case "imagen":
      return { id, tipo, url: null, alt: "" };
    case "galeria":
      return { id, tipo, imagenes: [null, null, null] };
    case "separador":
      return { id, tipo };
    case "redes":
      return { id, tipo, instagram: "", email: "", web: "" };
    default:
      return null;
  }
};
