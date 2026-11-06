import * as migration_20261028_231938_initial from './20261028_231938_initial';
import * as migration_20261029_081442_programme_pages from './20261029_081442_programme_pages';
import * as migration_20261102_094416_ajout_prefix_s3 from './20261102_094416_ajout_prefix_s3';
import * as migration_20261102_153505_ajout_visibilite_cadrage from './20261102_153505_ajout_visibilite_cadrage';
import * as migration_20261105_083747_ajout_cover_fit_masthead from './20261105_083747_ajout_cover_fit_masthead';
import * as migration_20261105_172002_page_congres from './20261105_172002_page_congres';
import * as migration_20261106_092829_texte_lettre_info from './20261106_092829_texte_lettre_info';

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
    name: '20261102_094416_ajout_prefix_s3',
  },
  {
    up: migration_20261102_153505_ajout_visibilite_cadrage.up,
    down: migration_20261102_153505_ajout_visibilite_cadrage.down,
    name: '20261102_153505_ajout_visibilite_cadrage',
  },
  {
    up: migration_20261105_083747_ajout_cover_fit_masthead.up,
    down: migration_20261105_083747_ajout_cover_fit_masthead.down,
    name: '20261105_083747_ajout_cover_fit_masthead',
  },
  {
    up: migration_20261105_172002_page_congres.up,
    down: migration_20261105_172002_page_congres.down,
    name: '20261105_172002_page_congres',
  },
  {
    up: migration_20261106_092829_texte_lettre_info.up,
    down: migration_20261106_092829_texte_lettre_info.down,
    name: '20261106_092829_texte_lettre_info'
  },
];
