# Asistente Digital Notarial — Demo Notaría 41

Demo funcional del "Asistente IA Notarial": un sistema de atención al cliente
para notarías del Ecuador, personalizado para la **Notaría 41 (Tumbaco, Quito)**.

> **DEMO.** No usa WhatsApp real ni IA real todavía: el bot funciona con
> guiones/reglas y los datos viven en el navegador (localStorage). Las tarifas
> y requisitos son **referenciales 2026** y están **pendientes de validación
> legal** antes de cualquier uso en producción.

## Qué incluye

| Ruta | Qué es |
|---|---|
| `/` | Landing pública de la Notaría 41: trámites frecuentes con precio oficial visible y acceso al asistente. |
| `/whatsapp` | Simulador visual de WhatsApp: el asistente responde requisitos, cotiza con tarifa oficial + IVA 15% y agenda citas. Incluye **modo guiado** (se reproduce solo). |
| `/panel` | Panel interno de la notaría: dashboard, trámites con estados y avisos automáticos, agenda, registro rápido de mostrador y cotizador. |

Trámites cargados: poder, declaración juramentada, autorización de salida de
menor, divorcio por mutuo consentimiento, compraventa de vehículo y
cancelación de hipoteca (`lib/tramites.ts`).

## Correr localmente

```bash
npm install
npm run dev
# abrir http://localhost:3000
```

Para cambiar el nombre, ciudad o datos de la notaría: `lib/config.ts`.

## Guion de demo (5 minutos)

1. **Landing (30 s).** Abrir `/`. Mensaje: "esta sería la cara digital de su
   notaría — la única del cantón que muestra precios oficiales y atiende 24/7".
2. **El asistente (2 min).** Ir a `/whatsapp` y pulsar
   **"Modo guiado (demo automática)"**: se reproduce sola una conversación real
   (salida de menor → requisitos → cotización → cita confirmada).
   Luego dejarle el teclado al notario para que pregunte lo que quiera
   (poder, divorcio, horario, precios…).
3. **El momento wow (1 min).** Abrir `/panel` → pestaña **Agenda**: la cita que
   el "cliente" acaba de confirmar por WhatsApp ya está ahí.
4. **Seguimiento (1 min).** Pestaña **Trámites**: cambiar un estado a
   "Listo para firma" y mostrar el aviso de WhatsApp que recibiría el cliente.
   Mensaje: "se acabaron las llamadas de '¿ya está mi escritura?'".
5. **El mostrador (30 s).** Pestaña **Mostrador**: registrar en 4 campos al
   cliente que llegó a pie. Mensaje: "nadie que pise la notaría vuelve a
   perderse; todos quedan con seguimiento automático".

Botón "Reiniciar demo" (arriba a la derecha del panel) restaura los datos de
ejemplo entre presentaciones.

## Siguientes fases

Ver [ROADMAP.md](./ROADMAP.md):

- **Fase 2 — Producción segura**: WhatsApp Business API real + IA con base de
  conocimiento validada legalmente, backend multiusuario, y seguridad de la
  información como requisito (LOPDP, cifrado, roles, auditoría, nada sensible
  por WhatsApp).
- **Fase 3 — Copiloto SIN**: agente que extrae los datos del documento
  aprobado por el matrizador (ej. contrato de arriendo) y pre-llena el
  registro en el Sistema Informático Notarial del Consejo de la Judicatura,
  con revisión humana antes del clic final.
- **Fase 4 — Escala**: multi-notaría (cambiando `lib/config.ts`), plan para
  estudios jurídicos y plantillas de minutas.
