// Catálogo de trámites frecuentes con tarifas referenciales 2026
// (cuantía indeterminada, Consejo de la Judicatura).
// IMPORTANTE: valores y requisitos PENDIENTES DE VALIDACIÓN LEGAL antes de producción.
import { conIva } from "./config";

export type UnidadExtra = "otorgante" | "menor" | "firmante";

export interface Tramite {
  id: string;
  nombre: string;
  nombreCorto: string;
  emoji: string;
  descripcion: string;
  /** Tarifa base oficial sin IVA (referencial 2026) */
  tarifaBase: number;
  /** Costo por unidad adicional sin IVA (otorgante, menor o firmante extra) */
  extraPorUnidad?: { unidad: UnidadExtra; valor: number; incluidas: number };
  requisitos: string[];
  tiempoEntrega: string;
  presencial: boolean;
  notaCuantia?: string;
}

export const TRAMITES: Tramite[] = [
  {
    id: "poder",
    nombre: "Poder general o especial (persona natural)",
    nombreCorto: "Poder",
    emoji: "📜",
    descripcion:
      "Autoriza a otra persona a actuar a tu nombre: trámites, bienes, bancos o juicios.",
    tarifaBase: 48.2,
    extraPorUnidad: { unidad: "otorgante", valor: 14.46, incluidas: 1 },
    requisitos: [
      "Cédula de identidad original y vigente del otorgante",
      "Certificado de votación vigente",
      "Nombres completos y cédula del apoderado",
      "Detalle claro de las facultades que se otorgan",
    ],
    tiempoEntrega: "Mismo día",
    presencial: true,
  },
  {
    id: "declaracion",
    nombre: "Declaración juramentada (persona natural)",
    nombreCorto: "Declaración juramentada",
    emoji: "✍️",
    descripcion:
      "Declaración bajo juramento para trámites: soltería, ingresos, dependencia, no poseer vivienda, etc.",
    tarifaBase: 24.1,
    extraPorUnidad: { unidad: "otorgante", valor: 14.46, incluidas: 1 },
    requisitos: [
      "Cédula de identidad original y vigente",
      "Certificado de votación vigente",
      "Texto o motivo de la declaración",
    ],
    tiempoEntrega: "Mismo día",
    presencial: true,
  },
  {
    id: "salida-menor",
    nombre: "Autorización de salida del país de menor",
    nombreCorto: "Salida de menor",
    emoji: "✈️",
    descripcion:
      "Permiso notarial para que un niño, niña o adolescente viaje fuera del Ecuador.",
    tarifaBase: 24.1,
    extraPorUnidad: { unidad: "menor", valor: 24.1, incluidas: 1 },
    requisitos: [
      "Cédula o pasaporte del/los progenitores que autorizan",
      "Certificado de votación de quien autoriza",
      "Cédula o partida de nacimiento del menor",
      "Datos del viaje: destino, fechas y acompañante",
      "Formulario único del Consejo de la Judicatura (lo ayudamos a llenar)",
    ],
    tiempoEntrega: "Mismo día",
    presencial: true,
  },
  {
    id: "divorcio",
    nombre: "Divorcio por mutuo consentimiento",
    nombreCorto: "Divorcio mutuo acuerdo",
    emoji: "🤝",
    descripcion:
      "Divorcio notarial cuando ambos cónyuges están de acuerdo y no hay hijos menores dependientes.",
    tarifaBase: 144.6,
    requisitos: [
      "Cédulas y certificados de votación de ambos cónyuges",
      "Partida de matrimonio actualizada",
      "Petición firmada por ambos con patrocinio de abogado/a",
      "No tener hijos menores de edad ni bajo dependencia",
      "Comparecencia personal de ambos a la audiencia",
    ],
    tiempoEntrega: "10 días hábiles aprox.",
    presencial: true,
  },
  {
    id: "vehiculo",
    nombre: "Contrato de compraventa de vehículo (reconocimiento de firmas)",
    nombreCorto: "Compraventa vehículo",
    emoji: "🚗",
    descripcion:
      "Reconocimiento de firmas del contrato de compraventa para el traspaso vehicular.",
    tarifaBase: 9.64,
    extraPorUnidad: { unidad: "firmante", valor: 9.64, incluidas: 1 },
    requisitos: [
      "Cédulas y certificados de votación de comprador y vendedor",
      "Matrícula del vehículo vigente",
      "Contrato de compraventa (podemos facilitar el formato)",
      "Pago del impuesto a la transferencia (1% SRI) si aplica",
    ],
    tiempoEntrega: "Mismo día",
    presencial: true,
    notaCuantia: "La tarifa varía según la cuantía del contrato.",
  },
  {
    id: "hipoteca",
    nombre: "Cancelación de hipoteca",
    nombreCorto: "Cancelación de hipoteca",
    emoji: "🏠",
    descripcion:
      "Escritura de cancelación cuando terminaste de pagar tu crédito hipotecario.",
    tarifaBase: 48.2,
    requisitos: [
      "Carta o minuta de cancelación emitida por el banco/acreedor",
      "Copia de la escritura de hipoteca",
      "Cédula y certificado de votación del compareciente",
      "Certificado de gravámenes (según el caso)",
    ],
    tiempoEntrega: "3 a 5 días hábiles",
    presencial: false,
    notaCuantia: "Luego debe inscribirse en el Registro de la Propiedad.",
  },
];

export function getTramite(id: string): Tramite {
  const t = TRAMITES.find((t) => t.id === id);
  if (!t) throw new Error(`Trámite desconocido: ${id}`);
  return t;
}

export interface Cotizacion {
  base: number;
  extras: number;
  subtotal: number;
  iva: number;
  total: number;
  unidades: number;
}

export function cotizar(tramite: Tramite, unidades = 1): Cotizacion {
  const incluidas = tramite.extraPorUnidad?.incluidas ?? 1;
  const adicionales = Math.max(0, unidades - incluidas);
  const extras = (tramite.extraPorUnidad?.valor ?? 0) * adicionales;
  const subtotal = tramite.tarifaBase + extras;
  const total = conIva(subtotal);
  return {
    base: tramite.tarifaBase,
    extras,
    subtotal,
    iva: Math.round((total - subtotal) * 100) / 100,
    total,
    unidades,
  };
}

export const ETIQUETA_UNIDAD: Record<UnidadExtra, [string, string]> = {
  otorgante: ["otorgante", "otorgantes"],
  menor: ["menor", "menores"],
  firmante: ["firmante", "firmantes"],
};
