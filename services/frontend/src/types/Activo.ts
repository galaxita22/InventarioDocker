export interface Activo {
  id: number;
  codigo_patrimonial: string;
  descripcion: string;
  categoria: string;
  estado_conservacion: string;
  valor: number;
  ubicacion_id: number;
  Ubicacion?: {
    nombre: string;
    dependencia: string;
  };
}