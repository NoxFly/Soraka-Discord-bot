'use strict';

// discord
let Discord = require('discord.js');
let Client = new Discord.Client();

// bot constants
const {clientToken, clientName, clientId, tag} = require('./_conf/config.js').discord;

// path
const root = __dirname;

// image manager for canvas
const CanvasManager = new (require('./class/class.canvas-manager.js'));


// export data to get it on other files
let exportObj = module.exports = {};
exportObj.root = root;
exportObj.App = {
	Client: Client,
	tag: tag,
	clientId: clientId,
	clientName: clientName,
	guilds: new (require('./class/class.guild-preferences.js'))
};
exportObj.cvsManager = CanvasManager;

// include firebase database

// include Riot's API class
let riotAPI = new (require('./class/class.riotAPI.js'));

// export database & riotAPI
exportObj.App.riotAPI = riotAPI;

// include commands
let commands = new (require('./class/class.commands.js'));

// include a special command
let champInfos = new (require('./class/commands/riot/championInfos.js'));

// bot is connected
Client.on('ready', e => {
	console.log(`${clientName} ready`);

	exportObj.App.guilds.prepare(Client);

	let champIds = Object.keys(riotAPI.champions);
	let champion = riotAPI.champions[champIds[Math.floor(Math.random()*champIds.length)]].name;
	Client.user.setActivity(`with ${champion} | ${tag}help`, {type: 'PLAYING'});

	setInterval(e => {
		let champion = riotAPI.champions[champIds[Math.floor(Math.random()*champIds.length)]].name;
		Client.user.setActivity(`with ${champion} | ${tag}help`, {type: 'PLAYING'});
	}, 600000);
});


// someone is messaging a channel the bot can read
Client.on('message', message => {
	if(message.author.bot) return; // doesn't accept bot messages

	let content = message.content;
	
	// private messages
	if(message.channel.type == 'dm') {

	}

	// on a server
	else {
		let command, args;

		// if the bot is mentionned
		if(iamMentionned(content)) { // si le message commence par @me
			command = content.replace(`<@!${clientId}>`, '').trim().split(' ')[0];
			args = content.replace(`<@!${clientId}>`, '').trim().split(' ').splice(1);
		} 

		// if the message starts with the bot's tag
		else if(content.startsWith(tag)) { // si le message commence par son tag
			command = content.substring(tag.length).split(' ')[0];
			args = content.substring(tag.length).split(' ').splice(1);
		}

		// execute
		if((iamMentionned(content) || content.startsWith(tag))) {
			if(commands[command]) commands[command].parse(message, args);
			else {
				let lowercaseChamps = Object.keys(riotAPI.champions).map(champion => champion.toLowerCase());
				if(lowercaseChamps.indexOf(command.toLowerCase()) !== -1) {
					let champion = riotAPI.champions[Object.keys(riotAPI.champions)[lowercaseChamps.indexOf(command.toLowerCase())]];
					champInfos.showData(message, champion);
				}
			}
		}
	}
});

Client.on('messageReactionAdd', (messageReaction, user) => {
	if(user.bot) return;
	if(messageReaction.message.author.id != clientId) return;
	if(messageReaction.message.embeds.length == 1 && messageReaction.message.embeds[0].title == 'Command list') commands.help.reaction(messageReaction, user);
})

// return a boolean either the bot has been mentionned as first in the message or not
function iamMentionned(msg) {
	return (new RegExp(`<@(!|&)?${clientId}> `)).test(msg);
}

Client.login(clientToken);