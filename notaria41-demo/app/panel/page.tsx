"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NOTARIA, usd } from "@/lib/config";
import { TRAMITES, cotizar, getTramite, ETIQUETA_UNIDAD } from "@/lib/tramites";
import {
  Cita,
  ESTADOS,
  EstadoTramite,
  TramiteRegistro,
  addRegistro,
  getCitas,
  getRegistros,
  mensajeEstado,
  onStoreChange,
  resetDemo,
  setEstado,
} from "@/lib/store";

type Tab = "dashboard" | "tramites" | "agenda" | "mostrador" | "cotizador";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "tramites", label: "Trámites", icon: "📁" },
  { id: "agenda", label: "Agenda", icon: "📅" },
  { id: "mostrador", label: "Mostrador", icon: "🛎️" },
  { id: "cotizador", label: "Cotizador", icon: "💵" },
];

function fechaLarga(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function Panel() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [registros, setRegistros] = useState<TramiteRegistro[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const refrescar = () => {
    setRegistros(getRegistros());
    setCitas(getCitas());
  };

  useEffect(() => {
    refrescar();
    return onStoreChange(refrescar);
  }, []);

  const notificar = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 6000);
  };

  return (
    <main className="min-h-screen bg-[#f1f4f8]">
      {/* Header */}
      <header className="bg-[#171d28] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={NOTARIA.logo}
            alt=""
            className="w-9 h-9 rounded-full bg-white p-0.5"
          />
          <div>
            <p className="font-semibold leading-tight">{NOTARIA.nombre} · Panel interno</p>
            <p className="text-xs text-slate-300">Sistema de atención y seguimiento — Demo</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => {
              resetDemo();
              notificar("Datos de la demo reiniciados.");
            }}
            className="text-slate-300 hover:text-white"
          >
            ↺ Reiniciar demo
          </button>
          <Link href="/whatsapp" className="text-slate-300 hover:text-white">
            Simulador WhatsApp
          </Link>
          <Link href="/" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">
            Sitio público
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-slate-200 px-6 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t.id
                ? "border-[#171d28] text-[#171d28]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === "dashboard" && <Dashboard registros={registros} citas={citas} />}
        {tab === "tramites" && (
          <Tramites registros={registros} onNotificar={notificar} />
        )}
        {tab === "agenda" && <Agenda citas={citas} />}
        {tab === "mostrador" && <Mostrador onNotificar={notificar} />}
        {tab === "cotizador" && <Cotizador />}
      </div>

      {/* Toast estilo WhatsApp */}
      {toast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-[#075e54] text-white rounded-2xl shadow-2xl p-4 msg-in z-50">
          <p className="text-xs text-green-200 font-semibold mb-1">
            💬 WhatsApp enviado al cliente
          </p>
          <p className="text-sm leading-snug">{toast}</p>
        </div>
      )}
    </main>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({
  registros,
  citas,
}: {
  registros: TramiteRegistro[];
  citas: Cita[];
}) {
  const porWhatsapp = registros.filter((r) => r.origen === "whatsapp").length;
  const ingreso = registros.reduce((s, r) => s + r.total, 0);
  const kpis = [
    { label: "Consultas atendidas por el asistente (mes)", valor: "312", nota: "84% resueltas sin personal" },
    { label: "Trámites activos", valor: String(registros.filter((r) => r.estado !== "entregado").length), nota: `${porWhatsapp} llegaron por WhatsApp` },
    { label: "Citas agendadas", valor: String(citas.length), nota: "recordatorio automático activo" },
    { label: "Ingreso estimado registrado", valor: usd(ingreso), nota: "tarifas oficiales + IVA" },
  ];
  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-3xl font-bold text-[#171d28]">{k.valor}</p>
            <p className="text-sm text-slate-600 mt-1">{k.label}</p>
            <p className="text-xs text-emerald-600 mt-2">{k.nota}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#171d28] mb-4">Trámites por estado</h3>
          {ESTADOS.map((e) => {
            const n = registros.filter((r) => r.estado === e.id).length;
            const pct = registros.length ? (n / registros.length) * 100 : 0;
            return (
              <div key={e.id} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{e.label}</span>
                  <span className="font-medium">{n}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#171d28] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#171d28] mb-4">Lo que el asistente resolvió hoy (simulado)</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2"><span>🕐</span> 22:14 — Requisitos de poder especial → cita agendada</li>
            <li className="flex gap-2"><span>🕐</span> 20:03 — Cotización salida de menor (2 menores)</li>
            <li className="flex gap-2"><span>🕐</span> 19:47 — “¿Ya está mi escritura?” → estado informado automáticamente</li>
            <li className="flex gap-2"><span>🕐</span> 13:22 — Horario y dirección (turista, desde EE.UU.)</li>
            <li className="flex gap-2"><span>🕐</span> 09:10 — Divorcio mutuo acuerdo → derivado a asesor con datos completos</li>
          </ul>
          <p className="text-xs text-slate-400 mt-4">
            Cada consulta fuera de horario es un cliente que antes se perdía o llamaba al día siguiente.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Trámites ---------------- */

function Tramites({
  registros,
  onNotificar,
}: {
  registros: TramiteRegistro[];
  onNotificar: (m: string) => void;
}) {
  const cambiar = (r: TramiteRegistro, estado: EstadoTramite) => {
    setEstado(r.id, estado);
    onNotificar(mensajeEstado(r, estado));
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-[#171d28]">Trámites en curso</h3>
        <p className="text-xs text-slate-400">
          Al cambiar el estado, el cliente recibe el aviso por WhatsApp automáticamente
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Trámite</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => {
              const est = ESTADOS.find((e) => e.id === r.estado)!;
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-800">{r.cliente}</p>
                    <p className="text-xs text-slate-400">CI {r.cedula} · {r.celular}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.tramiteNombre}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${r.origen === "whatsapp" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {r.origen === "whatsapp" ? "💬 WhatsApp" : "🛎️ Mostrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{usd(r.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.estado}
                      onChange={(e) => cambiar(r, e.target.value as EstadoTramite)}
                      className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 cursor-pointer ${est.color}`}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Agenda ---------------- */

function Agenda({ citas }: { citas: Cita[] }) {
  const porFecha = useMemo(() => {
    const map = new Map<string, Cita[]>();
    [...citas]
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
      .forEach((c) => {
        map.set(c.fecha, [...(map.get(c.fecha) ?? []), c]);
      });
    return Array.from(map.entries());
  }, [citas]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#171d28] text-lg">Citas agendadas</h3>
        <p className="text-xs text-slate-400">
          Las citas confirmadas en el simulador de WhatsApp aparecen aquí al instante
        </p>
      </div>
      {porFecha.length === 0 && (
        <p className="text-slate-400 bg-white rounded-2xl p-8 text-center">Sin citas registradas.</p>
      )}
      <div className="space-y-6">
        {porFecha.map(([fecha, lista]) => (
          <div key={fecha}>
            <p className="text-sm font-semibold text-slate-500 capitalize mb-2">
              {fechaLarga(fecha)}
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {lista.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 msg-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-[#171d28]">{c.hora}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.modalidad === "telematica" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                      {c.modalidad === "telematica" ? "💻 Telemática" : "🏢 Presencial"}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">{c.cliente}</p>
                  <p className="text-sm text-slate-500">{c.tramiteNombre}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {c.origen === "whatsapp" ? "💬 Agendada por el asistente" : "🛎️ Registrada en mostrador"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Mostrador ---------------- */

function Mostrador({ onNotificar }: { onNotificar: (m: string) => void }) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [celular, setCelular] = useState("");
  const [tramiteId, setTramiteId] = useState(TRAMITES[0].id);
  const [ok, setOk] = useState(false);

  const registrar = (e: React.FormEvent) => {
    e.preventDefault();
    const tr = getTramite(tramiteId);
    const c = cotizar(tr, 1);
    addRegistro({
      tramiteId: tr.id,
      tramiteNombre: tr.nombre,
      cliente: nombre,
      cedula,
      celular: celular || "+593 9x xxx xxxx",
      estado: "recibido",
      total: c.total,
      origen: "mostrador",
    });
    onNotificar(
      `Hola ${nombre.split(" ")[0]} 👋 Bienvenido/a a la ${NOTARIA.nombre}. Registramos su trámite "${tr.nombreCorto}". Le enviaremos requisitos, avances y su turno por este WhatsApp.`
    );
    setOk(true);
    setNombre("");
    setCedula("");
    setCelular("");
    setTimeout(() => setOk(false), 4000);
  };

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-[#171d28] mb-1">Registro rápido de mostrador</h3>
        <p className="text-sm text-slate-500 mb-6">
          Para el cliente que llega a preguntar en persona: 4 campos, 30 segundos,
          y queda dentro del sistema con seguimiento por WhatsApp.
        </p>
        <form onSubmit={registrar} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Nombres completos</label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#171d28]"
              placeholder="Ej: Rosa Elena Tipán"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Cédula</label>
              <input
                required
                pattern="\d{10}"
                title="10 dígitos"
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#171d28]"
                placeholder="1712345678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Celular (WhatsApp)</label>
              <input
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#171d28]"
                placeholder="+593 99 123 4567"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Trámite</label>
            <select
              value={tramiteId}
              onChange={(e) => setTramiteId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#171d28] bg-white"
            >
              {TRAMITES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#171d28] hover:bg-[#242e3d] text-white font-semibold py-3 rounded-xl transition"
          >
            Registrar y enviar bienvenida por WhatsApp
          </button>
          {ok && (
            <p className="text-sm text-emerald-600 text-center">
              ✅ Cliente registrado. Ya aparece en la pestaña Trámites.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ---------------- Cotizador ---------------- */

function Cotizador() {
  const [tramiteId, setTramiteId] = useState(TRAMITES[0].id);
  const [unidades, setUnidades] = useState(1);
  const tr = getTramite(tramiteId);
  const c = cotizar(tr, unidades);
  const [sing, plur] = tr.extraPorUnidad
    ? ETIQUETA_UNIDAD[tr.extraPorUnidad.unidad]
    : ["", ""];

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-[#171d28] mb-1">Cotizador de tarifas oficiales</h3>
        <p className="text-sm text-slate-500 mb-6">
          Tarifario referencial 2026 (cuantía indeterminada) + IVA 15%.
          Pendiente de validación legal.
        </p>
        <div className="space-y-4">
          <select
            value={tramiteId}
            onChange={(e) => {
              setTramiteId(e.target.value);
              setUnidades(1);
            }}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none bg-white"
          >
            {TRAMITES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.nombre}
              </option>
            ))}
          </select>
          {tr.extraPorUnidad && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Número de {plur}:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUnidades(Math.max(1, unidades - 1))}
                  className="w-8 h-8 rounded-full bg-slate-100 font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{unidades}</span>
                <button
                  onClick={() => setUnidades(Math.min(10, unidades + 1))}
                  className="w-8 h-8 rounded-full bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}
          <div className="bg-slate-50 rounded-xl p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tarifa base</span>
              <span className="font-medium">{usd(c.base)}</span>
            </div>
            {c.extras > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {unidades - (tr.extraPorUnidad?.incluidas ?? 1)}{" "}
                  {unidades - (tr.extraPorUnidad?.incluidas ?? 1) === 1 ? sing : plur} adicional
                  {unidades - (tr.extraPorUnidad?.incluidas ?? 1) === 1 ? "" : "es"}
                </span>
                <span className="font-medium">{usd(c.extras)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">IVA 15%</span>
              <span className="font-medium">{usd(c.iva)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
              <span className="font-semibold text-[#171d28]">Total</span>
              <span className="font-bold text-[#171d28]">{usd(c.total)}</span>
            </div>
            {tr.notaCuantia && (
              <p className="text-xs text-amber-600 pt-1">ℹ️ {tr.notaCuantia}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
