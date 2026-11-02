import * as migration_20261028_231938_initial from './20261028_231938_initial';
import * as migration_20261029_081442_programme_pages from './20261029_081442_programme_pages';
import * as migration_20261102_094416_ajout_prefix_s3 from './20261102_094416_ajout_prefix_s3';

export const migrations = [
  {
    up: migration_20261028_231938_initial.up,
    down: migration_20261028_231938_initial.down,
    name: '20261028_231938_initial',
  },
  {
    up: migration_20261029_081442_programme_pages.up,
    down: migration_20261029_081442_programme_pages.down,
    name: '20261029_081442_programme_pages',
  },
  {
    up: migration_20261102_094416_ajout_prefix_s3.up,
    down: migration_20261102_094416_ajout_prefix_s3.down,
    name: '20261102_094416_ajout_prefix_s3'
  },
];
