"use client";

// Motor del asistente: máquina de estados basada en reglas/guiones.
// En producción este módulo se reemplaza por un LLM con la misma interfaz,
// manteniendo la base de conocimiento de lib/tramites.ts como fuente de verdad.

import { NOTARIA, usd } from "./config";
import {
  TRAMITES,
  Tramite,
  getTramite,
  cotizar,
  ETIQUETA_UNIDAD,
} from "./tramites";
import { addCita, addRegistro } from "./store";

export type Fase =
  | "inicio"
  | "tramite"
  | "unidades"
  | "cotizado"
  | "fecha"
  | "hora"
  | "nombre"
  | "cedula"
  | "confirmar";

export interface BotState {
  fase: Fase;
  tramiteId?: string;
  unidades?: number;
  fecha?: string;
  hora?: string;
  nombre?: string;
  cedula?: string;
}

export interface BotReply {
  state: BotState;
  mensajes: string[];
  chips: string[];
}

export const ESTADO_INICIAL: BotState = { fase: "inicio" };

const CHIPS_TRAMITES = TRAMITES.map((t) => `${t.emoji} ${t.nombreCorto}`);

export function saludoInicial(): BotReply {
  return {
    state: ESTADO_INICIAL,
    mensajes: [
      `¡Hola! 👋 Soy el asistente virtual de la *${NOTARIA.nombre}* de ${NOTARIA.ciudad}.\n\nPuedo darle *requisitos*, *precios* y *agendar su cita* al instante, las 24 horas.\n\n¿Qué trámite necesita?`,
    ],
    chips: CHIPS_TRAMITES,
  };
}

function detectarTramite(texto: string): Tramite | undefined {
  const t = texto.toLowerCase();
  const match = (kw: string[]) => kw.some((k) => t.includes(k));
  if (match(["poder"])) return getTramite("poder");
  if (match(["declaraci", "juramentada"])) return getTramite("declaracion");
  if (match(["salida", "menor", "viaje", "viajar", "hijo", "hija"]))
    return getTramite("salida-menor");
  if (match(["divorcio", "divorciar"])) return getTramite("divorcio");
  if (match(["vehic", "vehíc", "carro", "auto", "compraventa", "traspaso"]))
    return getTramite("vehiculo");
  if (match(["hipoteca"])) return getTramite("hipoteca");
  return undefined;
}

function fechasDisponibles(): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const d = new Date();
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  while (out.length < 3) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    out.push({
      label: `${dias[dow]} ${d.getDate()} ${meses[d.getMonth()]}`,
      value: d.toISOString().slice(0, 10),
    });
  }
  return out;
}

const HORAS = ["09:00", "11:30", "15:30"];

function requisitosMsg(tr: Tramite): string {
  const lista = tr.requisitos.map((r) => `  ☑️ ${r}`).join("\n");
  return `${tr.emoji} *${tr.nombre}*\n\n_${tr.descripcion}_\n\n*Requisitos:*\n${lista}\n\n⏱️ Entrega: ${tr.tiempoEntrega}${tr.notaCuantia ? `\n\nℹ️ ${tr.notaCuantia}` : ""}`;
}

function cotizacionMsg(tr: Tramite, unidades: number): string {
  const c = cotizar(tr, unidades);
  const lineas = [`*Cotización — ${tr.nombreCorto}*`, "", `Tarifa oficial: ${usd(c.base)}`];
  if (c.extras > 0 && tr.extraPorUnidad) {
    const [sing, plur] = ETIQUETA_UNIDAD[tr.extraPorUnidad.unidad];
    const n = unidades - tr.extraPorUnidad.incluidas;
    lineas.push(`${n} ${n === 1 ? sing : plur} adicional${n === 1 ? "" : "es"}: ${usd(c.extras)}`);
  }
  lineas.push(`IVA 15%: ${usd(c.iva)}`, "", `💵 *Total: ${usd(c.total)}*`);
  lineas.push("", "_Tarifa oficial del Consejo de la Judicatura. Sin recargos ocultos._");
  return lineas.join("\n");
}

export function procesar(state: BotState, input: string): BotReply {
  const texto = input.trim();
  const lower = texto.toLowerCase();

  // Respuestas globales disponibles en cualquier fase
  if (/(horario|hora de atención|atienden)/.test(lower)) {
    return {
      state,
      mensajes: [`🕐 Nuestro horario: ${NOTARIA.horario}.\n📍 ${NOTARIA.direccion}, ${NOTARIA.ciudad}.`],
      chips: state.fase === "inicio" ? CHIPS_TRAMITES : ["Volver al inicio"],
    };
  }
  if (/(dirección|direccion|ubicaci|dónde|donde queda)/.test(lower)) {
    return {
      state,
      mensajes: [`📍 Estamos en ${NOTARIA.direccion}, ${NOTARIA.ciudad}.\n🕐 ${NOTARIA.horario}.`],
      chips: state.fase === "inicio" ? CHIPS_TRAMITES : ["Volver al inicio"],
    };
  }
  if (/volver al inicio|otra consulta|otro trámite|otro tramite/.test(lower)) {
    return saludoInicial();
  }

  switch (state.fase) {
    case "inicio":
    case "tramite":
    case "cotizado": {
      // ¿Menciona un trámite?
      const tr = detectarTramite(lower);
      if (tr) {
        const next: BotState = { fase: "tramite", tramiteId: tr.id };
        return {
          state: next,
          mensajes: [requisitosMsg(tr), "¿Desea que le cotice el valor exacto? 💵"],
          chips: ["Sí, cotizar", "Agendar cita", "Otra consulta"],
        };
      }
      if (state.tramiteId && /cotizar|precio|costo|cu[aá]nto|valor/.test(lower)) {
        const tr2 = getTramite(state.tramiteId);
        if (tr2.extraPorUnidad) {
          const [sing, plur] = ETIQUETA_UNIDAD[tr2.extraPorUnidad.unidad];
          return {
            state: { ...state, fase: "unidades" },
            mensajes: [`¿Para cuántos ${plur} sería? (${sing === "menor" ? "número de menores que viajan" : `número de ${plur}`})`],
            chips: ["1", "2", "3"],
          };
        }
        return {
          state: { ...state, fase: "cotizado" },
          mensajes: [cotizacionMsg(tr2, 1), "¿Le agendo una cita para realizarlo? 📅"],
          chips: ["Agendar cita", "Otra consulta"],
        };
      }
      if (state.tramiteId && /agendar|cita|turno/.test(lower)) {
        return pedirFecha({ ...state, unidades: state.unidades ?? 1 });
      }
      if (/precio|costo|cu[aá]nto|valor|cotiz/.test(lower)) {
        return {
          state,
          mensajes: ["Con gusto 💵 ¿De qué trámite necesita el precio?"],
          chips: CHIPS_TRAMITES,
        };
      }
      if (/gracias|muchas gracias/.test(lower)) {
        return {
          state,
          mensajes: [`¡Con gusto! 🙌 La ${NOTARIA.nombre} está para servirle. Escríbame cuando necesite otro trámite.`],
          chips: ["Volver al inicio"],
        };
      }
      if (/hola|buenos|buenas/.test(lower)) return saludoInicial();
      return {
        state,
        mensajes: [
          "Le ayudo con requisitos, precios y citas de estos trámites. Si su consulta es distinta, un asesor de la notaría la atenderá en horario de oficina 👨‍💼.\n\n¿Cuál de estos necesita?",
        ],
        chips: CHIPS_TRAMITES,
      };
    }

    case "unidades": {
      const n = parseInt(lower.replace(/\D/g, ""), 10);
      const unidades = isNaN(n) || n < 1 ? 1 : Math.min(n, 10);
      const tr = getTramite(state.tramiteId!);
      return {
        state: { ...state, fase: "cotizado", unidades },
        mensajes: [cotizacionMsg(tr, unidades), "¿Le agendo una cita para realizarlo? 📅"],
        chips: ["Agendar cita", "Otra consulta"],
      };
    }

    case "fecha": {
      const opciones = fechasDisponibles();
      const elegida =
        opciones.find((o) => lower.includes(o.label)) ??
        opciones.find((o) => lower.includes(o.value)) ??
        opciones.find((o) => o.label.split(" ")[0] === lower.split(" ")[0]);
      if (!elegida) {
        return {
          state,
          mensajes: ["Elija una de las fechas disponibles, por favor 🙏"],
          chips: opciones.map((o) => o.label),
        };
      }
      return {
        state: { ...state, fase: "hora", fecha: elegida.value },
        mensajes: [`Perfecto, *${elegida.label}*. ¿A qué hora le conviene?`],
        chips: HORAS,
      };
    }

    case "hora": {
      const hora = HORAS.find((h) => lower.includes(h)) ?? (/(\d{1,2}):(\d{2})/.exec(lower)?.[0] || "");
      if (!hora) {
        return { state, mensajes: ["¿A qué hora le conviene?"], chips: HORAS };
      }
      return {
        state: { ...state, fase: "nombre", hora },
        mensajes: ["Anotado ✅ Para registrar su cita, ¿me indica sus *nombres completos*?"],
        chips: [],
      };
    }

    case "nombre": {
      if (texto.length < 5) {
        return { state, mensajes: ["¿Me indica sus nombres y apellidos completos, por favor?"], chips: [] };
      }
      return {
        state: { ...state, fase: "cedula", nombre: texto },
        mensajes: [`Gracias, ${texto.split(" ")[0]} 🙂 Ahora su *número de cédula* (10 dígitos):`],
        chips: [],
      };
    }

    case "cedula": {
      const ced = lower.replace(/\D/g, "");
      if (ced.length !== 10) {
        return { state, mensajes: ["La cédula debe tener 10 dígitos. Inténtelo de nuevo 🙏"], chips: [] };
      }
      const tr = getTramite(state.tramiteId!);
      const c = cotizar(tr, state.unidades ?? 1);
      const fechaLabel = fechasDisponibles().find((f) => f.value === state.fecha)?.label ?? state.fecha;
      return {
        state: { ...state, fase: "confirmar", cedula: ced },
        mensajes: [
          `*Resumen de su cita* 📋\n\n${tr.emoji} ${tr.nombreCorto}\n👤 ${state.nombre}\n🪪 ${ced}\n📅 ${fechaLabel} · ${state.hora}\n💵 Total referencial: ${usd(c.total)}\n📍 ${NOTARIA.nombre}, ${NOTARIA.direccion}\n\n¿Confirmo su cita?`,
        ],
        chips: ["✅ Confirmar cita", "Cambiar fecha"],
      };
    }

    case "confirmar": {
      if (/cambiar/.test(lower)) {
        return pedirFecha(state);
      }
      if (/confirm|s[ií]/.test(lower)) {
        const tr = getTramite(state.tramiteId!);
        const c = cotizar(tr, state.unidades ?? 1);
        // Registrar en el "sistema" de la notaría (visible en el panel)
        const registro = addRegistro({
          tramiteId: tr.id,
          tramiteNombre: tr.nombre,
          cliente: state.nombre!,
          cedula: state.cedula!,
          celular: "+593 9x xxx xxxx",
          estado: "recibido",
          total: c.total,
          origen: "whatsapp",
        });
        addCita({
          registroId: registro.id,
          cliente: state.nombre!,
          tramiteNombre: tr.nombreCorto,
          fecha: state.fecha!,
          hora: state.hora!,
          modalidad: "presencial",
          origen: "whatsapp",
        });
        const lista = tr.requisitos.map((r) => `  ☑️ ${r}`).join("\n");
        return {
          state: ESTADO_INICIAL,
          mensajes: [
            `¡Cita confirmada! 🎉\n\nLe esperamos en la ${NOTARIA.nombre}. Recibirá un recordatorio un día antes.\n\n*No olvide traer:*\n${lista}\n\n_Su trámite ya quedó registrado en nuestro sistema con seguimiento por WhatsApp._`,
          ],
          chips: ["Otra consulta"],
        };
      }
      return {
        state,
        mensajes: ["¿Confirmo su cita?"],
        chips: ["✅ Confirmar cita", "Cambiar fecha"],
      };
    }
  }
}

function pedirFecha(state: BotState): BotReply {
  const opciones = fechasDisponibles();
  return {
    state: { ...state, fase: "fecha" },
    mensajes: ["Con gusto 📅 Tenemos disponibilidad en estas fechas:"],
    chips: opciones.map((o) => o.label),
  };
}

/** Guion del modo guiado: se reproduce solo para la demo en vivo. */
export const GUION_DEMO: string[] = [
  "Hola",
  "Necesito el permiso para que mi hija viaje a España",
  "Sí, cotizar",
  "1",
  "Agendar cita",
  "__FECHA_1__", // se reemplaza por la primera fecha disponible
  "09:00",
  "Ana Belén Castro Játiva",
  "1756789012",
  "✅ Confirmar cita",
];

export function primeraFechaDisponible(): string {
  return fechasDisponibles()[0].label;
}
