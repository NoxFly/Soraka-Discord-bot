let firebase = require('firebase');
let bot = require('../../bot.js');
const Discord = require('discord.js');

let reg = /\S/;

// External functions
function randPass() {
	return Math.random().toString(36).slice(-8);
}

function ahri(msg) {
	if(msg.guild.members.find('id', '433365347463069716'))
}

function checkGame(msg,ref,id) {
	let a = 0;
	ref.on('child_added', function() {
		a++
	})
	
	setTimeout(function() {
		if(a==0) {
			ref.update({
				start: true,
				champ: false,
				lvl: 1,
				kills: 0,
				death: 0,
				assist: 0,
				name: false,
				champSet: {
					life: 0,
					mana: 0,
					manaReg: 0,
					lifeSteal: 0,
					armor: 0,
					attack: 0,
					speed: 0,
					magicRes: 0,
					power: 0,
					lifeReg: 0,
					critics: 0
				}
			});
			msg.channel.send('Account created``` ```');
		}
			msg.channel.send('Account already existing``` ```');
	},1000);
}

function admin(auth) {
	if(auth!='316639200462241792') {
		return false;
	}
	return true;
}

function mtsm(mills) {
	let milliseconds = parseInt((mills%1000)/100),
	seconds = parseInt((mills/1000)%60),
	minutes = parseInt((mills/(1000*60))%60),
	hours = parseInt((mills/(1000*60*60))%24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds ;seconds ;
}

const commands = [
{
	name: 'test',
	result: (msg) => {
		console.log(msg.guild.members.find('id', '433365347463069716')) 
	}
}
{
   name : 'help',
   description : 'show all commands with their description and usage',
   result : (msg) => {
			let reg = /^help (\w+)$/, txt = '';
			
			// Si il y a quelque chose après
			if(reg.test(msg.content.split('$')[1])) {
				let n = msg.content.split('help ')[1];
				let text = '';
				
				// On cherche la commande demandée
				for(let i=0; i<commands.length;i++) {
						let reg2 = new RegExp(commands[i].name);
						// Si on a trouvé, on affiche
						if(reg2.test(n)) {
							text = "  • `"+n+"` : ";
							text += commands[i].description;
							return text;
						}
					}
				
				// La commande n'a pas été trouvée
				return 'I can\'t help you, the command does not exist 😓';
				
			} else if(/^(help)$/.test(msg.content.split('$')[1])) {
				for(let i=0;i<commands.length;i++){
					txt += '  • `'+commands[i].name+' ` : '+commands[i].description+'\n';
				}
				return txt;
			}
		}
	},
	
	{
   name : 'invite',
   description : 'Show info about Caitlyn and her invite link',
   result : (msg) => {
 			let cmd = msg.content.replace('$step','');
     return 'I\'m an extension of Ahri. If she is not on the server, I could not work.\nhttps://discordapp.com/api/oauth2/authorize?client_id=443430082459992065&permissions=2110258391&scope=bot';
		}
	},
	{
		name : 'chp',
		description : 'Play with your champion !',
		usage : '`a!chp {command} (optional)`',
		group: 'game',
		result : (msg) => {
			let c = msg.content.split('chp')[1].replace(' ','');
			
			msg.channel.send('Verifying your account...');
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
			let ref = firebase.database().ref('game/'+id);
			checkGame(msg,ref,id);
			
			let champRX = /Caitlyn|Zed|Sona|Gangplank|Rengar/i;
			let Game = [];
			ref.on('child_added', function(data) {
				Game.push(data.val());
			});
			
			setTimeout(function() {
				if(c=='') {
					if(Game[7]==true) {
						msg.channel.send('Oh you\'re starting !');
						msg.channel.send('Choose the best champion you want to have :\nwrite `a!info {name}` for information about a specific champion\nand write `a!choose {name}` to choose your champion');
					
						msg.channel.send('```Champions```• Caitlyn\n• Zed\n• Sona\n• Gangplank\n• Rengar');
					}
				} else {
					if(Game[6]==true) {
						msg.channel.send('Sorry you are begining. Just write `a!chp` without letters after');
					} else {
						if(champRX.test(c)) {
							alert('You choose '+x);
						} else {
							msg.channel.send('Sorry the command you wrote does not exist :x:');
						}
						
						
					}
				}
			},1000);
			
			
		}
	},
	
	{
		name : 'info',
		description : 'Play with your champion !',
		usage : '`a!info {name}`',
		group: 'game',
		result : (msg) => {
			let c = msg.content.split('info')[1].replace(' ','');
			
			if(reg.test(c)) {
				let a = 0;
				let ref = firebase.database().ref('game/champions/'+c);
				let info = [];
				ref.on('child_added', function(data) {
					info.push(data.val());
					a++
				});
				
				let picture = "http://ddragon.leagueoflegends.com/cdn/8.11.1/img/champion/";
				
				setTimeout(function() {
					if(a==0) {
						msg.channel.send('Need to write a real champion name');
					} else {
					let armor = info[0];
					let attack = info[1];
					let critics = info[2];
					let hp = info[3];
					let regene = info[4];
					let magic = info[5];
					let mana = info[6];
					let mRegene = info[7]
					let name = info[8];
					picture += info[8]+'.png';
					let power = info[9];
					let role = info[10];
					let type = info[11];
						
					let embed = new Discord.RichEmbed()
						.setTitle(name)
						.setThumbnail(picture)
						.setColor(0x494C51)
						.addField('Role',role)
						.addField('Type',type)
						.addField('Health',hp)
						.addField('Regeneration per minutes',regene)
						.addField('Mana / Energy',mana)
						.addField('Mana regeneration per seconde',mRegene)
						.addField('Attack',attack)
						.addField('Critics',critics+'%')
						.addField('Armor',armor)
						.addField('Magic resistance',magic);
						
					msg.channel.send(embed);
					}
				},1000);
			} else {
				return 'Need to write a champion name';
			}
		}
	}
];

module.exports = commands;