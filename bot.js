var firebase = require('firebase');
const Discord = require('discord.js');
const reactionCommands = require('./functions/reaction_command.js');
const DB = require('./DB.js');
const check = require('./functions/check.js');
const checkServer = require('./functions/checkServer.js');
const dump = require('./functions/dump.js');
const fs = require('fs');

let exportObj = module.exports = {};

let Database = new DB();
exportObj.database = Database;

let code = [];
let mod = [];
let timeExe = 0;
let modules = [];
let App = [];

let aBotList = [
	{
		'name'	:	'ahri',
		'tag'  	: 	'a!',
		'id'	:	'477918672732553216',
		'token' :	process.env.TOKEN_AHRI
	},

	{
		'name'	:	'caitlyn',
		'tag'  	: 	'/',
		'id'	:	'443430082459992065',
		'token' :	process.env.TOKEN_CAITLYN
	}
];

aBotList.forEach(function(val, index, array) {
	startbot(val);
});

function startbot(params) {
	const bot = new Discord.Client();
	exportObj.bot = bot;

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

		if(msg.channel.type!=='dm') {
			let gid = msg.guild.id;
			let gname = msg.guild.name;
			let gowner = msg.guild.ownerID;
			checkServer(gid, gname, gowner);

			if(params.name=='ahri') {

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
			} else {
				timeExe = 0;
				commands = require('./bots/'+params.name+'/basic.js');
			}
		} else {
			if(params.name=='ahri') {
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
			}
		}

		setTimeout(function() {
			let content = msg.content;
			if(content.indexOf(params.tag)===0) {
				for(let a=0; a<commands.length; a++) {
					let command = commands[a];
					if (find(content, command.name)) {
						try {
							Database.setAuthor(msg.author);
							Database.profile(msg.author.id);
							let txt = command.result(msg);
							if(txt=='not_find') {
								return false;
							} else {
								send(msg, txt);
							}
						} catch(error) {
							let embed = new Discord.RichEmbed()
								.setAuthor('⚠️ Error ('+error.name+')')
								.setColor(0xFFA500)
								.setDescription('```'+error.message+'```');
							send(msg, embed);
						}
						return false;
					}
				}
				
				send(msg,'Sorry, the command you wrote does not exist. :x:');
				return false;
			}
		}, timeExe+3);
	});

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

	bot.on('messageReactionAdd', (reaction,user) => {
		if(reaction.message.author.id == '463425089673887764'){
			send(reaction.message,'reaction');
			react(reactionCommands, reaction, user, reaction.message.content);
		}
	});

	function send(msg,message){
		if(message != null) {
			msg.channel.send(message);
		}
	}
	function find(content, txt,discussion = false){
		if(discussion == false){
		  return content.indexOf(txt)==params.tag.length;
		}else{
		  return content.indexOf(txt)==0;
		}
	}

	function react(cmds,reaction,user,content) {
		for(let a = 0;a<cmds.length;a++) {
			let command = cmds[a];
			if(find(content, command.from, true) && reaction.emoji.name === command.emoji) {
				let txt = command.result(reaction,user);
				if(txt != null){
				  send(reaction.message, txt);
				}
			}
		}
	}

	bot.login(params.token);
}