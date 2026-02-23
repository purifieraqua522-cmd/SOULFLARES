const cardCommand = require('./card/cardCommand');
const summonCommand = require('./card/summonCommand');

const bossCommand = require('./battle/bossCommand');
const fightCommand = require('./battle/fightCommand');
const clashCommand = require('./battle/clashCommand');

const inventoryCommand = require('./utility/inventoryCommand');
const storeCommand = require('./utility/storeCommand');
const gearCommand = require('./utility/gearCommand');
const fusionGuideCommand = require('./utility/fusionGuideCommand');
const evoGuideCommand = require('./utility/evoGuideCommand');
const bossGuideCommand = require('./utility/bossGuideCommand');
const starterCommand = require('./utility/starterCommand');

const addCurrencyCommand = require('./admin/addCurrencyCommand');
const spawnBossCommand = require('./admin/spawnBossCommand');
const assetsCommand = require('./admin/assetsCommand');

const commandModules = [
  cardCommand,
  summonCommand,
  bossCommand,
  fightCommand,
  clashCommand,
  inventoryCommand,
  storeCommand,
  gearCommand,
  fusionGuideCommand,
  evoGuideCommand,
  bossGuideCommand,
  starterCommand,
  addCurrencyCommand,
  spawnBossCommand,
  assetsCommand
];

const commandMap = new Map(commandModules.map((mod) => [mod.data.name, mod]));

module.exports = { commandModules, commandMap };
