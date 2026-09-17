import * as migration_20260917_013429_inicial from './20260917_013429_inicial';

export const migrations = [
  {
    up: migration_20260917_013429_inicial.up,
    down: migration_20260917_013429_inicial.down,
    name: '20260917_013429_inicial'
  },
];
