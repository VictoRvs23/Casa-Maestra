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

export const CLAVES_REDES = ["instagram", "tiktok", "facebook", "youtube", "whatsapp", "email"];
const REDES_VACIAS = Object.fromEntries(CLAVES_REDES.map((c) => [c, ""]));

export const normalizarBloque = (bloque) =>
  bloque.tipo === "redes"
    ? { id: bloque.id, tipo: "redes", ...REDES_VACIAS, ...Object.fromEntries(CLAVES_REDES.map((c) => [c, bloque[c] || ""])) }
    : bloque;
export const MAX_FOTOS_GALERIA = 6;

export const TIPOS_BLOQUE = [
  { tipo: "texto", label: "Texto" },
  { tipo: "imagen", label: "Imagen" },
  { tipo: "galeria", label: "Galería" },
  { tipo: "separador", label: "Separador" },
  { tipo: "redes", label: "Redes" },
  { tipo: "video", label: "Video" },
];

export const TAMANOS_BLOQUE = [
  { valor: "pequeno", label: "Pequeño" },
  { valor: "mediano", label: "Mediano" },
  { valor: "grande", label: "Grande" },
];

export const analizarVideo = (texto) => {
  const enlace = (texto || "").trim();
  if (!enlace) return { motivo: "vacio" };

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(enlace) ? enlace : `https://${enlace}`);
  } catch {
    return { motivo: "invalido" };
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const partes = url.pathname.split("/").filter(Boolean);
  const idYoutube = /^[\w-]{11}$/;
  const youtube = (id) =>
    id && idYoutube.test(id)
      ? { src: `https://www.youtube-nocookie.com/embed/${id}`, formato: "horizontal" }
      : { motivo: "invalido" };

  if (host === "youtu.be") return youtube(partes[0]);

  if (host === "youtube.com") {
    const id = partes[0] === "watch" ? url.searchParams.get("v") : ["shorts", "embed"].includes(partes[0]) ? partes[1] : null;
    return youtube(id);
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = partes.find((p) => /^\d+$/.test(p));
    return id ? { src: `https://player.vimeo.com/video/${id}`, formato: "horizontal" } : { motivo: "invalido" };
  }

  if (host === "instagram.com") {
    const i = partes.findIndex((p) => ["p", "reel", "tv"].includes(p));
    const codigo = i >= 0 ? partes[i + 1] : null;
    return codigo && /^[\w-]{5,30}$/.test(codigo)
      ? { src: `https://www.instagram.com/${partes[i]}/${codigo}/embed`, formato: "instagram" }
      : { motivo: "invalido" };
  }

  if (host === "tiktok.com") {
    if (partes[0] === "t") return { motivo: "tiktok-corto" };
    const i = partes.indexOf("video");
    const id = i >= 0 ? partes[i + 1] : null;
    return id && /^\d{10,25}$/.test(id)
      ? { src: `https://www.tiktok.com/embed/v2/${id}`, formato: "vertical" }
      : { motivo: "invalido" };
  }

  if (host === "vm.tiktok.com" || host === "vt.tiktok.com") return { motivo: "tiktok-corto" };

  return { motivo: "invalido" };
};

export const MENSAJES_VIDEO = {
  invalido: "Ese enlace no parece de YouTube, Vimeo, Instagram ni TikTok.",
  "tiktok-corto":
    "Ese es un enlace corto de TikTok. Abre el video en el navegador y copia la dirección larga (tiktok.com/@usuario/video/…).",
};

const luminancia = (hex) => {
  const limpio = (hex || "").replace("#", "");
  if (limpio.length !== 6) return 0;

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16) / 255);
  const lineal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
};

export const textoSobre = (hex) => (luminancia(hex) > 0.4 ? "#2b1f15" : "#ffffff");

export const contraste = (a, b) => {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
};

export const detalleLegible = (acento, fondo) =>
  contraste(acento, fondo) >= 3 ? acento : textoSobre(fondo);

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
      return { id, tipo, url: null, alt: "", tamano: "grande" };
    case "galeria":
      return { id, tipo, imagenes: [null, null, null] };
    case "separador":
      return { id, tipo };
    case "redes":
      return { id, tipo, ...REDES_VACIAS };
    case "video":
      return { id, tipo, url: "", tamano: "grande" };
    default:
      return null;
  }
};