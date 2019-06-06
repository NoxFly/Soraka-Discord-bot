const Discord = require('discord.js');
let main = require('../bot.js');
let DB = main.database;
let firebase = require('firebase');
let quests_func = require('./quests_functions.js');
let quest = require('./json/quests.json');
/**
 * GERE LE SYSTEME DE QUETES
 * @param object client
 * @param object profile
 * @param int type
 * @return bolean
 */
let quests = function(client, profile, type) {
    if(profile.game.quests_completed<quest.length) return quests_func[profile.game.quest-1].result(client, profile, type);
    else return false;
}

module.exports = quests;