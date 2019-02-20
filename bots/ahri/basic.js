let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
const fs = require('fs');

// Basic - Games - Utility - Personal - Social - management

// External functions
const admin = require('./../../functions/admin.js');
const mtsm = require('./../../functions/mtsm.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

let commands = [];

let basic = [
	{
		name : 'help',
		description : 'say the list of commands and their explanation. if you add a key command behind `a!help`, it will say you the explanation of this key command.',
		usage : '`a!help` `key (optional)`',
		group: 'basic',
		result : (msg, args) => {
			let mod_commands = basic.concat(main.commands);

			if(args.length>0) {
				let text = '';
				
				for(let i=0; i<mod_commands.length-1;i++) {
					let cmdName = mod_commands[i].name;
					if(args[0]==cmdName && mod_commands[i].group!="hidden" || args[0]==cmdName && admin(msg.author.id)) {
						text = "  • `"+cmdName+"` : "
								+mod_commands[i].description+'\n\tWrite → '+mod_commands[i].usage;
							send(msg, text);
							return;
					}
				}
				
				send(msg, 'I can\'t help you, the command does not exist 😓');
			} else if(args.length==0) {
				let txt = "";
				let c = "";
				for(let i=0; i<mod_commands.length; i++) {
					let cmd = mod_commands[i];
					if(cmd.group!='hidden' && cmd.group!=null) {
						let m = cmd.group;
						if(m===undefined) m = "basic";
						m = "\n__**"+m.charAt(0).toUpperCase()+m.slice(1)+"**__\n";
						if(c!=m) {
							msg.author.send(txt);
								txt = "";
							txt += m;

						}
						c = m;
						txt += "• `"+cmd.name+"` : "+cmd.description+"\n\t→"+cmd.usage+"\n";
					}
				}
				msg.author.send(txt);
				send(msg, 'All commands sent in your DMs');
			} else {
				return;
			}
		}
	},

	{
		name: 'roleID',
		description: 'show roles ID',
		group: 'hidden',
		usage: 'a!roleID',
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
		result: (msg, args) => {
			let res = '';
			args = args.join();
			if(/process\.exit\(0\)/.test(args)) return;
			args = args.replace(/console\.log\((\w+)\)/gm,'send(msg,$1)');
			try {
				res = eval(args);
			} catch(error) {
				res = error;
			}
			args = args.replace(/;(\s+)?/gm,';\n');
			let embed = new Discord.RichEmbed()
				.addField('**:inbox_tray: Input:**','```js\n'+args+'```')
				.addField('**:outbox_tray: args:**','```js\n'+res+'```');
			send(msg, embed);
		}
	},
    
    {
		name: 'guilds',
		description: 'show all Ahri\'s guild',
		group: 'hidden',
		usage: 'a!guilds {page}',
		result: (msg, args) => {
			let guildList = bot.guilds.array();
			let txt = "";
			let aGuild = [];

			try {
				guildList.forEach(guild => {
					aGuild.push(
						{
							name: guild.name,
							id: guild.id,
							owner: guild.owner
						}
					);
				});
			} catch (err) {
				
			}

			let iPage = args[0];
			if(iPage<1 || iPage*10-10>aGuild.length || isNaN(iPage)) iPage = 1;
			let iEnd = iPage*10-1;
			let iStart = iPage*10-10;
			let iMaxPage = Math.ceil(aGuild.length/10);
			for(i=iStart; i<iEnd; i++) {
				if(i==aGuild.length) break;
				txt += "-• Guild name: "+aGuild[i].name
						+"\n\t\tGuild ID: "+aGuild[i].id
						+"\n\t\tGuild owner: "+aGuild[i].owner.user.username+'#'+aGuild[i].owner.user.discriminator+"\n"
			}
			send(msg, '```diff\n'+txt+'\nPage '+iPage+'/'+iMaxPage+' | '+aGuild.length+' guilds```');
		}
  },
    
  {
		name: 'local?',
		description: 'return either if this message was provided in a server or in PM',
		group: 'hidden',
		usage: 'a!local?',
		result: (msg) => {
			if(msg.content!="a!local?") return;
			try {send(msg, 'You are on `'+msg.guild.name+'` server');}
			catch(err) {send(msg, 'You are on private message with me');}
		}
  },
    
  {
		name: 'ans',
		description: 'Answer to a mentionned user',
		group: 'hidden',
		usage: 'a!ans {user} {message}',
		result: (msg) => {
			var id = msg.content.replace(/a!ans\s+<@!?(\d+)>\s+\w+/,'$1').replace(/[a-zA-Z\s+]+/,'');
			var message = msg.content.replace(/a!ans\s+<@!?\d+>\s+(\w+)/,'$1');

			bot.fetchUser(id).then(user => {
				user.createDM().then(channel => {
					let embed = new Discord.RichEmbed()
						.setAuthor("ドリアン#8850 answered you :")
						.setColor(0x007FFF)
						.setThumbnail(msg.author.avatarURL)
						.addField("message :",message);
					channel.send(embed);
				});
			});

			send(msg, 'Message envoyé à <@'+id+'>');
		}
	},
	
	{
		name: 'add',
		description: 'add X money to mentionned user',
		group: 'hidden',
		usage: 'a!add {user} {money}',
		result: (msg, args) => {
			if(args.length==2) {
				let id = args[0].replace(/<@(\d+)>/, '$1');
				let add = args[1];
				let a = {};
				let defined = false;
				
				DB.profile(id).getUser(function(data) {
						data = data.val();

					if(data!=null) {
						a.id = data.id;
						a.name = data.name;

						DB.profile(id).getData('data', function(data2) {
							data2 = data2.val();
							a.money = parseInt(data2.money);
							a.money += parseInt(add);
							defined = true;
						});
					}
				});

				setTimeout(function() {
					if(defined) {
						DB.profile(id).setData('data/money',a.money);
						send(msg, add+' gem(s) :gem: added to `'+a.name+'`');
					} else {
						send(msg,'this user doesn\'t have an account');
					}
				},DB.responseTime);
			}
		}
	},

	{
		name: 'remove',
		description: 'remove X money to a mentionned user',
		group: 'hidden',
		usage: 'a!remove {user} {money}',
		result: (msg, args) => {
			if(args.length==2) {
				let id = args[0].replace(/<@(\d+)>/, '$1');
				let add = args[1];
				let a = {};
				let defined = false;
				
				DB.profile(id).getUser(function(data) {
						data = data.val();

					if(data!=null) {
						a.id = data.id;
						a.name = data.name;

						DB.profile(id).getData('data', function(data2) {
							data2 = data2.val();
							a.money = parseInt(data2.money);
							a.money -= parseInt(add);
							defined = true;
						});
					}
				});

				setTimeout(function() {
					if(defined) {
						DB.profile(id).setData('data/money',a.money);
						send(msg, add+' gem(s) :gem: removed from `'+a.name+'`');
					} else {
						send(msg,'this user doesn\'t have an account');
					}
				},DB.responseTime);
			}
		}
	},
	
	{
		name : 'reset',
		description : 'reset your password',
		usage : '`a!reset`',
		group: 'hidden',
		result : (msg) => {
			if(msg.content!="a!reset") return;

			let name = msg.author.username+'#'+msg.author.discriminator;
			let reset;
			let Now = Date.now();
		   
			DB.getData('param', function(data) {
				reset = data.val()._reset;
				resetDelay = data.val()._resetTime;
			});
  	 		
			setTimeout(function() {
				if(reset==1) {
					let pass = randPass();
					DB.updateData('param/_reset', 0).updateData('param/_resetTime', Now).updateData('param/password', pass);
					msg.author.createDM().then(channel => {
					channel.send('• Username: '+name+'\n• Password: '+pass+'\nConnect you to dorian.thivolle.net/ahri to manage your account.').then(sentMessage => sentMessage.pin());
				});
					
				} else {
					send(msg, 'You need to reclick on `reset` button because the time is over.\nhttps://dorian.thivolle.net/ahri');
				}
				
			},DB.responseTime);
		}
	},
    
  {
		name: 'server',
		description : 'display the informations of the server.',
		usage: '`a!server`',
		group: 'basic',
		result : (msg) => {
			if(msg.content!="a!server") return;
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
			if(!(msg.content=="a!invite")) return;
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
		name : 'paypal',
		description : 'show you the link of my Paypal. The goal is to be host in a VPS to be online 24/7. Even $1 is enought',
		usage : '`a!paypal`',
		group: 'basic',
		result : (msg) => {
			if(!(msg.content=="a!donate")) return;
			let r = msg.content.substring(8);
			if(r=='') {
				let embed = new Discord.RichEmbed()
					.setTitle('My paypal :')
					.setColor(0x007FFF)
					.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online 24/7. \n$12 = 1 year')
					.addField('Link :','https://paypal.me/NoxFly');
				send(msg, embed);
			}
		}
  },
    
  {
		name: 'ping',
		description: 'Show the ms you have between when you send message and my reaction',
		usage: '`a!ping`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!ping")) return;
			send(msg,":ping_pong: pong !\n*"+Math.round(bot.ping)+" ms*");
		}
  },
    
  {
		name: 'modules',
		description: 'Show possible extensions of Ahri. These extensions add more commands and unlock more possibilities.',
		usage: '`a!modules`',
		group: 'basic',
		result: (msg) => {
      if(!(msg.content=="a!modules")) return;
      let modules = '';
			let end = ' - ';
			fs.readdir('bots/ahri/modules', function(err, items) {
				for (var i=0; i<items.length; i++) {
					if(i==items.length-1) end = '';
					modules += items[i].replace('.js','')+end;
				}

				let embed = new Discord.RichEmbed()
					.setTitle('Modules')
					.setColor(0x43FF4E)
					.addField(
						'You can install or uninstall group of commands on the server writing\n`a!config modules.add {name}`', modules
					)
					.setDescription('I recommend you to install the modules game, personal and social');

				send(msg, embed);
			});
		}
	},
	
	{
		name: 'config',
		description: 'Some possible configurations, and adding or removing modules',
		usage: '`a!config {config}`',
		group: 'basic',
		result: (msg) => {
			let App = main.app;
			let cmd = msg.content.split('config ')[1];
			if(cmd===undefined) send(msg, 'Usage: `'+basic.filter((c)=>c.name=='config')[0].usage+'`');
			
			if(/^modules/.test(cmd)) {
				let arg = cmd.split('modules')[1];
				if(arg=='') send(msg, 'Command not complete, I can\'t do anything');
				if(!admin(msg.author.id) && msg.author.id!==msg.guild.ownerID) send(msg, 'You can\'t manage modules');
				fs.readdir('bots/ahri/modules', function(err, items) {
					let modules = [];
					for (var i=0; i<items.length; i++) {
						modules.push(items[i].replace('.js',''));
					}

					if(arg.startsWith('.add')) {
						arg = arg.split('.add')[1].replace(" ", "");
						let mod_sav = App[msg.guild.id].modules;
						let download = [];
						for(i in mod_sav) {
							download.push(mod_sav[i]);
						}
						if(arg===undefined) send(msg, 'Specify a module please');
						arg = arg.toLowerCase();
						if(modules.indexOf(arg)===-1) {
							send(msg,'This module does not exist\n`a!modules` to see availible modules');
						} else if(download.indexOf(arg)!==-1) {
							send(msg, 'You already have this module');
						} else {
							DB.server(msg.guild.id).addData('modules', arg, arg);
							msg.channel.send('Installing... (0%)').then(message => {
								for(i=0; i<120; i+=20) {
									message.edit('Installing... ('+i+'%)');
									if(i==100) message.edit('Successfully installed:**`'+arg+'`**');
								}
							});
						}
					} else if(arg.startsWith('.remove')) {
						arg = arg.split('.remove ')[1];
						let mod_sav = App[msg.guild.id].modules;
						let download = [];
						for(i in mod_sav) {
							download.push(mod_sav[i]);
						}
						if(arg===undefined) send(msg, 'Specify a module please');
						arg = arg.toLowerCase();
						if(modules.indexOf(arg)===-1) {
							send(msg,'This module does not exist\n`a!modules` to see availible modules');
						} else if(download.indexOf(arg)===-1) {
							send(msg, 'You do not have this module');
						} else {
							DB.server(msg.guild.id).deleteData('modules/'+arg);
							send(msg, 'You uninstalled This module : `'+arg+'`');
						}
					}
				});
			} else {
				return;
			}
		}
	},
    
  {
		name: 'markdown',
		description: 'Show you all markdown possibilities',
		usage: '`a!markdown`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!markdown")) return;
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

			let mpAuth, ans;
			let Now = Date.now();
			DB.getData('delay/mpAuth', function(data) {
				mpAuth = data.val();
			});

			setTimeout(function() {
				ans = mtsm(85400000-parseInt(Now-mpAuth));
				if(Now-mpAuth >=85400000) {
					mpAuth = Now;
					send(msg, ':incoming_envelope: :calling: message sent');

					DB.updateData('delay/mpAuth', mpAuth);
					let embed = new Discord.RichEmbed()
						.setTitle('You received a message from')
						.addField(name, msg.author.id)
						.setColor(0x007FFF)
						.setThumbnail(msg.author.avatarURL)
						.addField("message :", authorMSG);
		
					bot.users.get('316639200462241792').createDM().then(channel => {
						channel.send(embed);
					});
				}
				send(msg, 'You need to wait **'+ans+'** to send a new message :hourglass:');
			},DB.responseTime);
		}
	}
];

commands = basic.concat(main.commands);
module.exports = basic;