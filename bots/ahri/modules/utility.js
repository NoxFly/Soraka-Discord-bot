let firebase = require('firebase');
let main = require('./../../../bot.js');
let bot = main.bot;
let DB = main.database;
const champ = require('./../../../functions/champions.json');
const Discord = require('discord.js');
const fs = require('fs');
let App = main.app;

// External functions
const admin = require('./../../../functions/admin.js');
const check2 = require('./../../../functions/checktwo.js');
const getTop = require('./../../../functions/gettop.js');
const mtsm = require('./../../../functions/mtsm.js');
const dump = require('./../../../functions/dump.js');
const profile = require('./../../../functions/profile.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

let utility = [
    {
		name : 'date',
		description : 'say the current date',
		usage : '`a!date`',
		group: 'utility',
		result : (msg) => {
			if(!(msg.content=="a!date")) return 'not_find';
			let D = new Date();
			let H = D.getHours();
			let M = D.getMinutes();
			let S = D.getSeconds();
			return ':clock2: from you it\'s : '+H+':'+M+':'+S;
		}
	},

	{
		name : 'binary',
		description : 'Translate decimal to binary.',
		usage : '`a!binary` `an integer`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('binary')[1];
			let reg = /\d+/;
			if(reg.test(n)) {
				let r = Number(n).toString(2);
				return n+' = `'+r+'` in binary';
			} else {
				return 'Need a number';
			}
		}
	},
	
	{
		name : 'decimal',
		description : 'Translate binary to decimal.',
		usage : '`a!decimal` `an integer`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('decimal')[1];
			let reg = /[0-1]+/;
			if(reg.test(n)) {
				let r = parseInt(n,2);
				return '`'+n+'` = '+r+' in decimal';
			} else {
				return 'Need a number, and only 0 or 1';
			}
		}
    }
];

module.exports = utility;