"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NOTARIA } from "@/lib/config";
import { getTramite } from "@/lib/tramites";
import {
  BotState,
  ESTADO_INICIAL,
  GUION_DEMO,
  primeraFechaDisponible,
  procesar,
  saludoInicial,
} from "@/lib/bot";

interface Msg {
  id: number;
  de: "bot" | "user";
  texto: string;
  hora: string;
}

let msgId = 0;

function horaActual(): string {
  return new Date().toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Render sencillo de *negrita* y _cursiva_ estilo WhatsApp */
function formatoWA(texto: string) {
  const partes = texto.split(/(\*[^*]+\*|_[^_]+_)/g);
  return partes.map((p, i) => {
    if (p.startsWith("*") && p.endsWith("*"))
      return <b key={i}>{p.slice(1, -1)}</b>;
    if (p.startsWith("_") && p.endsWith("_"))
      return (
        <span key={i} className="italic text-slate-500">
          {p.slice(1, -1)}
        </span>
      );
    return <span key={i}>{p}</span>;
  });
}

function Chat() {
  const params = useSearchParams();
  const [mensajes, setMensajes] = useState<Msg[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [guiando, setGuiando] = useState(false);
  const botState = useRef<BotState>(ESTADO_INICIAL);
  const scrollRef = useRef<HTMLDivElement>(null);
  const iniciado = useRef(false);

  const pushMsgs = (de: "bot" | "user", textos: string[]) => {
    setMensajes((prev) => [
      ...prev,
      ...textos.map((t) => ({ id: ++msgId, de, texto: t, hora: horaActual() })),
    ]);
  };

  const responder = async (reply: ReturnType<typeof procesar>) => {
    setChips([]);
    setEscribiendo(true);
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
    setEscribiendo(false);
    botState.current = reply.state;
    pushMsgs("bot", reply.mensajes);
    setChips(reply.chips);
  };

  const enviar = async (texto: string) => {
    const t = texto.trim();
    if (!t) return;
    setInput("");
    pushMsgs("user", [t]);
    await responder(procesar(botState.current, t));
  };

  // Arranque: saludo inicial (+ pregunta pre-cargada si viene ?tramite=)
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    const saludo = saludoInicial();
    botState.current = saludo.state;
    pushMsgs("bot", saludo.mensajes);
    setChips(saludo.chips);
    const tramiteId = params.get("tramite");
    if (tramiteId) {
      try {
        const tr = getTramite(tramiteId);
        setTimeout(() => enviar(`Necesito información sobre ${tr.nombreCorto}`), 600);
      } catch {
        // id inválido: se ignora
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [mensajes, escribiendo]);

  const modoGuiado = async () => {
    if (guiando) return;
    setGuiando(true);
    setMensajes([]);
    setChips([]);
    botState.current = ESTADO_INICIAL;
    const saludo = saludoInicial();
    botState.current = saludo.state;
    pushMsgs("bot", saludo.mensajes);
    await new Promise((r) => setTimeout(r, 900));
    for (const paso of GUION_DEMO) {
      const texto = paso === "__FECHA_1__" ? primeraFechaDisponible() : paso;
      pushMsgs("user", [texto]);
      await new Promise((r) => setTimeout(r, 400));
      const reply = procesar(botState.current, texto);
      setEscribiendo(true);
      await new Promise((r) => setTimeout(r, 900));
      setEscribiendo(false);
      botState.current = reply.state;
      pushMsgs("bot", reply.mensajes);
      setChips(reply.chips);
      await new Promise((r) => setTimeout(r, 1200));
    }
    setGuiando(false);
  };

  return (
    <main className="min-h-screen bg-[#111b21] flex flex-col items-center">
      {/* Barra superior de la demo */}
      <div className="w-full bg-[#0e2a47] text-white text-sm px-4 py-2 flex items-center justify-between">
        <Link href="/" className="hover:underline">
          ← Volver a la página de la notaría
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={modoGuiado}
            disabled={guiando}
            className="bg-[#c9a227] text-[#0e2a47] font-semibold px-3 py-1 rounded-full disabled:opacity-50"
          >
            {guiando ? "Reproduciendo…" : "▶ Modo guiado (demo automática)"}
          </button>
          <Link href="/panel" className="hover:underline text-slate-300">
            Ver panel interno →
          </Link>
        </div>
      </div>

      {/* Teléfono */}
      <div className="w-full max-w-md flex-1 flex flex-col shadow-2xl">
        {/* Header WhatsApp */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#0e2a47]">
            41
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-tight">{NOTARIA.nombre}</p>
            <p className="text-xs text-green-200">
              {escribiendo ? "escribiendo…" : "en línea · responde al instante"}
            </p>
          </div>
          <span className="text-xl opacity-80">📞</span>
          <span className="text-xl opacity-80">⋮</span>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="wa-bg flex-1 overflow-y-auto px-3 py-4 space-y-2">
          <div className="text-center">
            <span className="bg-[#fdf3c7] text-slate-600 text-[11px] px-3 py-1 rounded-lg shadow-sm">
              🔒 Demo — conversación simulada del asistente con IA
            </span>
          </div>
          {mensajes.map((m) => (
            <div
              key={m.id}
              className={`msg-in flex ${m.de === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 shadow text-[14.5px] leading-snug whitespace-pre-wrap ${
                  m.de === "user" ? "bg-[#dcf8c6]" : "bg-white"
                }`}
              >
                {formatoWA(m.texto)}
                <span className="block text-right text-[10px] text-slate-400 mt-1">
                  {m.hora} {m.de === "user" && <span className="text-sky-500">✓✓</span>}
                </span>
              </div>
            </div>
          ))}
          {escribiendo && (
            <div className="flex justify-start msg-in">
              <div className="bg-white rounded-lg px-4 py-3 shadow flex gap-1">
                <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Chips de respuesta rápida */}
        {chips.length > 0 && !guiando && (
          <div className="bg-[#e5ddd5] px-3 pb-2 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => enviar(c)}
                className="bg-white border border-[#25d366] text-[#075e54] text-sm px-3 py-1.5 rounded-full shadow-sm hover:bg-[#25d366] hover:text-white transition"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(input);
          }}
          className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2"
        >
          <span className="text-2xl text-slate-400">😊</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={guiando}
            placeholder="Escriba un mensaje"
            className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={guiando}
            className="w-11 h-11 rounded-full bg-[#25d366] text-white text-lg flex items-center justify-center disabled:opacity-60"
            aria-label="Enviar"
          >
            ➤
          </button>
        </form>
      </div>
    </main>
  );
}

export default function WhatsAppPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}
