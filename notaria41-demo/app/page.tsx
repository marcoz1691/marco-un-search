import Link from "next/link";
import { NOTARIA, usd, conIva } from "@/lib/config";
import { TRAMITES } from "@/lib/tramites";

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* Barra demo */}
      <div className="bg-amber-400 text-amber-950 text-center text-sm py-1.5 px-4 font-medium">
        DEMO — Asistente Digital Notarial · datos y tarifas referenciales, pendientes de validación legal
      </div>

      {/* Header */}
      <header className="bg-[#0e2a47] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#0e2a47] text-lg">
              41
            </div>
            <div>
              <p className="font-semibold leading-tight">{NOTARIA.nombre}</p>
              <p className="text-xs text-slate-300 leading-tight">
                {NOTARIA.ciudad} · Fe pública con atención moderna
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/panel" className="text-slate-300 hover:text-white transition">
              Panel interno
            </Link>
            <Link
              href="/whatsapp"
              className="bg-[#25d366] hover:bg-[#1fb955] text-white px-4 py-2 rounded-full font-medium transition"
            >
              💬 WhatsApp
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0e2a47] text-white pb-20 pt-14">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#c9a227] font-semibold tracking-wide text-sm uppercase mb-3">
              La primera notaría con asistente digital 24/7
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Su trámite notarial,
              <br />
              <span className="text-[#c9a227]">sin filas ni vueltas.</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-md">
              Consulte requisitos, conozca el precio oficial exacto y agende su
              cita por WhatsApp en menos de 2 minutos. Llegue una sola vez, con
              todo listo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/whatsapp"
                className="bg-[#25d366] hover:bg-[#1fb955] text-white px-6 py-3.5 rounded-full font-semibold text-lg transition shadow-lg"
              >
                💬 Consultar por WhatsApp
              </Link>
              <a
                href="#tramites"
                className="border border-slate-500 hover:border-white text-white px-6 py-3.5 rounded-full font-medium text-lg transition"
              >
                Ver trámites y precios
              </a>
            </div>
          </div>

          {/* Mini vista previa del chat */}
          <div className="hidden md:block">
            <div className="bg-white rounded-3xl shadow-2xl p-4 max-w-sm ml-auto">
              <div className="bg-[#075e54] text-white rounded-t-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#0e2a47]">
                  41
                </div>
                <div>
                  <p className="text-sm font-semibold">{NOTARIA.nombre}</p>
                  <p className="text-xs text-green-200">en línea</p>
                </div>
              </div>
              <div className="wa-bg px-3 py-4 space-y-2 text-sm rounded-b-2xl">
                <div className="bg-white rounded-lg px-3 py-2 shadow max-w-[85%]">
                  ¡Hola! 👋 Soy el asistente de la {NOTARIA.nombre}. ¿Qué
                  trámite necesita?
                </div>
                <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 shadow max-w-[85%] ml-auto">
                  Necesito un poder para mi hermano
                </div>
                <div className="bg-white rounded-lg px-3 py-2 shadow max-w-[85%]">
                  📜 Con gusto. Requisitos: cédula, papeleta de votación…
                  <br />
                  💵 Total: <b>{usd(conIva(48.2))}</b>
                  <br />
                  📅 ¿Le agendo una cita?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#0e2a47] mb-12">
          Así de simple
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: "1",
              t: "Consulte por WhatsApp",
              d: "El asistente le responde al instante: requisitos exactos y precio oficial, a cualquier hora.",
            },
            {
              n: "2",
              t: "Agende su cita",
              d: "Elija día y hora. Le recordamos qué documentos traer para que no pierda el viaje.",
            },
            {
              n: "3",
              t: "Retire listo",
              d: "Le avisamos por WhatsApp cuando su documento esté listo para firma o retiro.",
            },
          ].map((p) => (
            <div key={p.n} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-12 h-12 rounded-full bg-[#0e2a47] text-[#c9a227] font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {p.n}
              </div>
              <h3 className="font-semibold text-lg text-[#0e2a47] mb-2">{p.t}</h3>
              <p className="text-slate-500">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trámites y precios */}
      <section id="tramites" className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#0e2a47] mb-3">
            Trámites frecuentes con precio oficial
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
            Tarifas fijadas por el Consejo de la Judicatura. En la {NOTARIA.nombre}{" "}
            usted conoce el valor exacto antes de venir — sin sorpresas.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {TRAMITES.map((t) => (
              <div
                key={t.id}
                className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition flex flex-col"
              >
                <div className="text-3xl mb-3">{t.emoji}</div>
                <h3 className="font-semibold text-[#0e2a47] mb-1">{t.nombreCorto}</h3>
                <p className="text-sm text-slate-500 mb-4 flex-1">{t.descripcion}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Desde (IVA incluido)</p>
                    <p className="text-2xl font-bold text-[#0e2a47]">
                      {usd(conIva(t.tarifaBase))}
                    </p>
                  </div>
                  <Link
                    href={`/whatsapp?tramite=${t.id}`}
                    className="text-sm bg-[#25d366] hover:bg-[#1fb955] text-white px-3 py-2 rounded-full font-medium transition"
                  >
                    Consultar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info + CTA final */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#0e2a47] mb-4">
            Visítenos o escríbanos
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li>📍 {NOTARIA.direccion}, {NOTARIA.ciudad}</li>
            <li>🕐 {NOTARIA.horario}</li>
            <li>📞 {NOTARIA.telefono}</li>
            <li>✉️ {NOTARIA.correo}</li>
          </ul>
        </div>
        <div className="bg-[#0e2a47] rounded-3xl p-10 text-center text-white">
          <p className="text-2xl font-bold mb-2">¿Tiene un trámite pendiente?</p>
          <p className="text-slate-300 mb-6">
            Resuélvalo hoy. El asistente le atiende al instante.
          </p>
          <Link
            href="/whatsapp"
            className="inline-block bg-[#25d366] hover:bg-[#1fb955] text-white px-8 py-4 rounded-full font-semibold text-lg transition"
          >
            💬 Iniciar consulta
          </Link>
        </div>
      </section>

      <footer className="bg-[#0e2a47] text-slate-400 text-center text-sm py-6">
        {NOTARIA.nombre} · {NOTARIA.ciudad} — Demo del Asistente Digital Notarial
      </footer>
    </main>
  );
}
