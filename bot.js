// CONSTANTS
const firebase = require('firebase');
const Discord = require('discord.js');
const reactionCommands = require('./functions/reaction_command.js');
const DB = require('./DB.js');
const check = require('./functions/check.js');
const checkServer = require('./functions/checkServer.js');
const dump = require('./functions/dump.js');
const fs = require('fs');

// EXPORT BTW FILES
let exportObj = module.exports = {};

let Database = new DB();
exportObj.database = Database;

// SOME VAR
let code = [];
let mod = [];
let timeExe = 0;
let modules = [];
let App = [];

// BOTS INFOS
let aBotList = [
	{
		'name'	:	'ahri',
		'tag'  	: 	'a!',
		'id'	:	'477918672732553216',
		'token' :	process.env.TOKEN_AHRI
	}
];

aBotList.forEach(function(val, index, array) {
	startbot(val);
});

function startbot(params) {
	const bot = new Discord.Client();
	exportObj.bot = bot;

	/** ******************************************************************* **/
	/** ******************************************************************* **/
	// QUAND LE BOT EST LANCE

	bot.on('ready',() => {
		console.log(params.name+' ready !\n');
		let m;
		let members;
		let activity = 1;
		bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');

		setInterval(function() {
			activity = 1-activity;
			Database.source().getData('profile', function(data) {
				m = data.val();
			});

			setTimeout(function() {
				try {
					members = Object.keys(m).length;
					if(activity) bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
					else bot.user.setActivity(params.tag+'help | '+members+' members');
				} catch(error) {
					console.log(error);
					bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
				}
			},Database.responseTime);
		}, 600000);
	});

	/** ******************************************************************* **/
	/** ******************************************************************* **/
	// QUAND QQUN ENVOIE UN MSG

	bot.on('message', (msg) => {
		if(msg.author.id===params.id || msg.author.bot==true) {
			return;
		}

		if(msg.content=='<@'+params.id+'>' || msg.content=='<@'+params.id+'> .') {
			send(msg, 'Hey :P');
			return;
		}

		let id = msg.author.id;
		let name = msg.author.username+'#'+msg.author.discriminator;
		let avatar = msg.author.avatarURL;
		check(msg, id, name, avatar);

		let commands;

		mod = [];
		modules = [];

		// IF IN SERVER
		if(msg.channel.type!=='dm') {
			let gid = msg.guild.id;
			let gname = msg.guild.name;
			let gowner = msg.guild.ownerID;
			checkServer(gid, gname, gowner);

			if(App[gid]===undefined || App[gid]['modules']===undefined) {
				if(App[gid]===undefined) App[gid] = [];
	
				Database.server(gid).getData('modules', function(data) {
					App[gid]['modules'] = data.val();
				});
				setTimeout(function() {code=App[gid]['modules'];},Database.responseTime);
				timeExe = Database.responseTime*2;
			} else {
				code = App[gid]['modules'];
				timeExe = 0;
			}
	
			setTimeout(function() {
				exportObj.app = App;
				for(i in code) {
					if(code[i]!='test') mod.push(code[i]);
				}
	
				mod.forEach(name => {
					let m = require('./bots/'+params.name+'/modules/'+name+'.js');
					m.forEach(command => {
						command.group = name;
					});
					modules = modules.concat(m);
				});
				
				commands = require('./bots/'+params.name+'/basic.js');
				exportObj.commands = modules;
				commands = modules.concat(commands);
			},timeExe);
			timeExe = 0;
			//commands = require('./bots/'+params.name+'/basic.js');
		} else {
			// IF PRIVATE MESSAGE
			if(msg.content.indexOf(params.tag)===0) {
				commands = require('./bots/'+params.name+'/basic.js');
				mod = ['game','personal','social','utility'];
				mod.forEach(name => {
					let m = require('./bots/'+params.name+'/modules/'+name+'.js');
					m.forEach(command => {
						command.group = name;
					});
					modules = modules.concat(m);
				});

				commands = modules.concat(commands);
				timeExe = 0;
			} else {
				let fighting, champion;
				if(App[id]===undefined) App[id] = [];
				const fight = require('./functions/fight.js');
				Database.profile(id).getData('game/fighting', function(data) {
					fighting = data.val();
				});

				Database.profile(id).getData('game/params', function(data) {
					champion = data.val();
				});

				setTimeout(function() {
					if(fighting==1) {
						if(App[id].champion===undefined) App[id].champion = champion;
						exportObj.app = App;
						fight(msg, id, name);
						return;
					}
				},DB.responseTime);
			}
		}

		setTimeout(function() {
			let content = msg.content;
			get_command(msg, content);
		}, timeExe+3);
	});


	/** ******************************************************************* **/
	/** ******************************************************************* **/
	// QUAND LE BOT ARRIVE SUR UN SERVER

	bot.on('guildCreate', (guild) => {
		let id = guild.id;
		let name = guild.name;
		let owner = guild.ownerID;
		checkServer(id, name, owner);

		let defaultChannel = "";
		guild.channels.forEach((channel) => {
			if(channel.type == "text" && defaultChannel == "") {
				if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
					defaultChannel = channel;
				}
			}
		});

		let modules = '';
		let end = ' - ';
		fs.readdir('./bots/ahri/modules', function(err, items) {
			for (var i=0; i<items.length; i++) {
				if(i==items.length-1) end = '';
				modules += items[i].replace('.js','')+end;
				console.log(modules);
			}

			let embed = new Discord.RichEmbed()
				.setTitle('Modules')
				.setColor(0x43FF4E)
				.addField(
					'You can install or uninstall group of commands on the server writing\n`a!config modules.add {name}`', modules
				)
				.setDescription('I recommend you to install the modules game, personal and social');
			
			defaultChannel.send('Hey, I\'m Ahri !\nI advise you to read this :');
			defaultChannel.send(embed);
		});
	});

	/** ******************************************************************* **/
	/** ******************************************************************* **/
	// Quand qqun rajoute une reaction

	bot.on('messageReactionAdd', (reaction, user) => {
		if(reaction.message.author.id == '463425089673887764'){
			send(reaction.message,'reaction');
			react(reactionCommands, reaction, user, reaction.message.content);
		}
	});

	bot.login(params.token);
}


/** ******************************************************************* **/
/** ******************************************************************* **/
// FUNCTIONS
	

function send(msg, message){
	if(message!=null) {
		msg.channel.send(message);
	}
}

function find(content, txt, discussion = false){
	if(discussion==false){
	  return content.indexOf(txt)==params.tag.length;
	} else {
	  return content.indexOf(txt)==0;
	}
}

function react(cmds, reaction, user, content) {
	for(let a = 0;a<cmds.length;a++) {
		let command = cmds[a];
		if(find(content, command.from, true) && reaction.emoji.name===command.emoji) {
			let txt = command.result(reaction, user);
			if(txt!=null){
			  send(reaction.message, txt);
			}
		}
	}
}

function get_command(msg, content) {
	if(msg.content.indexOf(tag) === 0) {
        let command = msg.content.split(tag)[1];
        if(aCommands.indexOf(command)>-1) {
            let args = command.split(aCommands[command])[1];
            command = commands[aCommands.indexOf(command)];
            try {command.result(msg, args)}
            catch (error) {
				console.log(error);
				let embed = new Discord.RichEmbed()
					.setAuthor('⚠️ Error ('+error.name+')')
					.setColor(0xFFA500)
					.setDescription('```'+error.message+'```');
				msg.channel.send(embed);
			}
        } else {
            msg.channel.send("Command does not exist");
        }
    }
}