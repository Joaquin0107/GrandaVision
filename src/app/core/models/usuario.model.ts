export type Rol = 'Administrador' | 'Encargado de Compras';

export interface Usuario {
  id: number;
  usuario: string;
  password: string;
  nombreCompleto: string;
  rol: Rol;
}

export interface SesionActiva {
  id: number;
  usuario: string;
  nombreCompleto: string;
  rol: Rol;
  loginAt: string;
}
