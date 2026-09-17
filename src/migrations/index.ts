import * as migration_20260917_013429_inicial from './20260917_013429_inicial';
import * as migration_20260917_040258_quitar_titulo_inicio from './20260917_040258_quitar_titulo_inicio';

export const migrations = [
  {
    up: migration_20260917_013429_inicial.up,
    down: migration_20260917_013429_inicial.down,
    name: '20260917_013429_inicial',
  },
  {
    up: migration_20260917_040258_quitar_titulo_inicio.up,
    down: migration_20260917_040258_quitar_titulo_inicio.down,
    name: '20260917_040258_quitar_titulo_inicio'
  },
];
