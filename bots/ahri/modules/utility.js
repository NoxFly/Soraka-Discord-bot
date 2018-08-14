let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let DB = main.database;
let champ = require('./../../functions/champions.json');
const Discord = require('discord.js');

// Basic - Games - Utility - Personal - Social - management

// External functions
let admin = require('./../../../functions/admin.js');
let check2 = require('./../../../functions/checktwo.js');
let getTop = require('./../../../functions/gettop.js');
let mtsm = require('./../../../functions/mtsm.js');
let dump = require('./../../../functions/dump.js');
let profile = require('./../../../functions/profile.js');

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
    },
    
    {
		name: 'ev',
		description: 'show the result of javascript code',
		usage: 'a!ev {js code}',
		group: 'utility',
		result: (msg) => {
			let res = '';
			let output = msg.content.split('ev ')[1];
			if(/process\.exit\(0\)/.test(output)) return;
			output = output.replace(/console\.log\((\w+)\)/gm,'send(msg,$1)');
			try {
				res = eval(output);
			} catch(error) {
				res = error;
			}
			output = output.replace(/;(\s+)?/gm,';\n');
			let embed = new Discord.RichEmbed()
				.addField('**:inbox_tray: Input:**','```js\n'+output+'```')
				.addField('**:outbox_tray: Output:**','```js\n'+res+'```');
			return embed;
		}
	},
];

module.export = utility;