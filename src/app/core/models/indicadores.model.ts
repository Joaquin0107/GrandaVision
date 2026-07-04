export interface Indicadores {
  erp: number;          // Nivel de utilización del ERP (%)
  reposicion: number;   // Tiempo promedio de reposición (horas)
  disponibilidad: number; // Disponibilidad de productos (%)
  sobrestock: number;   // Índice de sobrestock (%)
  historicoErp: number[];
  historicoReposicion: number[];
  meses: string[];
}
