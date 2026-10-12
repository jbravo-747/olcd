import * as migration_20260917_013429_inicial from './20260917_013429_inicial';
import * as migration_20260917_040258_quitar_titulo_inicio from './20260917_040258_quitar_titulo_inicio';
import * as migration_20261012_185010_actualiza_payload_3_90 from './20261012_185010_actualiza_payload_3_90';

export const migrations = [
  {
    up: migration_20260917_013429_inicial.up,
    down: migration_20260917_013429_inicial.down,
    name: '20260917_013429_inicial',
  },
  {
    up: migration_20260917_040258_quitar_titulo_inicio.up,
    down: migration_20260917_040258_quitar_titulo_inicio.down,
    name: '20260917_040258_quitar_titulo_inicio',
  },
  {
    up: migration_20261012_185010_actualiza_payload_3_90.up,
    down: migration_20261012_185010_actualiza_payload_3_90.down,
    name: '20261012_185010_actualiza_payload_3_90'
  },
];
