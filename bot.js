// CONSTANTS REQUIRE
const firebase = require('firebase'); // FIREBASE
const Discord = require('discord.js'); // DISCORD
const reactionCommands = require('./functions/reaction_command.js'); // REACTION <!>
const DB = require('./DB.js'); // DATABASE
const check = require('./functions/check.js'); // CHECK USER EXISTS ON DB
const checkServer = require('./functions/checkServer.js'); // CHECK SERVER REGISTER ON DB
const dump = require('./functions/dump.js'); // DISPLAY ERROR MSG
const admin = require('./functions/admin.js'); // WATCH IF ADMIN
//const fs = require('fs'); // WATCH FOLDERS

// EXPORT BTW FILES
let exportObj = module.exports = {}; // MODULES TO EXPORT BTW FILES

let Database = new DB(); // NEW DATABASE
exportObj.database = Database; // ------ EXPORT DB

// SOME VAR LOCAL TO FILE
let mod = [];
let modules = [];
let name_commands = [];
let App = [];
let G_mod = [];
let timeExe = 0;
let commands = [];

// BOTS INFOS
let aBotList = [
	{
		'name'	:	'ahri',
		'tag'  	: 	'a!',
		'id'	:	'477918672732553216',
		'token' :	process.env.TOKEN
	}
];

// instance for each bot in aBotList
aBotList.forEach(function(val, index, array) {
	startbot(val);
});

function startbot(params) {
	// on export le bot
	const bot = new Discord.Client();
	exportObj.bot = bot;

	// QUAND LE BOT EST LANCE
	// on affiche un message dans les log pour montrer qu'il marche
	// et on montre sur discord a!help | n servers
	bot.on('ready', () => {
		console.log(params.name+' ready !\n');
		bot.user.setActivity('with '+bot.guilds.size+' servers | '+params.tag+'help');

		// import commands
		commands = require('./bots/'+params.name+'/basic.js');
		let mods = [
			require('./bots/'+params.name+'/modules/game.js'),
			require('./bots/'+params.name+'/modules/management.js'),
			require('./bots/'+params.name+'/modules/personal.js'),
			require('./bots/'+params.name+'/modules/social.js'),
			require('./bots/'+params.name+'/modules/utility.js')
		];
		commands = commands.concat(mods[0], mods[1], mods[2], mods[3], mods[4]);
		exportObj.commands = commands;
	});

	// QUAND QQUN ENVOIE UN MSG
	bot.on('message', msg => {
		requestMessage(msg, params);
	});

	// QUAND LE BOT ARRIVE SUR UN SERVER
	bot.on('guildCreate', guild => {
		guildJoined(guild);
	});

	// connecte le bot à Discord
	bot.login(params.token);
}


// FUNCTIONS

// envoie un msg.channel.send()
function send(msg, message){
	if(message!=null) msg.channel.send(message);
}

function removeBlanks(args) {
	let secondArr = [];
	for(i in args) {
		if(args[i].length>0) secondArr.push(args[i]);
	}
	return secondArr;
}

// vérifie que la commande existe : true --> execute | false --> error message
function get_command(msg, command, aCommands = [], profile) {
	try {
		let idx = name_commands.indexOf(command.split(" ")[0]);
		if(idx>-1) { // si on retrouve la commande parmis celles disponibles
			command = name_commands[idx];
			let args = [];
			args = msg.content.split(command)[1].split(" "); // on recupere les arguments
			args = removeBlanks(args);
			
			console.log(msg.author.username+" sends ["+command+"] with args: ", args);
			if(aCommands[idx].group == "hidden" && !admin(msg.author.id)) return; // si c'est une commande cachée et pas admin
			Database.profile(msg.author.id);
			try {
				aCommands[idx].result(msg, args, profile); // on essaie d'executer la commande
			}
			catch (error) { // s'il y a une erreur on envoie un log
				console.log(error);
				let embed = new Discord.RichEmbed()
					.setAuthor('⚠️ Error ('+error.name+')')
					.setColor(0xFFA500)
					.setDescription('```'+error.message+'```');
				send(msg, embed);
			}
		} else {
			send(msg, "Command does not exist"); // si la commande n'existe pas
		}
	} catch(error) {
		console.log(error);
	}
}

// lorsque qu'un message est envoyé sur un channel
function requestMessage(msg, params) {
	// si c'est un bot
	if(msg.author.bot) return;

	// si on écrit @ahri
	if(msg.content == '<@'+params.id+'>') {
		send(msg, 'Hey :P');
		return;
	}

	let id = msg.author.id; // id Discord du user
	let name = msg.author.username+'#'+msg.author.discriminator; // nom Discord + tag du user
	let avatar = msg.author.avatarURL; // avatar Discord du user
	let profile = [];
	check(msg, id, name, avatar); // regarde s'il est enregistré dans la DB
	
	for(i in commands) {
		name_commands.push(commands[i].name);
	}
	
	Database.profile(id).getData('', function(data) {
		profile = data.val();
	});
	

	// si on ecrit sur un server
	if(msg.channel.type !== 'dm') {
		let G_id = msg.guild.id; // id Discord du server
		let G_name = msg.guild.name; // nom Discord du server
		let G_owner = msg.guild.ownerID; // owner Discord du server
		checkServer(G_id, G_name, G_owner); // verifie s'il est enregistré dans la DB

		/*
		if(App[G_id]===undefined || App[G_id]['modules']===undefined) { // si server pas enregistré localement
			if(App[G_id]===undefined) App[G_id] = []; // on rajoute localement le server
			let tmp = [];
			
			Database.server(G_id).getData('modules', function(data) { // on rajoute localement les modules
				tmp = data.val();
			});

			setTimeout(function() {
				App[G_id]['modules'] = tmp;
				G_mod = App[G_id]['modules'];
			}, Database.responseTime);

			timeExe = Database.responseTime+1;
		} else {
			G_mod = App[G_id]['modules']; // si deja enregistre localement
			timeExe = 0;
		}

		setTimeout(function() {
			Database.profile(id).getData("", function(data) {
				profile = data.val();
			});

			exportObj.app = App; // App disponible dans d'autres fichiers
			for(i in G_mod) { // pour chaque module
				if(G_mod[i]!='test') mod.push(G_mod[i]); // si ce n'est pas le test qui sert à combler
			}

			mod.forEach(name => { // pour chaque module
				let m = require('./bots/'+params.name+'/modules/'+name+'.js'); // on rajoute le fichier du module
				m.forEach(command => { // pour chaque commande du module
					command.group = name; // on rajoute la disponibilité de la commande
					name_commands.push(command.name);
				});
				modules = modules.concat(m); // on rajoute le module dans les modules disponibles
			});
			
			exportObj.commands = modules; // pourquoi AVANT le concat de modules ???
			commands = commands.concat(modules); // on rajoute les commandes de base avec les autres
			timeExe++;
		}, timeExe);
		*/

		setTimeout(function() {
			if(msg.content.indexOf(params.tag) === 0) { // on regarde s'il y a le tag
				let command = msg.content.split(params.tag)[1]; // on enleve le tag
				get_command(msg, command, commands, profile); // on regarde si la commande existe : execute
			}
		}, 1500);
	} else {
		// si on ecrit en prive au bot pour fight
		if(msg.content.indexOf(params.tag) !== 0) { // si le message commence par le tag
			// si pas de tag
			let champion;
			if(App[id] === undefined) App[id] = []; // on stock localement les données du user
			const fight = require('./functions/fight.js'); // commandes du fight champion LoL

			if(profile.game.fighting == 1) {
				champion = profile.game.params; // s'il est en fight, on peut lui dire qu'il est en jeu
				if(App[id].champion === undefined) App[id].champion = champion; // s'il n'a pas de champion par defaut
				exportObj.app = App; // on export pour d'autres fichiers
				fight(msg, id, profile); // on lance le combat / la reponse
			}
		} else {
			send(msg, "I can talk to you only on server. If you want to MP me, it's for the game");
		}
	}
}