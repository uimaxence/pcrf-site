import * as migration_20261028_231938_initial from './20261028_231938_initial';
import * as migration_20261029_081442_programme_pages from './20261029_081442_programme_pages';
import * as migration_20261102_094416_ajout_prefix_s3 from './20261102_094416_ajout_prefix_s3';
import * as migration_20261102_153505_ajout_visibilite_cadrage from './20261102_153505_ajout_visibilite_cadrage';
import * as migration_20261105_083747_ajout_cover_fit_masthead from './20261105_083747_ajout_cover_fit_masthead';
import * as migration_20261105_172002_page_congres from './20261105_172002_page_congres';
import * as migration_20261106_092829_texte_lettre_info from './20261106_092829_texte_lettre_info';
import * as migration_20261110_094406_ajout_rejoindre_campagne_bandeau from './20261110_094406_ajout_rejoindre_campagne_bandeau';
import * as migration_20261114_190137_deux_colonnes_pied_page_spip_id_pages from './20261114_190137_deux_colonnes_pied_page_spip_id_pages';
import * as migration_20261116_081913_diaporama_une from './20261116_081913_diaporama_une';
import * as migration_20261116_122104_retrait_diaporama from './20261116_122104_retrait_diaporama';
import * as migration_20261120_134610_place_rubrique from './20261120_134610_place_rubrique';
import * as migration_20261123_100609_boutique from './20261123_100609_boutique';
import * as migration_20261127_091046_masthead_fit from './20261127_091046_masthead_fit';

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
    name: '20261106_092829_texte_lettre_info',
  },
  {
    up: migration_20261110_094406_ajout_rejoindre_campagne_bandeau.up,
    down: migration_20261110_094406_ajout_rejoindre_campagne_bandeau.down,
    name: '20261110_094406_ajout_rejoindre_campagne_bandeau',
  },
  {
    up: migration_20261114_190137_deux_colonnes_pied_page_spip_id_pages.up,
    down: migration_20261114_190137_deux_colonnes_pied_page_spip_id_pages.down,
    name: '20261114_190137_deux_colonnes_pied_page_spip_id_pages',
  },
  {
    up: migration_20261116_081913_diaporama_une.up,
    down: migration_20261116_081913_diaporama_une.down,
    name: '20261116_081913_diaporama_une',
  },
  {
    up: migration_20261116_122104_retrait_diaporama.up,
    down: migration_20261116_122104_retrait_diaporama.down,
    name: '20261116_122104_retrait_diaporama',
  },
  {
    up: migration_20261120_134610_place_rubrique.up,
    down: migration_20261120_134610_place_rubrique.down,
    name: '20261120_134610_place_rubrique',
  },
  {
    up: migration_20261123_100609_boutique.up,
    down: migration_20261123_100609_boutique.down,
    name: '20261123_100609_boutique',
  },
  {
    up: migration_20261127_091046_masthead_fit.up,
    down: migration_20261127_091046_masthead_fit.down,
    name: '20261127_091046_masthead_fit'
  },
];
