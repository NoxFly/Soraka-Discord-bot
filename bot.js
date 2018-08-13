var firebase = require('firebase');
const Discord = require('discord.js');
let reactionCommands = require('./functions/reaction_command.js');
const DB = require('./DB.js');
let check = require('./functions/check.js');
let checkServer = require('./functions/checkServer.js');

let exportObj = module.exports = {};

let Database = new DB();
exportObj.database = Database;

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
	let commands = require('./bots/'+params.name+'/command.js');
	

	bot.on('ready',() => {
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
					console.log(members+' | '+typeof m);
					if(activity) bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
					else bot.user.setActivity(params.tag+'help | '+members+' members');
				} catch(error) {
					bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
				}
			},Database.responseTime);
		}, 600000);
	});

	bot.on('message', (msg) => {
		if(msg.author.id === params.id) {
			return;
		}

		let id = msg.author.id;
		let name = msg.author.username+'#'+msg.author.discriminator;
		let avatar = msg.author.avatarURL;
			
		check(msg, id, name, avatar);

		let content = msg.content;
		if(content.indexOf(params.tag) === 0) {
			
	
		for(let a=0; a<commands.length; a++) {
			let command = commands[a];
			if (find(content, command.name)) {
				try {
					Database.setAuthor(msg.author);
					Database.profile(msg.author.id);
					let txt = command.result(msg);
					if(txt=='not_find') {
						return;
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
			
	});
	
	/*
	bot.on('guildMemberAdd', (msg) => {
		msg.author.createDM().then(channel => {
			channel.send("Welcome to the server!\nI can't be connected 24/7, but my creator try to gain money to host me on VPS.\nhttps://paypal.me/NoxFly\nEven if I get one dollar per person I will be able to be connected 1 years ! Thanks :smile:"); 
		});
	});
	*/

	bot.on('guildCreate', (guild) => {
		let id = guild.id;
		let name = guild.name;
		let owner = guild.ownerID;
		checkServer(id, name, owner);
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