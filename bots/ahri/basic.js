let main = require('./../../bot.js');
let bot = main.bot;
const Discord = require('discord.js');

// External functions
const admin = require('./../../functions/admin.js');
const dump = require('./../../functions/dump.js');
const perms = require('./../../functions/perms.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

let basic = [
    {
		name: 'help',
		group: 'hidden',
		result: (msg) => {
			let txt = '```';
			if(admin(msg.author.id)) {
				for(i in basic) {
					txt += ''+basic[i].name+'';
					if((i+1)%3 == 0) txt+= "\n";
					else txt += " ".repeat(20 - basic[i].name.length);
				}
				txt += "```";
				send(msg, txt);
			}
		}
	},
	
	{
		name: 'roleID',
		group: 'hidden',
		result: (msg) => {
			let Nroles = msg.guild.roles.map(role => role.name);
			let Iroles = msg.guild.roles.map(role => role.id);
			let txt = '```asciidoc\n';

			for(i in Nroles) {
				txt += Nroles[i] + (' '.repeat(30-Nroles[i].length)) + ':: ' + Iroles[i] + '\n'; 
			}

			txt += '```';
			send(msg, txt);
		}
	},
	
	{
		name: 'ev',
		description: 'show the result of javascript code',
		usage: 'a!ev {js code}',
		group: 'hidden',
		result: (msg) => {
			if(!admin(msg.author.id)) return;
			let res = '';
			let output = msg.content.split('ev ')[1];
			if(/process\.exit\(0\)/.test(output)) return;
			output = output.replace(/console\.log\((\w+)\)/gm,'send(msg,$1)');
			try {
				res = eval(output);
			} catch(error) {
				res = error;
			}
			output = output.replace(/;(\s+)?/gm,';\n');
			let embed = new Discord.RichEmbed()
				.addField('**:inbox_tray: Input:**','```js\n'+output+'```')
				.addField('**:outbox_tray: Output:**','```js\n'+res+'```');
			send(msg, embed);
		}
	},
    
    {
		name: 'server',
		description : 'display the informations of the server.',
		usage: '`a!server`',
		group: 'basic',
		result : (msg) => {
			if(msg.content!="a!server") send(msg, 'not_find');
			let Nroles = msg.guild.roles.map(role => role.name);
			let NRoles = Nroles.toString().split(',');
			let roles = '';
			let end = ', ';
			for(i in NRoles) {
				if(i==0) continue;
				if(i==NRoles.length-1) end = '';
				roles += NRoles[i]+end;
			}
			
			let Guild = msg.guild;
			
			let channels = Guild.channels.size;
			
			let online = parseInt(Guild.memberCount-Guild.members.filter(member => member.presence.status === 'offline').size);
			
			let embed = new Discord.RichEmbed()
				.setTitle(Guild.name.toUpperCase()+' information')
				.setThumbnail(Guild.iconURL)
				.setColor(0x43FF4E)
				.addField("Owner", '• '+Guild.owner.user.tag+'\n• (ID: '+Guild.ownerID+')')
				.addField("Roles", '• '+Guild.roles.size+'\n• '+roles)
				.addField("Members", '• '+Guild.memberCount+'\n• Online : '+online)
				.addField("Channels ", '• '+channels)
				.addField("Region", '• '+Guild.region)
				.addField("Create on ", '• '+Guild.createdAt);

			send(msg, embed);
		}
	},

	{
		name : 'invite',
		description : 'display the invite link of the super bot Ahri.',
		usage : '`a!invite`',
		group: 'basic',
		result : (msg) => {
			if(!(msg.content=="a!invite")) send(msg, 'not_find');
			let link = 'https://discordapp.com/oauth2/authorize?client_id=477918672732553216&scope=bot&permissions=535948401';
			let embed = new Discord.RichEmbed()
				.setTitle('Ahri\'s link')
				.setThumbnail('https://media.giphy.com/media/4To81xP5Yw3noDC4rE/giphy.gif')
				.setColor(0x43FF4E)
				.setDescription(link)
				.addField('Note','If my creator doesn\'t have internet, I will not be able to be connected.')
				.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online h24. \n$12 = 1 years hosting.')
				.addField('Link :','https://paypal.me/NoxFly')
				.setFooter('Version 1.3', 'https://media.giphy.com/media/4To81xP5Yw3noDC4rE/giphy.gif');
				send(msg, embed);
		}
    },
    
    {
		name: 'ping',
		description: 'Show the ms you have between when you send message and my reaction',
		usage: '`a!ping`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!ping")) send(msg, 'not_find');
			send(msg,":ping_pong: pong !\n*"+Math.round(bot.ping)+" ms*");
		}
    },
    
    {
		name: 'markdown',
		description: 'Show you all markdown possibilities',
		usage: '`a!markdown`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!markdown")) send(msg, 'not_find');
			send(msg,
				'```*italics*'+(' '.repeat(20))+'_italics_\n**bold**'+(' '.repeat(20))+'__underline__\n~~Strikethrough~~```'
				+'```asciidoc\n= Markdown =\nasciidoc, autohotkey, bash, coffeescript, cpp (C++), cs (C#), css, diff, fix, glsl, ini, json, md (markdown), ml, prolog, py, tex, xl, xml```'
				+'Find all demo on https://gist.github.com/ringmatthew/9f7bbfd102003963f9be7dbcf7d40e51'
			);
		}
    },
    
    {
		name : 'return',
		description : 'send a message to Ahri\'s creator.',
		usage : '`a!return` `your message`',
		group: 'basic',
		result : (msg) => {
			let name = msg.author.username+'#'+msg.author.discriminator;
			let authorMSG = msg.content.split('return ')[1];


			if(authorMSG===undefined) send(msg, 'Lol, my creator will not read an empty message, don\'t you ? :grimacing::joy:');

			try {
				let embed = new Discord.RichEmbed()
					.setTitle('You received a message from')
					.addField(name, msg.author.id)
					.setColor(0x007FFF)
					.setThumbnail(msg.author.avatarURL)
					.addField("message :", authorMSG);

				bot.users.get('316639200462241792').createDM().then(channel => {
					channel.send(embed);
				});
				send(msg, ':incoming_envelope: :calling: message sent');
			} catch(error) {
				send(msg, "An error occured. Please retry");
			}
		}
	},
	
	{
		name : '.',
		group: 'hidden',
		result : (msg) => {
			send(msg, '<|°_°|>');
		}
	},

	{
		name: 'id',
		description : 'display id of the server.',
		usage: '`a!id`',
		group: 'management',
		result: (msg) => {
			if(!(msg.content=="a!id")) send(msg, "There is no need for argument");
			if(admin(msg.author.id)) {
				msg.delete();
				msg.channel.send(':id: server id: '+msg.guild.id).then((msg) => {
					setTimeout(function() {
						msg.delete();
					},5000);
				});
			}
		}
	},

	{
		name: 'deleteChannel',
		description : 'delete the current channel.',
		usage: '`a!deleteChannel`',
		group: 'management',
		result: (msg) => {
			if(!(msg.content=="a!deleteChannel")) send(msg, "There is no need for argument");
			if(msg.author.id==msg.guild.ownerID || admin(msg.channel.id)) {
				let a = 3;
				msg.channel.send('This channel will be delete in '+a).then((msg) => {
					let i = setInterval(function() {
						if(a>0) {
							a--;
							msg.edit('This channel will be delete in '+a);
						} else {
							clearInterval(i);
							msg.channel.delete();
						}
					},1000);
				});
			}
		}
	},

	{
		name: 'clearChannel',
		description : 'Clear recent discussion of the current channel',
		usage: '`a!clearChannel`',
		group: 'management',
		result: (msg) => {
			if(!(msg.content=="a!clearChannel")) send(msg, "There is no need for argument");
			if(msg.author.id==msg.guild.ownerID || admin(msg.author.id)) {
				msg.channel.fetchMessages().then(function(list) {
					msg.channel.bulkDelete(list);
				}, function(err) {send(msg,'Error')});
			}
        }
	},
	
	{
		name : 'role',
		description : 'Add or remove to you a role of a server.',
		usage : '`a!role {role}`',
		group: 'management',
		result : (msg) => {
			let Nroles = msg.guild.roles.map(role => role.name);			
			let NRoles = Nroles.toString().split(',');
			let txt = '';
			
			if(/roles(list)?/.test(msg.content)) {
				for(i in NRoles) {
					if(i==0) continue;
					txt += NRoles[i]+/*' ('+IRoles[i]+')*/'\n';
				}
				
				let tt = (NRoles.length)-1;
				let embed = new Discord.RichEmbed()
					.setTitle('List of roles in '+msg.guild.name+' server')
					.setColor(0x007FFF)
					.addField('Total roles : '+tt,txt);
				 
				send(msg, embed);
			} else {
				let add = msg.content.split('role ')[1];
				let roles = msg.guild.roles.map(role => role.name);
				let rolesID = msg.guild.roles.map(role => role.id);
				roleID = rolesID.toString().split(',');
				let role;

				try {
					if(!(/,/.test(add))) {
						let a = 0;
						let aRole;
						
						let regRole = add.toLowerCase();
						regRole = new RegExp(regRole);
						for(i=1; i<roles.length; i++) {
							let r = roles[i].toLowerCase();
							if(regRole.test(r)) {
								aRole = roles[i];
								role = msg.guild.roles.find('name',roles[i]).id;
								a++;
							}
						}

						if(a==0) send(msg, 'The role doesn\'t exist');

						if(msg.guild.members.get(msg.author.id).roles.has(role)) {
							msg.guild.members.get(msg.author.id).removeRole(role);
							setTimeout(function() {
								if(!msg.guild.members.get(msg.author.id).roles.has(role)) {
									send(msg,aRole+' role removed');
								} else {
									send(msg,'this role cannot be removed :thinking:');
								}
							},1000);
						} else {
							msg.guild.members.get(msg.author.id).addRole(role);
							setTimeout(function() {
								if(msg.guild.members.get(msg.author.id).roles.has(role)) {
									send(msg,aRole+' role added');
								} else {
									send(msg,'this role cannot be added');
								}
							},1000);
						}
					}

				} catch(error) {
					for(i in NRoles) {
						if(i==0) continue;
						txt += NRoles[i]+'\n';
					}
			
					let tt = (NRoles.length)-1;
					let embed = new Discord.RichEmbed()
						.setTitle('List of roles in '+msg.guild.name+' server')
						.setColor(0x007FFF)
						.addField('Total roles : '+tt,txt);
					send(msg, embed);
				}
			}
		}
    },
    
    {
		name: 'perm',
		description: 'Show permission of a role',
		usage: '`a!perm role_name`',
		group: 'management',
		result: (msg) => {
			if(admin(msg.author.id)) {
				let role = msg.content.split('perm ')[1];
				let id = msg.guild.roles.find('name',role);
				
				if(id==null) {
					send(msg, "The role probably does not exist");
				} else {
					let perm = msg.guild.roles.find('name',role).permissions;
					let x = 100;
					let a = perm;
					let arr = [];
					while(a>0){
						var b = a - Math.pow(2,x);
						if(parseInt(b) == (b) && b>=0){
							a -= Math.pow(2,x);
							arr.push(Math.pow(2,x));
						}
						x--;
					}

					let p = "";
					p = perms(arr,p);
					send(msg, "Permissions of the role "+role+" : ```"+p+"```");
				}
			}
		}
	},
	
	{
		name : 'dice',
		description : 'roll a 6-sides dice.',
		usage : '`a!dice` `a number from 1 to 6`',
		group: 'game',
		result : (msg) => {
			if(/^(dice \d+)$/.test(msg.content.split('a!')[1])) {
				let n = msg.content.split('dice ')[1];
				
				if(n<1 || n>6 || n != Math.round(n)) {
					send(msg, 'The number must be an integer between 1 and 6');
				}
				if(!(/\d+/.test(n))) {
					send(msg, 'Must be a number !');
				}
				
				let r = Math.round(Math.random()*5+1);
				let res = (r==n)?'**You win**':'**You lose**';
				send(msg, ':game_die: Your number: '+n+'\nDice result : '+r+'\n'+res);
			} else {
				send(msg, 'You must choose a number');
			}
		}
	},
	
	{
		name : 'binary',
		description : 'Translate decimal to binary.',
		usage : '`a!binary` `an integer`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('binary')[1];
			let reg = /\d+/;
			if(reg.test(n)) {
				let r = Number(n).toString(2);
				send(msg, n+' = `'+r+'` in binary');
			} else {
				send(msg, 'Need a number');
			}
		}
	},
	
	{
		name : 'decimal',
		description : 'Translate binary to decimal.',
		usage : '`a!decimal` `an integer`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('decimal')[1];
			let reg = /[0-1]+/;
			if(reg.test(n)) {
				let r = parseInt(n,2);
				send(msg, '`'+n+'` = '+r+' in decimal');
			} else {
				send(msg, 'Need a number, and only 0 or 1');
			}
		}
    }
];

commands = basic.concat(main.commands);
module.exports = basic;