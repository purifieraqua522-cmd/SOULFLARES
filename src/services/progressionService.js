function calcCardPower(card, userCard) {
  const base = Number(card.base_power || 0);
  const levelScale = 1 + (Number(userCard.card_level || 1) - 1) * 0.03;
  const ascensionScale = 1 + Number(userCard.ascension || 0) * 0.12;
  return Math.floor(base * levelScale * ascensionScale);
}

function calcProfileLevel(profile) {
  const xp = Number(profile?.xp || 0);
  return Math.max(1, Math.floor(Math.sqrt(xp / 110)) + 1);
}

module.exports = { calcCardPower, calcProfileLevel };
