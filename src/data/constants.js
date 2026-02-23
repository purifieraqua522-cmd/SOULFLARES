const animes = {
  onepiece: {
    label: 'One Piece',
    currency: 'berries',
    summonLabel: 'Pirate Packs',
    bosses: ['doflamingo', 'blackbeard', 'mihawk'],
    superBosses: ['shanks', 'whitebeard']
  },
  naruto: {
    label: 'Naruto',
    currency: 'chakra',
    summonLabel: 'Chakra Summoning',
    bosses: ['naruto', 'sasuke', 'itachi'],
    superBosses: ['obito', 'kaguya']
  },
  bleach: {
    label: 'Bleach',
    currency: 'reiryoku',
    summonLabel: 'Shinigami Pull',
    bosses: ['grimmjow', 'ulquiorra', 'kisuke'],
    superBosses: ['ichigo', 'yhwach']
  },
  jjk: {
    label: 'Jujutsu Kaisen',
    currency: 'cursed_energy',
    summonLabel: 'Cursed Pack',
    bosses: ['toji', 'kashimo', 'hakari'],
    superBosses: ['sukuna', 'mahoraga']
  }
};

const raidPresets = {
  naruto_akatsuki: {
    key: 'naruto_akatsuki',
    anime: 'naruto',
    label: 'Akatsuki Raid',
    fixedPower: 9800,
    stages: ['itachi', 'kisame', 'obito', 'pain']
  },
  bleach_tybw_quincies: {
    key: 'bleach_tybw_quincies',
    anime: 'bleach',
    label: 'TYBW Quincies Raid',
    fixedPower: 11200,
    stages: ['bazz_b', 'as_nodt', 'jugram', 'yhwach']
  },
  onepiece_onigashima: {
    key: 'onepiece_onigashima',
    anime: 'onepiece',
    label: 'Onigashima Raid',
    fixedPower: 10800,
    stages: ['kaido', 'big_mom', 'king', 'queen', 'jack', 'ulti']
  },
  onepiece_admiral_fleet: {
    key: 'onepiece_admiral_fleet',
    anime: 'onepiece',
    label: 'Admiral Fleet Raid',
    fixedPower: 10400,
    stages: ['akainu', 'kizaru', 'aokiji', 'fujitora', 'ryokugyu']
  },
  onepiece_kaido: {
    key: 'onepiece_kaido',
    anime: 'onepiece',
    label: 'Kaido Raid',
    fixedPower: 11000,
    stages: ['kaido', 'big_mom', 'king', 'queen', 'jack', 'ulti']
  },
  jjk_shibuya_train: {
    key: 'jjk_shibuya_train',
    anime: 'jjk',
    label: 'Shibuya Train Incident Raid',
    fixedPower: 11500,
    stages: ['jogo', 'mahito', 'hanami', 'choso', 'kenjaku']
  }
};

const rarities = {
  epic: { weight: 78.5, color: '#7f5af0' },
  legendary: { weight: 20.5, color: '#f7b801' },
  mythical: { weight: 0.95, color: '#00d4ff' },
  secret: { weight: 0.05, color: '#ff2e63' }
};

const secretCards = ['sung_jin_woo', 'cid_kagenou', 'anos_voldigoad', 'gilgamesh'];

module.exports = { animes, raidPresets, rarities, secretCards };