"use client";

// Almacén de la demo basado en localStorage: sin backend.
// El simulador de WhatsApp escribe aquí y el panel lee en vivo.

export type EstadoTramite =
  | "recibido"
  | "docs-completos"
  | "en-matrizacion"
  | "listo-firma"
  | "entregado";

export const ESTADOS: { id: EstadoTramite; label: string; color: string }[] = [
  { id: "recibido", label: "Recibido", color: "bg-slate-200 text-slate-700" },
  { id: "docs-completos", label: "Docs completos", color: "bg-sky-100 text-sky-700" },
  { id: "en-matrizacion", label: "En matrización", color: "bg-amber-100 text-amber-700" },
  { id: "listo-firma", label: "Listo para firma", color: "bg-violet-100 text-violet-700" },
  { id: "entregado", label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
];

export interface TramiteRegistro {
  id: string;
  tramiteId: string;
  tramiteNombre: string;
  cliente: string;
  cedula: string;
  celular: string;
  estado: EstadoTramite;
  total: number;
  origen: "whatsapp" | "mostrador";
  creadoEn: string; // ISO
}

export interface Cita {
  id: string;
  registroId?: string;
  cliente: string;
  tramiteNombre: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  modalidad: "presencial" | "telematica";
  origen: "whatsapp" | "mostrador";
}

const K_REGISTROS = "n41_registros";
const K_CITAS = "n41_citas";
const EVT = "n41-store-change";

function hoy(offsetDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().slice(0, 10);
}

const SEED_REGISTROS: TramiteRegistro[] = [
  {
    id: "r-seed-1",
    tramiteId: "divorcio",
    tramiteNombre: "Divorcio por mutuo consentimiento",
    cliente: "Carlos Andrade & Lucía Mena",
    cedula: "1712345678",
    celular: "+593 99 111 2233",
    estado: "en-matrizacion",
    total: 166.29,
    origen: "mostrador",
    creadoEn: new Date(Date.now() - 3 * 864e5).toISOString(),
  },
  {
    id: "r-seed-2",
    tramiteId: "poder",
    tramiteNombre: "Poder general o especial (persona natural)",
    cliente: "María Fernanda Ríos",
    cedula: "0923456789",
    celular: "+593 98 222 3344",
    estado: "listo-firma",
    total: 55.43,
    origen: "whatsapp",
    creadoEn: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: "r-seed-3",
    tramiteId: "hipoteca",
    tramiteNombre: "Cancelación de hipoteca",
    cliente: "Jorge Paredes",
    cedula: "1104567890",
    celular: "+593 96 333 4455",
    estado: "docs-completos",
    total: 55.43,
    origen: "mostrador",
    creadoEn: new Date(Date.now() - 1 * 864e5).toISOString(),
  },
  {
    id: "r-seed-4",
    tramiteId: "salida-menor",
    tramiteNombre: "Autorización de salida del país de menor",
    cliente: "Ana Belén Castro",
    cedula: "1756789012",
    celular: "+593 99 444 5566",
    estado: "entregado",
    total: 27.72,
    origen: "whatsapp",
    creadoEn: new Date(Date.now() - 5 * 864e5).toISOString(),
  },
  {
    id: "r-seed-5",
    tramiteId: "vehiculo",
    tramiteNombre: "Contrato de compraventa de vehículo",
    cliente: "Diego Salazar",
    cedula: "0912345670",
    celular: "+593 98 555 6677",
    estado: "recibido",
    total: 22.17,
    origen: "mostrador",
    creadoEn: new Date().toISOString(),
  },
];

const SEED_CITAS: Cita[] = [
  {
    id: "c-seed-1",
    registroId: "r-seed-1",
    cliente: "Carlos Andrade & Lucía Mena",
    tramiteNombre: "Divorcio por mutuo consentimiento",
    fecha: hoy(1),
    hora: "10:00",
    modalidad: "presencial",
    origen: "mostrador",
  },
  {
    id: "c-seed-2",
    registroId: "r-seed-2",
    cliente: "María Fernanda Ríos",
    tramiteNombre: "Poder general o especial",
    fecha: hoy(0),
    hora: "15:30",
    modalidad: "presencial",
    origen: "whatsapp",
  },
  {
    id: "c-seed-3",
    registroId: "r-seed-3",
    cliente: "Jorge Paredes",
    tramiteNombre: "Cancelación de hipoteca",
    fecha: hoy(2),
    hora: "09:00",
    modalidad: "telematica",
    origen: "mostrador",
  },
];

function read<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function write<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getRegistros(): TramiteRegistro[] {
  return read<TramiteRegistro>(K_REGISTROS, SEED_REGISTROS);
}

export function getCitas(): Cita[] {
  return read<Cita>(K_CITAS, SEED_CITAS);
}

export function addRegistro(r: Omit<TramiteRegistro, "id" | "creadoEn">): TramiteRegistro {
  const nuevo: TramiteRegistro = {
    ...r,
    id: `r-${Date.now()}`,
    creadoEn: new Date().toISOString(),
  };
  write(K_REGISTROS, [nuevo, ...getRegistros()]);
  return nuevo;
}

export function setEstado(id: string, estado: EstadoTramite) {
  write(
    K_REGISTROS,
    getRegistros().map((r) => (r.id === id ? { ...r, estado } : r))
  );
}

export function addCita(c: Omit<Cita, "id">): Cita {
  const nueva: Cita = { ...c, id: `c-${Date.now()}` };
  write(K_CITAS, [nueva, ...getCitas()]);
  return nueva;
}

export function resetDemo() {
  write(K_REGISTROS, SEED_REGISTROS);
  write(K_CITAS, SEED_CITAS);
}

/** Suscripción a cambios (misma pestaña vía CustomEvent, otras pestañas vía storage). */
export function onStoreChange(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener(EVT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener("storage", h);
  };
}

/** Mensaje de WhatsApp que "se enviaría" al cliente en cada cambio de estado. */
export function mensajeEstado(r: TramiteRegistro, estado: EstadoTramite): string {
  const nombre = r.cliente.split(" ")[0];
  switch (estado) {
    case "recibido":
      return `Hola ${nombre} 👋 Recibimos su trámite "${r.tramiteNombre}". Le avisaremos cada avance por este medio.`;
    case "docs-completos":
      return `${nombre}, sus documentos están completos ✅. Su trámite pasó a elaboración.`;
    case "en-matrizacion":
      return `${nombre}, su trámite está siendo elaborado por nuestro equipo ✍️. Le avisamos apenas esté listo.`;
    case "listo-firma":
      return `${nombre}, ¡su documento está listo para firma! 🎉 Puede acercarse a la Notaría 41 de 08h00 a 17h00. Traiga su cédula original.`;
    case "entregado":
      return `${nombre}, su trámite fue entregado. Gracias por confiar en la Notaría 41 🙌 ¿Necesita algo más? Escríbanos.`;
  }
}
