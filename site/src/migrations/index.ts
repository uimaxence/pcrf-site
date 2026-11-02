import * as migration_20261028_231938_initial from './20261028_231938_initial';
import * as migration_20261029_081442_programme_pages from './20261029_081442_programme_pages';

export const migrations = [
  {
    up: migration_20261028_231938_initial.up,
    down: migration_20261028_231938_initial.down,
    name: '20261028_231938_initial',
  },
  {
    up: migration_20261029_081442_programme_pages.up,
    down: migration_20261029_081442_programme_pages.down,
    name: '20261029_081442_programme_pages'
  },
];
