let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let champ = require('./../../functions/champions.json');
const Discord = require('discord.js');

// Basic - Games - Utility - Personal - Social - management

// External functions
let profile = require('./../../functions/profile.js');
let randpass = require('./../../functions/randpass.js');
let admin = require('./../../functions/admin.js');
let check = require('./../../functions/check.js');
let check2 = require('./../../functions/checktwo.js');
let getTop = require('./../../functions/gettop.js');
let mtsm = require('./../../functions/mtsm.js');

// *** //

const commands = [
	{
		name: 'test',
		result: (msg) => {
			return 'a!follow <@316639200462241792>';
		}
	},
	{
		name: 'init',
		result: (msg) => {
			return 'a!top';
		}
	},
	
	{
		name: 'announce',
		description: 'Create an announce on all Ahri\'s servers',
		usage: '`a!announce {msg}`',
		group: 'social',
		result: (msg) => {
			let message = msg.content.split('announce ')[1];
			let id = msg.author.id;
			let ref = firebase.database().ref('profile/'+id);

			return `**Announce from ${msg.author.username}#${msg.author.discriminator}:**\n`+message+'\nReact with 👍 to apply';
		}
	},

	{
		name: 'maj',
		group: 'hidden',
		result: (msg) => {
			let ref = firebase.database().ref('profile/');
			let users = [];
			ref.on('child_added', function(data) {
				data = data.val();
				users.push({id: data.id, xp: data.xp, money: data.money});
			});
			   
			setTimeout(function() {
				for(i in users) {
					console.log('message send to '+users[i].id);
					//bot.fetchUser(users[i].id).then(user => { user.send('Of course, you will have an additionnal of 1000 money and 600 xp :)')});
				}
			},1000);

		}
	}
];

module.exports = commands;