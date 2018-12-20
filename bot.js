// CONSTANTS
let exportObj = module.exports = {};
const Discord = require('discord.js');
const dump = require('./functions/dump.js');
let commands = [];
let nCmd = [];

// BOTS INFOS
let aBotList = [	
	{
		'name'	:	'ahri',
		'tag'  	: 	'a!',
		'id'	:	'477918672732553216',
		'token' :	process.env.TOKEN
	}
];

aBotList.forEach(function(val, index, array) {
	startbot(val, index);
});

function startbot(params, i) {
	const bot = new Discord.Client();
	exportObj.bot = bot;
	commands[i] = require('./bots/ahri/basic.js');

	for(var j=0; j<Object.keys(commands[i]).length; j++) {
		nCmd.push(commands[i][j].name);
	}

	/** ******************************************************************* **/
	/** ******************************************************************* **/
	// QUAND LE BOT EST LANCE

	bot.on('ready',() => {
		console.log(params.name+' ready !');
		bot.user.setActivity(params.tag+'help | '+bot.guilds.size+' servers');
	});

	/** ******************************************************************* **/
	/** ******************************************************************* **/
	// QUAND QQUN ENVOIE UN MSG

	bot.on('message', (msg) => {
		if(msg.author.id===params.id || msg.author.bot==true) return;

		if(msg.content=='<@'+params.id+'>' || msg.content=='<@'+params.id+'> .') {
			send(msg, 'Hey :P');
		} else {
			get_command(msg, msg.content, params.tag, i);
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

function get_command(msg, content, tag, i) {
	if(msg.content.indexOf(tag) === 0) {
		let command = (msg.content.split(tag)[1]).split(' ')[0];
		let idx = nCmd.indexOf(command);
        if(idx>-1) {
            let args = command.split(commands[i][command])[1];
            try {commands[i][idx].result(msg, args)}
            catch (error) {
				//console.log(error);
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