// Configuración de la notaría. Para replicar la demo a otra notaría,
// basta cambiar este archivo.
export const NOTARIA = {
  nombre: "Notaría 41",
  nombreLargo: "Notaría Cuadragésima Primera",
  // TODO: confirmar ciudad con el cliente (placeholder: Quito)
  ciudad: "Quito",
  provincia: "Pichincha",
  direccion: "Av. Amazonas y Naciones Unidas (referencial)",
  telefono: "(02) 000-0000",
  whatsapp: "+593 99 000 0000",
  correo: "info@notaria41.ec",
  horario: "Lunes a viernes · 08h00 – 17h00",
  notario: "Dr. Notario Titular",
} as const;

export const IVA = 0.15;

export function conIva(base: number): number {
  return Math.round(base * (1 + IVA) * 100) / 100;
}

export function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}
