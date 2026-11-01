---
name: qa-test-cases
description: Redacta planes de prueba, estrategias y casos de prueba funcionales (positivos y negativos), de regresión, UI y seguridad para una funcionalidad web, en el formato de este repo. Úsalo cuando el usuario pida casos de prueba, test plan, estrategia de testing, escenarios negativos o convertir un caso a script Selenium.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Casos y planes de prueba

Lee primero `Test plan` y `Test cases examples with different kind of testing`: son el modelo de formato.

## Estructura de un caso

```
N. <Título>
Test Description: <qué se verifica>
Preconditions: <estado inicial>
Test Steps:
  <paso 1>
  <paso 2>
Expected Result:
  <resultado observable>
```

## Pasos

1. Pregunta (o deduce del contexto) la funcionalidad y la URL a probar.
2. Escribe el plan: Objective, Preconditions, Test Cases.
3. Cubre por tipo: funcional positivo, funcional negativo (datos inválidos, campos vacíos, fechas pasadas), regresión, UI/responsive, seguridad.
4. Resultados esperados medibles, no vagos ("se muestran vuelos de Chicago a Quito en las fechas elegidas", no "funciona bien").
5. Si piden automatizar, usa el ejemplo `script ejm` (Selenium C#, NUnit) como base: espera explícita en vez de `Thread.Sleep` cuando sea posible.

No declares que un caso pasó: solo se redacta lo esperado.
