const Discord = require('discord.js');
var firebase = require('firebase');

var aBotList = [
	
	{
		'name'	:	'Ahri',
		'tag'  	: 	'a!',
		'token' :	process.env.TOKEN_AHRI
	},
	{
		'name'	:	'Caitlyn',
		'tag'	:	'$',
		'token'	:	process.env.TOKEN_CAITLYN
	}
];

var config = {
    apiKey: process.env.FIREBASE_TOKEN,
    authDomain: "ahri-561c5.firebaseapp.com",
    databaseURL: "https://ahri-561c5.firebaseio.com",
    projectId: "ahri-561c5",
    storageBucket: "ahri-561c5.appspot.com",
    messagingSenderId: "90077155476"
};
firebase.initializeApp(config);


aBotList.forEach(function(val, index, array) {
	startbot(val);
});



function startbot(params) {
	const bot = new Discord.Client();
	let commands = require('./bots/'+params.name+'/command.js');
	module.exports = bot;

	bot.on('ready',() => {
		bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
	});

	bot.on('message', (msg) => {
		if(msg.author.id === '433365347463069716') {
			return;
		}
		
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

	function send(msg,message){
		if(message != null) {
			msg.channel.send(message);
		}
	}
	function find(content, txt){
		return content.indexOf(txt)==params.tag.length;
	}

	bot.login(params.token);
}