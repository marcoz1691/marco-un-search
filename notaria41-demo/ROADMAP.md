# Roadmap — Asistente Digital Notarial

Contexto: la Notaría 41 **no usa PESNOT**. El único sistema estatal de uso
diario y obligatorio es el **SIN** (Sistema Informático Notarial del Consejo
de la Judicatura), donde se registra cada acto y se factura. Este producto no
depende de PESNOT y convive con el SIN.

## Fase 1 — Demo (este repo, lista)

Landing + simulador de WhatsApp + panel interno con datos de ejemplo.
Objetivo: validar interés con el notario y levantar feedback real del despacho.

## Fase 2 — Producto en producción (piloto Notaría 41)

### Funcional
- WhatsApp Business API real (BSP oficial de Meta) con el número de la notaría.
- IA (LLM) usando `lib/tramites.ts` como base de conocimiento **validada por
  el equipo legal** — el bot no inventa: responde solo desde la base aprobada.
- Backend con base de datos, autenticación y panel multiusuario.
- Recordatorios automáticos de citas y avisos de estado.

### Seguridad de la información (requisito, no opcional)

Una notaría maneja identidad, patrimonio y actos con fe pública. El diseño
de seguridad es argumento de venta, no solo cumplimiento:

| Capa | Medida |
|---|---|
| Legal | Cumplimiento **LOPDP** (Ley Orgánica de Protección de Datos Personales): consentimiento, finalidad, derechos de acceso/rectificación/eliminación. |
| Canal | **Nada sensible por WhatsApp** (criterio de la Res. 305-2022): por chat solo datos mínimos (nombre, cédula, trámite). Documentos se suben por **portal seguro** con enlaces temporales y cifrados. |
| Datos | Cifrado en tránsito (TLS 1.2+) y en reposo (AES-256). **Aislamiento por notaría** (multi-tenant con separación estricta de datos). |
| Acceso | Roles y permisos (notario / matrizador / recepción), segundo factor (2FA), sesiones con expiración. |
| Trazabilidad | **Bitácora de auditoría inmutable**: quién vio o cambió qué y cuándo. El notario responde con fe pública; el sistema le da evidencia. |
| Continuidad | Respaldos automáticos diarios, política de retención y borrado seguro. |
| Secretos | Credenciales (WhatsApp, SIN) cifradas en bóveda; jamás en texto plano ni en el código. |

## Fase 3 — Copiloto SIN (pre-carga automática de trámites)

El trabajo más tedioso del matrizador: re-tipear en el SIN los datos que ya
están en el documento aprobado. El copiloto lo elimina.

### Flujo (ejemplo: contrato de arriendo)

```
1. Matrizador aprueba el documento final (PDF/Word).
2. Extractor IA (OCR + LLM) obtiene los campos:
   comparecientes, cédulas, tipo de acto, cuantía, canon, plazo, inmueble.
3. El agente abre el SIN y PRE-LLENA el formulario del libro
   correspondiente (ej. inscripción de arrendamiento).
4. El funcionario REVISA y da el clic final de registro.
```

### Principios de diseño
- **Human-in-the-loop obligatorio**: el agente nunca registra solo. La fe
  pública es del notario; el sistema solo elimina el tipeo, no la revisión.
- **Dato capturado una sola vez**: lo que el cliente dio por WhatsApp o en
  mostrador fluye hasta el SIN sin re-digitación (menos errores, más rápido).
- Credenciales del SIN cifradas y bajo control del notario.

### Implementación técnica (dos variantes)
1. **RPA con navegador automatizado** (Playwright) en un equipo de la notaría.
2. **Plan B más robusto legalmente**: extensión de navegador que autocompleta
   los formularios **dentro de la sesión del propio funcionario** (el humano
   ya está autenticado; la extensión solo escribe por él).

### Riesgos y mitigación
- Cambios de interfaz del SIN → selectores mantenibles + monitoreo de fallos.
- Captcha/2FA del SIN → la variante extensión evita el problema (sesión humana).
- Políticas del Consejo de la Judicatura → validar con el notario; la variante
  extensión es asistencia de digitación, no acceso automatizado externo.

## Fase 4 — Escala

- Replicar a más notarías (config por notaría, mismo motor).
- Plan para estudios jurídicos: abogados dan seguimiento a los trámites de
  sus clientes desde la plataforma.
- Módulo premium: plantillas de minutas pre-llenadas (redactadas y validadas
  por el equipo legal propio).
