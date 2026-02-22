const animes = {
  onepiece: {
    label: 'One Piece',
    currency: 'berries',
    summonLabel: 'Pirate Packs',
    bosses: ['kizaru', 'mihawk', 'aokiji'],
    superBoss: 'kaido'
  },
  naruto: {
    label: 'Naruto',
    currency: 'chakra',
    summonLabel: 'Chakra Summoning',
    bosses: ['itachi', 'pain', 'kisame'],
    superBoss: 'madara'
  },
  bleach: {
    label: 'Bleach',
    currency: 'reiryoku',
    summonLabel: 'Shinigami Pull',
    bosses: ['ulquiorra', 'grimmjow', 'byakuya'],
    superBoss: 'yhwach'
  },
  jjk: {
    label: 'Jujutsu Kaisen',
    currency: 'cursed_energy',
    summonLabel: 'Cursed Pack',
    bosses: ['jogo', 'mahito', 'hanami'],
    superBoss: 'sukuna_true'
  }
};

const rarities = {
  epic: { weight: 78.5, color: '#7f5af0' },
  legendary: { weight: 20.5, color: '#f7b801' },
  mythical: { weight: 0.95, color: '#00d4ff' },
  secret: { weight: 0.05, color: '#ff2e63' }
};

const secretCards = ['sung_jin_woo', 'cid_kagenou', 'anos_voldigoad', 'gilgamesh'];

module.exports = { animes, rarities, secretCards };
