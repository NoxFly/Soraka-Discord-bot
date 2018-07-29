var firebase = require('firebase');
const Discord = require('discord.js');
let exportObj = module.exports = {};
let reactionCommands = require('./functions/reaction_command.js');

var aBotList = [
	
	{
		'name'	:	'ahri',
		'tag'  	: 	'a!',
		'token' :	''//process.env.TOKEN_AHRI
	},
	{
		'name'	:	'caitlyn',
		'tag'	:	'$',
		'token'	:	''//process.env.TOKEN_CAITLYN
	}
];

var config = {
    apiKey: process.env.FIREBASE_TOKEN,
    authDomain: process.env.NAME_FIREBASE+".firebaseapp.com",
    databaseURL: "https://"+process.env.NAME_FIREBASE+".firebaseio.com",
    projectId: process.env.NAME_FIREBASE,
    storageBucket: process.env.NAME_FIREBASE+".appspot.com",
    messagingSenderId: process.env.SENDERID_FIREBASE
};
firebase.initializeApp(config);


aBotList.forEach(function(val, index, array) {
	startbot(val);
});



function startbot(params) {
	const bot = new Discord.Client();
	exportObj.bot = bot;
	let commands = require('./bots/'+params.name+'/command.js');
	module.exports = bot;

	bot.on('ready',() => {
		bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
	});

	bot.on('message', (msg) => {
		if(msg.author.id === '433365347463069716') {
			return;
		}
		if(msg.author.id!='355389600044417025' && msg.author.id!='316639200462241792'){
			send(msg, 'I could not be used because I am maintenance...');
			return;
		}
		return;
		let content = msg.content;
		if(content.indexOf(params.tag) === 0) {
	
		for(let a=0; a<commands.length; a++) {
			let command = commands[a];
			if (find(content, command.name)) {
				try {
					let txt = command.result(msg);
					if(txt=='not_find') {
						send(msg,'Sorry, the command you wrote does not exist. :x:');
					} else {
						send(msg, txt);
					}
					
				} catch(error) {
					msg.channel.send('error: '+error);
					
				}
				return false;
			}
		}
			
			send(msg,'Sorry, the command you wrote does not exist. :x:');
			return false;
		}
			
	});
	
	bot.on('guildMemberAdd', (msg) => {
		msg.author.toString().send("Welcome to the server!\nI can't be connected 24/7, but my creator try to gain money to host me on VPS.\nhttps://paypal.me/NoxFly\nEven if I get one dollar per person I will be able to be connected 1 years ! Thanks :smile:"); 
	});

	bot.on('messageReactionAdd', (reaction,user) => {
		react(reactionCommands, reaction, user, reaction.message.content);
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