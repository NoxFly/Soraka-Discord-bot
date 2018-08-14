let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let DB = main.database;
let champ = require('./../../functions/champions.json');
const Discord = require('discord.js');

// Basic - Games - Utility - Personal - Social - management

// External functions
let admin = require('./../../functions/admin.js');
let check2 = require('./../../functions/checktwo.js');
let getTop = require('./../../functions/gettop.js');
let mtsm = require('./../../functions/mtsm.js');
let dump = require('./../../functions/dump.js');
let profile = require('./../../functions/profile.js');

function send(msg, message) {
	msg.channel.send(message);
}

let hidden = [
    
];

module.export = hidden;