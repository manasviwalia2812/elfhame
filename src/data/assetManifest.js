import goldFeather from '../assets/gold_feather.png';
import inkPot from '../assets/ink_pot.png';
import frontCover from '../assets/bookcover/frontcover.png';
import backCover from '../assets/bookcover/backcover.png';
import cursorPng from '../assets/cursor.png';

import typewriterMp3 from '../utils/typewriter.mp3';
import palaceMp3 from '../utils/kingdom_dance_tangled.mp3';
import underseaMp3 from '../utils/Danny_Elfman_Moon_Dance.mp3';
import forestMp3 from '../utils/Ramin_Djawadi_Light_of_the_Seven.mp3';
import towerMp3 from '../utils/dark_horror_mystic_ambient.mp3';
import writingMp3 from '../utils/writing.mp3';
import pageFlipMp3 from '../utils/page_flip.mp3';
import pageShuffleMp3 from '../utils/page_shuffle.mp3';

export const ASSET_MANIFEST = [
  // Fonts
  { url: '/fonts/RusticRoadway.otf', type: 'font' },

  // Public Environment Videos
  { url: '/environment/entrytoelfhame.mp4', type: 'video' },
  { url: '/environment/palace_of_elfhame.mp4', type: 'video' },
  { url: '/environment/undersea_kingdom.mp4', type: 'video' },
  { url: '/environment/crooked_forest.mp4', type: 'video' },
  { url: '/environment/forgotten_tower.mp4', type: 'video' },

  // Public Environment Images
  { url: '/environment/bg.jpg', type: 'image' },
  { url: '/environment/vintage_study_bg.png', type: 'image' },
  { url: '/environment/vintage_parchment_page.png', type: 'image' },
  { url: '/elfhame_map.jpeg', type: 'image' },

  // Characters (Static Public)
  { url: '/characters/jude/jude.png', type: 'image' },
  { url: '/characters/cardan/cardan.png', type: 'image' },
  { url: '/characters/madoc/madoc.png', type: 'image' },
  { url: '/characters/taryn/taryn.png', type: 'image' },
  { url: '/characters/locke/locke.png', type: 'image' },
  { url: '/characters/roach/roach.png', type: 'image' },
  { url: '/characters/bomb/bomb.png', type: 'image' },
  { url: '/characters/ghost/ghost.png', type: 'image' },
  { url: '/characters/nicassia/nicassia.png', type: 'image' },
  { url: '/characters/oak/oak.png', type: 'image' },
  { url: '/characters/dain/dain.png', type: 'image' },
  { url: '/characters/balekin/balekin.png', type: 'image' },
  { url: '/characters/eldred/eldred.png', type: 'image' },
  { url: '/characters/grimson/grimson.png', type: 'image' },

  // Imported Assets
  { url: goldFeather, type: 'image' },
  { url: inkPot, type: 'image' },
  { url: frontCover, type: 'image' },
  { url: backCover, type: 'image' },
  { url: cursorPng, type: 'image' },

  // Imported Audios
  { url: typewriterMp3, type: 'audio' },
  { url: palaceMp3, type: 'audio' },
  { url: underseaMp3, type: 'audio' },
  { url: forestMp3, type: 'audio' },
  { url: towerMp3, type: 'audio' },
  { url: writingMp3, type: 'audio' },
  { url: pageFlipMp3, type: 'audio' },
  { url: pageShuffleMp3, type: 'audio' }
];

export default ASSET_MANIFEST;
