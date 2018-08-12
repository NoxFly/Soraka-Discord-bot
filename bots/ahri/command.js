let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let DB = main.database;
let champ = require('./../../functions/champions.json');
const Discord = require('discord.js');

// Basic - Games - Utility - Personal - Social - management

// External functions
let admin = require('./../../functions/admin.js');
let check2 = require('./../../functions/checktwo.js');
let getTop = require('./../../functions/gettop.js');
let mtsm = require('./../../functions/mtsm.js');
let dump = require('./../../functions/dump.js');
let profile = require('./../../functions/profile.js');
let checkServer = require('./../../functions/checkServer.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

function log(msg, log) {
	let embed = new Discord.RichEmbed()
		.setAuthor('Log')
		.setColor(0xE82C0C)
		.setDescription(log);
	send(msg, embed);
}

// *** //

const commands = [
	{
		name: 'helplight',
		group: 'hidden',
		result: (msg) => {
			let txt = '';
			if(admin(msg.author.id)) {
				for(i in commands) {
					txt += '`'+commands[i].name+'`, ';
				}
				return txt;
			}
		}
	},
	{
		name : 'help',
		description : 'say the list of commands and their explanation. if you add a key command behind `a!help`, it will say you the explanation of this key command.',
		usage : '`a!help` `key (optional)`',
		group: 'basic',
		result : (msg) => {
			let reg = /^help (\w+)$/;
			
			if(reg.test(msg.content.split('a!')[1])) {
				let n = msg.content.split('help ')[1];
				let text = '';
				
				for(let i=0; i<commands.length;i++) {
						let reg2 = new RegExp(commands[i].name);
						if(reg2.test(n)) {
							text = "  • `"+n+"` : ";
							text += commands[i].description+'\n\tWrite → '+commands[i].usage;
							if(commands[i].group=='hidden'){} else {return text;}
						}
					}
				
				return 'I can\'t help you, the command does not exist 😓';
				
			} else if(/^(help)$/.test(msg.content.split('a!')[1])) {
			
			/* ** */                /* ** */
			
			let basics = '\n__**Basic :**__\n',
				games = '\n__**Game :**__\n',
				utility = '\n__**Utility :**__\n',
				personal = '\n__**Personal :**__\n',
				social = '\n__**Social :**__\n',
				management = '\n__**management :**__\n';
			
			let cmd;
			
			for(i in commands) {
				cmd = commands[i];
				
				switch(cmd.group) {
					case 'basic':
						basics += '• '
							+'`'+cmd.name+'` : '
							+cmd.description
							+'\n\t'
							+'→ '
							+cmd.usage+'\n';
						break;
					case 'game':
						games += '• '
							+'`'+cmd.name+'` : '
							+cmd.description
							+'\n\t'
							+'→ '
							+cmd.usage+'\n';
						break;
					case 'utility':
						utility += '• '
							+'`'+cmd.name+'` : '
							+cmd.description
							+'\n\t'
							+'→ '
							+cmd.usage+'\n';
						break;
					case 'personal':
						personal += '• '
							+'`'+cmd.name+'` : '
							+cmd.description
							+'\n\t'
							+'→ '
							+cmd.usage+'\n';
						break;
					case 'social':
						social += '• '
							+'`'+cmd.name+'` : '
							+cmd.description
							+'\n\t'
							+'→ '
							+cmd.usage+'\n';
						break;
					case 'management':
						management += '• '
							+'`'+cmd.name+'` : '
							+cmd.description
							+'\n\t'
							+'→ '
							+cmd.usage+'\n';
						break;
				}
			}
			
			 txt = basics + '\n' + games + '\n' + utility + '\n'+personal + '\n' + social + '\n' + management;
				
			 setTimeout(function() {
			 	msg.author.createDM().then(channel => {
					channel.send(basics);
					channel.send(games);
					channel.send(utility);
					channel.send(personal);
					channel.send(social);
					channel.send(management);
				}); 
			 },500);
			 
			return 'All commands sent in your DMs';
			
			} else {
				return 'not_find';
			}
		}
	},

	{
		name: 'id',
		description : 'display id of the server.',
		usage: '`a!id`',
		group: 'management',
		result: (msg) => {
			if(!(msg.content=="a!id")) return 'not_find';
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
			if(!(msg.content=="a!deleteChannel")) return 'not_find';
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
			if(!(msg.content=="a!clearChannel")) return 'not_find';
			if(msg.author.id==msg.guild.ownerID || admin(msg.author.id)) {
				msg.channel.fetchMessages().then(function(list) {
					msg.channel.bulkDelete(list);
				}, function(err) {send(msg,'Error')});
			}
		}
	},

	{
		name: 'server',
		description : 'display the informations of the server.',
		usage: '`a!server`',
		group: 'basic',
		result : (msg) => {
			if(!(msg.content=="a!server")) return 'not_find';
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
			channels -= 2;
			
			let online = parseInt(Guild.memberCount-Guild.members.filter(member => member.presence.status === 'offline').size);
			
			let embed = new Discord.RichEmbed()
				.setTitle(Guild.name.toUpperCase()+' information')
				.setThumbnail(Guild.iconURL)
				.setColor(0xDA004E)
				.addField("Owner", '• '+Guild.owner.user.tag+'\n• (ID: '+Guild.ownerID+')')
				.addField("Roles", '• '+Guild.roles.size+'\n• '+roles)
				.addField("Members", '• '+Guild.memberCount+'\n• Online : '+online)
				.addField("Channels ", '• '+channels)
				.addField("Region", '• '+Guild.region)
				.addField("Create on ", '• '+Guild.createdAt);

			return embed;
		}
	},

	{
		name : 'invite',
		description : 'display the invite link of the super bot Ahri.',
		usage : '`a!invite`',
		group: 'basic',
		result : (msg) => {
			if(!(msg.content=="a!invite")) return 'not_find';
			let link = 'https://discordapp.com/oauth2/authorize?client_id=477918672732553216&scope=bot&permissions=519171153';
			let embed = new Discord.RichEmbed()
				.setTitle('Ahri\'s link')
				.setThumbnail('https://media.giphy.com/media/4To81xP5Yw3noDC4rE/giphy.gif')
				.setColor(0xDA004E)
				.setDescription(link)
				.addField('Note','If my creator doesn\'t have internet, I will not be able to be connected.')
				.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online h24. \n$12 = 1 years hosting.')
				.addField('Link :','https://paypal.me/NoxFly')
				.setFooter('Version 1.1', 'https://media.giphy.com/media/4To81xP5Yw3noDC4rE/giphy.gif');
			return embed;
		}
	},

	{
		name : 'loveme',
		description : 'say yes or no.',
		usage : '`a!loveme`',
		group: 'game',
		result : (msg) => {
			if(!(msg.content=="a!loveme")) return 'not_find';
			let love = ['yes :heart:','no :broken_heart:'];
			return 'My answer is '+love[Math.round(Math.random())];
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
					return 'The number must be an integer between 1 and 6';
				}
				if(!(/\d+/.test(n))) {
					return 'Must be a number !';
				}
				
				let r = Math.round(Math.random()*5+1);
				let res = (r==n)?'**You win**':'**You lose**';
				return ':game_die: Your number: '+n+'\nDice result : '+r+'\n'+res;
			} else {
				return 'You must choose a number';
			}
		}
	},

	{
		name : 'date',
		description : 'say the current date',
		usage : '`a!date`',
		group: 'utility',
		result : (msg) => {
			if(!(msg.content=="a!date")) return 'not_find';
			let D = new Date();
			let H = D.getHours();
			let M = D.getMinutes();
			let S = D.getSeconds();
			return ':clock2: from you it\'s : '+H+':'+M+':'+S;
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
				return n+' = `'+r+'` in binary';
			} else {
				return 'Need a number';
			}
		}
	},
	
	{
		name : 'decimal',
		description : 'Translate binary to decimal.',
		usage : '`a!decimal` `an integer`',
		result : (msg) => {
			let n = msg.content.split('decimal')[1];
			let reg = /[0-1]+/;
			if(reg.test(n)) {
				let r = parseInt(n,2);
				return '`'+n+'` = '+r+' in decimal';
			} else {
				return 'Need a number, and only 0 or 1';
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
			return txt;
		}
	},

	{
		name : 'role',
		description : 'Add or remove to you a role of a server.',
		usage : '`a!role {role name}`',
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
				 
				return embed;
				
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

						if(a==0) return 'The role doesn\'t exist';

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
					return embed;
				}
			}
		}
	},

	{
		name : 'donate',
		description : 'show you the link of my Paypal. The goal is to be host in a VPS to be online 24/7. Even $1 is enought',
		usage : '`a!donate`',
		group: 'social',
		result : (msg) => {
			if(!(msg.content=="a!donate")) return 'not_find';
			let r = msg.content.substring(8);
			if(r=='') {
				let embed = new Discord.RichEmbed()
					.setTitle('My paypal :')
					.setColor(0x007FFF)
					.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online 24/7. \n$12 = 1 year')
					.addField('Link :','https://paypal.me/NoxFly');
				return embed;
			}
		}
	},

	{
		name: 'ping',
		description: 'Show the ms you have between when you send message and my reaction',
		usage: '`a!ping`',
		group: 'utility',
		result: (msg) => {
			if(!(msg.content=="a!ping")) return 'not_find';
			send(msg,":ping_pong: pong !\n*"+Math.round(bot.ping)+" ms*");
		}
	},

	{
		name: 'modules',
		description: 'Show possible extensions of Ahri. These extensions add more commands and unlock more possibilities.',
		usage: '`a!modules`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!modules")) return 'not_find';
			return 'There is not extensions for now !';
		}
	},

	{
		name: 'champ',
		description: 'Show image of a League of Legends champion',
		usage: '`a!champ {name} {skin digit}`',
		group: 'game',
		result: (msg) => {
			if(msg.content=='a!champ') {
            let r = Math.round(Math.random()*141);
            let embed = new Discord.RichEmbed()
                .setTitle(champ[r].name)
                .setDescription("https://euw.leagueoflegends.com/en/game-info/champions/"+champ[r].name)
                .setImage("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+champ[r].name+".png");
           return embed;
        } else if(/a!champ [a-zA-Z]+ skin \d+/.test(msg.content)) {
        	let c = msg.content.split('champ ')[1];
        	c = c.replace(/\d+/,'').replace(' skin ','').replace(/\s+/,'');
			c = c.toLowerCase();
			for(i in champ) {
				let ch = champ[i].name;
				let cha = ch.toLowerCase();
				if(c==cha) {
					let s = msg.content.split('champ ')[1];
					s = s.replace(/[a-zA-Z ]+/,'');
					
					let embed = new Discord.RichEmbed()
						.setTitle(ch)
						.setImage("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+ch+"_"+s+".jpg");
					return embed;
				}
				
			}
        	return 'This champion does not exist :x:';
        } else {
        	let c = msg.content.split('champ ')[1].replace(/\s+/,'');
        	c = c.toLowerCase();
        	for(i in champ) {
				let ch = champ[i].name;
				let cha = ch.toLowerCase();
				if(c==cha) {
					let embed = new Discord.RichEmbed()
						.setTitle(ch)
						.setDescription("https://euw.leagueoflegends.com/en/game-info/champions/"+ch)
						.setImage("https://ddragon.leagueoflegends.com/cdn/8.13.1/img/champion/"+ch+".png");
					return embed;
				}
			}
			return 'This champion does not exist :x:';
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
					return "The role probably does not exist";
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
					p = check2(arr,p);
					return "Permissions of the role "+role+" : ```"+p+"```";
				}
			}
		}
	},

	{
		name: 'guilds',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				let guildList = bot.guilds.array();
				let txt = "";
				let aGuild = [];

				try {
					guildList.forEach(guild => 
						aGuild.push(
							{
								name: guild.name,
								id: guild.id,
								owner: guild.owner
							}
						)
					);
				} catch (err) {
					
				}

				let iPage = Math.round(msg.content.split('guilds ')[1]);
				if(iPage<1 || iPage*10-10>aGuild.length || isNaN(iPage)) iPage = 1
				let iEnd = iPage*10-1;
				let iStart = iPage*10-10;
				let iMaxPage = Math.ceil(aGuild.length/10);
				for(i=iStart; i<iEnd; i++) {
					if(i==aGuild.length) break;
					txt += "-• Guild name: "+aGuild[i].name+"\n\t\tGuild ID: "+aGuild[i].id+"\n\t\tGuild owner: "+aGuild[i].owner+"\n"
				}
				return '```diff\n'+txt+'\nPage '+iPage+'/'+iMaxPage+' | '+aGuild.length+' guilds```';
			}
		}
	},

	{
		name: 'ev',
		description: 'show the result of javascript code',
		usage: 'a!ev {js code}',
		group: 'utility',
		result: (msg) => {
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
			return embed;
		}
	},

	{
		name: 'serv',
		group: 'hidden',
		result: (msg) => {
			if(!(msg.content=="a!serv")) return 'not_find';
			try {
				var a = msg.guild.id;
				return 'You are on `'+msg.guild.name+'` server';
			} catch(err) {
				return 'You are on private message with me';
			}
		}
	},

	{
		name: 'ans',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
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

				return 'Message envoyé à <@'+id+'>';
			}
		}
	},

	{
		name: 'markdown',
		description: 'Show you all markdown possibilities',
		usage: '`a!markdown`',
		group: 'utility',
		result: (msg) => {
			if(!(msg.content=="a!markdown")) return 'not_find';
			send(msg,
				'```*italics*'+(' '.repeat(20))+'_italics_\n**bold**'+(' '.repeat(20))+'__underline__\n~~Strikethrough~~```'
				+'```asciidoc\n= Markdown =\nasciidoc, autohotkey, bash, coffeescript, cpp (C++), cs (C#), css, diff, fix, glsl, ini, json, md (markdown), ml, prolog, py, tex, xl, xml```'
				+'Find all demo on https://gist.github.com/ringmatthew/9f7bbfd102003963f9be7dbcf7d40e51'
			);
		}
	},

	/////////////////////////
	///					  ///
	///		FIREBASE	  ///
	///		COMMANDS	  ///
	///					  ///
	/////////////////////////
			   ///
			   ///
			/////////

	{
		name: 'add',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				if(/a!add \d+ <@(\d+)>/.test(msg.content)) {
					let id = msg.content.replace(/a!add \d+ <@(\d+)>/, '$1');
					let add = msg.content.replace(/a!add (\d+) <@\d+>/, '$1');
					let a = {};
					let defined = false;
					
					DB.profile(id).getUser(function(data) {
							data = data.val();

							if(data==null) {
								send(msg,'this user doesn\'t have an account');
							} else {
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
						}
					},DB.responseTime);
				}
			}
		}
	},

	{
		name: 'remove',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				if(/a!rem \d+ <@(\d+)>/.test(msg.content)) {
					let id = msg.content.replace(/a!remove \d+ <@(\d+)>/, '$1');
					let rem = msg.content.replace(/a!remove (\d+) <@\d+>/, '$1');
					let a = {};
					let defined = false;
					
					DB.profile(id).getUser(function(data) {
						data = data.val();

						if(data==null) {
							send(msg,'this user doesn\'t have an account');
						} else {
							a.id = data.id;
							a.name = data.name;

							DB.profile(id).getData('data', function(data2) {
								data2 = data2.val();
								a.money = parseInt(data2.money);
								a.money -= parseInt(rem);
								defined = true;
							});
						}	
					});

					setTimeout(function() {
						if(defined) {
							DB.profile(id).setData('data/money',a.money);
							send(msg, rem+' gem(s) :gem: removed to `'+a.name+'`');
						}
					},DB.responseTime);
				}
			}
		}
	},

	{
		name : 'set_lang',
		description : 'set your personnal language for the quotes.',
		usage : '`a!set_lang EN/FR/IT/DE/ES/RU/JP/CH`',
		group: 'personal',
		result : (msg) => {
			let languages = ['EN','FR','IT','DE','ES','PT','RU','JP','CH'];
			if(/^(set_lang)\s\w+$/.test(msg.content.split('a!')[1])) {
				let lang = msg.content.split('set_lang ')[1].toUpperCase();

				if(languages.indexOf(lang)<0){
					let txt = '';
					for(let i=0;i<languages.length;i++) {
						txt += '`'+languages[i]+'`,';
					}
					send(msg, 'Languages available : '+txt);
				} else {
					send(msg, 'Your language has been saved ('+lang+') :tongue:');
					DB.setData('choices/lang', lang);
				}
			} else {
				return 'not_find';
			}
		}
	},

	{
		name : 'toss',
		description : 'heads or tails ?\n \tYou win double your bet or you lose your bet',
		usage : '`a!toss` `head / tails` `an integer`,\n\tfor example : a!toss tails 50',
		group: 'game',
		result : (msg) => {
			let n = msg.content.split('toss ')[1];
			let reg = /(heads|tails)\s[0-9]+$/;
			
			if(!reg.test(n)) {
				return 'You need to chose `heads` or `tails` and an integer';
			}
			
			let money = 0;
			let somme = n.match(/\d+/);

			DB.getData('data', function(data) {
				data = data.val();
				money = data.money;
			});

			setTimeout(function(){
				if(money>0 && somme>money) {
					send(msg, 'You can\'t bet greater than gem you have. :scales:');
				} else {

					if(money==0) {
						send(msg, 'Sorry, you can play this game only if you have gems.\n To obtain gems, write a!daily each 12 hours !');
					} else {
						n = n.match(/^(heads|tails)/)[1];
						let r = (Math.round(Math.random()))?
						'heads':'tails';
						let p;
					
						(n==r)?
						p = 'win ':p = 'lose ';
					
						let s = '';
						if(p=='win ') {
							somme *= 2;
							s = ' :gem:';
						} else if(p=='lose ') {
							somme = -somme;
							s = '';
						}

						money += somme;
						if(money < 0) {
							money = 0;
						}
					
						DB.setData('data/money', money);
					
						msg.channel.send('The piece turn on itself').then(message => {
							setTimeout(function() {
								message.edit('The piece turn on itself.');
							}, 500);
							setTimeout(function() {
								message.edit('The piece turn on itself..');
							}, 1000);
							setTimeout(function() {
								message.edit('The piece turn on itself...');
							}, 1500);
							setTimeout(function() {
								message.edit('the piece turns on itself...\n'+r+' ! You '+p+Math.abs(somme)+s+'\nYour gems : ' + money);
							},2000);
						});
					}
				}
			},DB.responseTime);
		}
	},

	{
		name : 'joke',
		description : 'let me tell you a joke...',
		usage : '`a!joke`',
		group: 'game',
		result : (msg) => {
			let refj = firebase.database().ref('jokes');
			 
			let jokes = [];
			refj.on('child_added',function (data) {
				jokes.push(data.val());
  	 		});
		
			setTimeout(function(){
				let r = Math.round(Math.random()*(jokes.length-1));
				let joke = jokes[r];

				let embed = new Discord.RichEmbed()
					.setTitle('Joke')
					.setColor(0xFFE0B2)
					.setDescription(joke);
			
				send(msg, embed);
			},1000);
		}

	},

	{
		name : 'quote',
		description : 'let me tell you a quotation...',
		usage : '`a!quote`',
		group: 'game',
		result : (msg) => {
			let lang = 'EN';
			let quotes = [];

			DB.getData('choices', function(data) {
				data = data.val();
				lang = data.lang;
			});
		
			setTimeout(function(){
			 	let l2 = Math.round(Math.random()*4)+1;
			 	
			 	let refq = firebase.database().ref('quotes/'+lang+'/'+l2);
			 	refq.on('child_added',function(data) {
					quotes.push(data.val());
  	 			});
			 	
			 	setTimeout(function() {
					let quote = quotes[1];
					let embed = new Discord.RichEmbed()
						.setTitle('['+lang+'] by '+quotes[0])
						.setColor(0xFFE0B2)
						.setDescription(quote);

					send(msg, embed);
				},1000);
			},DB.responseTime);
		}
	},

	{
		name : 'note',
		description : 'save something you want to restore another moment. Maximum notes : 10.',
		usage : '`a!note` `your note`',
		group: 'personal',
		result : (msg) => {
			let note = msg.content.split('note ')[1];
			let reg = /\S+/;
			if(!(reg.test(note)) || note===undefined) return 'A note cannot be empty';

			
			let i, c;
			let notes = {};
			DB.getData('notes', function(data) {
				data = data.val();
				notes = data;
				i = Object.keys(notes).length;
				c = 'note'+i;
			});
			msg.channel.send('wait please...').then(message => {
				setTimeout(function() {
					if(i==11) {
						message.edit('Maximum number of notes reached !');
					} else {
						DB.newNote(c, note);
						message.edit('Your note has been saved :inbox_tray::pencil:');
					}
				},DB.responseTime);
			});
		}
	},

	{
		name : 'mynotes',
		description : 'show your personnals note.',
		usage : '`a!mynote`',
		group: 'personal',
		result : (msg) => {
			let notes = {};

			DB.getData('notes', function(data) {
				data = data.val();
				notes = data;
			});

			setTimeout(function() {
				let txt = '';
				let i = Object.keys(notes).length;
				if(i==1) {
					txt = 'You don\'t have any notes 🙃';
				} else {
					txt = ':ledger: **Your personnal note(s) :**\n';
					for(a=1; a<i; a++){
						let n = 'note'+a;
						txt += '\t• '+notes[n]+'\n';
					}
				}
				send(msg, txt);
			},DB.responseTime);
		}
	},

	{
		name : 'clearnote',
		description : 'clear your personnal notes.',
		usage : '`a!clearnote {an integer} (optional)`',
		group: 'personal',
		result : (msg) => {
			let n = msg.content.split('clearnote ')[1];
			let notes = {};
			let l;
			let clear = false;

			if(/\d+/.test(n)) {
				if(n>0 && n<11) {
					let numbers = ['zero', 'one','two','three','four','five','six','seven','height','nine','ten'];
					let number = ':'+numbers[n]+':';
					if(n==10) number = ':keycap_ten:';

					DB.getData('notes', function(data) {
						data = data.val();
						notes = data;
						l = Object.keys(notes).length;
					});

					setTimeout(function() {
						if(l==1) {
							send(msg,'You don\'t have any notes 🙃');
						}

						if((l-1)>=n) {
							clear = true;
							send(msg, ' note '+number+' deleted');
						} else {
							send(msg,'Sorry I can\'t find this note');
						}

						if(clear) {
							let newNotes = {};
							let entry = Object.entries(notes)[n];
							entry = entry[0];
							let c = -1;
							for(i in notes) {
								c++;
								//console.log('C: '+c+' | entry: '+entry+' | =? '+(c==entry));
								if(i==entry) {
									c--;
									continue;
								}
								newNotes['note'+c] = notes[i];
							}

							DB.clearNotes(newNotes);
						}
					},DB.responseTime);

				} else {
					return 'Your integer must be between 1 and 10';
				}
			} else {
				DB.getData('notes', function(data) {
					data = data.val();
					notes = data;
				});

				setTimeout(function() {
					let l = Object.keys(notes).length;
					let newNotes = {
						note0: "**Your notes:**"
					}
					if(l==1) {
						send(msg, 'You don\'t have any notes 🙃');
					} else {
						DB.clearNotes(newNotes);
						send(msg, ':ballot_box_with_check: All notes cleared');
					}
				},DB.responseTime);
			}
		}
	},

	{
		name : 'daily',
		description : 'Obtain daily xp and monay ($200) each 12 hours.',
		usage : '`a!daily`',
		group: 'personal',
		result : (msg) => {
			let Now = Date.now();
			let oDaily = {};
			let daily, money, xp, level, ans;
			let ok = false;

			DB.getData('delay/daily', function(data) {
				daily = data.val();
				if(Now-daily>=43200000) {
					ok = true;
					daily = Now;
				}
				ans = mtsm(43200000-(Now-daily));
			});

			DB.getData('data', function(data) {
				oDaily = data.val();
			});

			setTimeout(function() {
				if(ok) {
					send(msg, 'You received **20xp** and **$200** ! :gem:\nNext daily available in : **'+ans+'** :hourglass_flowing_sand:');
					oDaily.xp += 20;
					oDaily.money += 200;
					while (Math.pow(oDaily.level,2.3)*10<oDaily.xp) {
						oDaily.level++;
					}

					DB.updateData('data', oDaily);
					DB.updateData('delay/daily', daily);
				} else {
					send(msg, 'You need to wait **'+ans+'** for the next daily ! :hourglass:');
				}
			},DB.responseTime);
		}
	},

	{
		name : 'money',
		description : 'show your personal gems.',
		usage : '`a!money`',
		group: 'personal',
		result : (msg) => {
			let money = 0;

			DB.getData('data/money', function(data) {
				money = data.val();
			});

			setTimeout(function() {
				send(msg, 'You currently have '+money+':gem:');
			},DB.responseTime)
		}
	},

	{
		name: 'profile',
		description : 'show a profile',
		usage: '`a!profile`',
		group: 'personal',
		result: (msg) => {
			let iID;
			let sUSER;
			if(msg.content=='a!profile') {
				iID = msg.author.id;
				sUSER = msg.author.username+'#'+msg.author.discriminator;
				avatar = msg.author.avatarURL;
				setTimeout(function() {profile(msg, iID, sUSER, avatar)},500);
			} else {
				iID = msg.content.replace(/a!profile <@!?(\d+)>/,'$1');
				DB.profile(iID).getData('user/name', function(data) {
					data = data.val();
					if(data===null) {
						send(msg, 'This user does not have an account :frowning:');
					} else {
						bot.fetchUser(iID).then(user => {
							sUSER = user.username+'#'+user.discriminator;
							sAVATAR = user.avatarURL;
							profile(msg,iID,sUSER,sAVATAR);
						});
					}
				});
			}
		}
	},

	{
		name: 'level',
		description : 'Show level of a person',
		usage : '`a!level {tag} (optional)`',
		group: 'social',
		result : (msg) => {
			if(msg.content=='a!level') {
				if(avatar===null) avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';
				DB.getData('data', function(data) {
					data = data.val();
					let embed = new Discord.RichEmbed()
						.setColor(0x333333)
						.setAuthor(name, avatar)
						.addField('Level', data.level, true)
						.addField('Exp.', data.xp, true)
						//.setImage('canvas');
					send(msg, embed);
				});
			} else {
				let id = msg.content.replace(/a!level <@!?(\d+)>/,'$1');
				let name, avatar;
				DB.profile(id).getData('user/name', function(data) {
					data = data.val();

					if(data===null) {
						send(msg, 'This user does not have an account :frowning:');
					} else {
						bot.fetchUser(id).then(user => {
							name = user.username+'#'+user.discriminator;
							avatar = user.avatarURL;
							if(avatar===null) avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';

							DB.getData('data', function(data) {
								data = data.val();
								let embed = new Discord.RichEmbed()
									.setColor(0x333333)
									.setAuthor(name, avatar)
									.addField('Level', data.level, true)
									.addField('Exp.', data.xp, true)
									//.setImage('canvas');
								send(msg, embed);
							});
						});
					}
				});
			}
		}
	},

	{
		name : 'return',
		description : 'send a message to Ahri\'s creator.',
		usage : '`a!return` `your message`',
		group: 'utility',
		result : (msg) => {
			let name = msg.author.username+'#'+msg.author.discriminator;
			let authorMSG = msg.content.split('return ')[1];


			if(authorMSG===undefined) return 'Lol, my creator will not read an empty message, don\'t you ? :grimacing::joy:';

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
	},

	{
		name : 'follow',
		description : 'follow someone',
		usage : '`a!follow {user tag}`',
		group: 'social',
		result : (msg) => {
			let target = msg.content.split('follow ')[1];
			let regID = new RegExp('<@!?'+msg.author.id+'>');
			
			let id = msg.author.id;
			
			if(/<@!?\d+>/.test(target)) {
				if(/<@!?433365347463069716>/.test(target) || target == '@Ahri') return 'Thanks but you can\'t follow me :heart:';
				if(regID.test(target)) {
					return 'You can\'t follow you lol';
				}
				
				let id_target = target.replace(/<@!?(\d+)>/,'$1');

				let name;
				DB.profile(id_target).getData('user/name', function(data) {
					name = data.val();
				});

				setTimeout(function() {
					if (name==null) {
						send(msg, 'This user does not have an account');
					} else {
						let followers = {};

						DB.profile(id_target).getData('followers', function(data) {
							followers = data.val();
						});

						setTimeout(function() {
							let aFollowers = Object.entries(followers);
							let l = Object.keys(followers).length-1;
							regID = new RegExp(id);
							let following = false;

							for(i in aFollowers) {
								if(regID.test(aFollowers[i][1])) {
									following = true;
								}
							}

							if(following) {
								send(msg, 'You already are following this person :monkey:');
							} else {
								DB.profile(id_target).addData('followers', l, id);
								send(msg, 'You started following this person :busts_in_silhouette:');
							}
						},DB.responseTime);
					}
				},DB.responseTime);
			} else {
				return 'Need a real tag of someone !';
			}
		}
	},

	{
		name : 'unfollow',
		description : 'unfollow someone',
		usage : '`a!unfollow {user tag}`',
		group: 'social',
		result : (msg) => {
			let target = msg.content.split('unfollow ')[1];
			let regID = new RegExp('<@!?'+msg.author.id+'>');
			let id = msg.author.id;
			
			if(/<@!?\d+>/.test(target)) {
				if(/<@!?433365347463069716>/.test(target) || target == '@Ahri' || regID.test(target)) return 'User not valid';
				
				let id_target = target.replace(/<@!?(\d+)>/,'$1');

				let name;
				DB.profile(id_target).getData('user/name', function(data) {
					name = data.val();
				});

				setTimeout(function() {
					if (name==null) {
						send(msg, 'This user does not have an account');
					} else {
						let followers = {};

						DB.profile(id_target).getData('followers', function(data) {
							followers = data.val();
						});

						setTimeout(function() {
							let aFollowers = Object.entries(followers);
							regID = new RegExp(id);
							let following = false;
							let l;

							for(i in aFollowers) {
								if(regID.test(aFollowers[i][1])) {
									l = i;
									following = true;
								}
							}

							if(following) {
								DB.profile(id_target).deleteData('followers/'+l);
								send(msg, 'You stopped follow this person :no_entry_sign:');
							} else {
								send(msg, 'You never followed this person :thinking:');
							}
						},DB.responseTime);
					}
				},DB.responseTime);
			} else {
				return 'Need a real tag of someone !';
			}
		}
	},

	{
		name : 'give',
		description : 'give gems to a specific user',
		usage : '`a!give {integer} {user}`',
		group: 'social',
		result : (msg) => {
			let r = msg.content.split('give ')[1];
			if(/\d+ <@!?\d+>/.test(r)) {
				let id = msg.author.id;

				let id_target = r.replace(/\d+ <@!?(\d+)>/,'$1').replace(' ', '');
				let give = parseInt(r.replace(/(\d+) <@!?\d+>/,'$1'));
				let money, received;

				if(id_target!=msg.author.id) {
					DB.profile(id).getData('data/money', function(data) {
						money = data.val();
					});

					DB.profile(id_target).getData('data/money', function(data) {
						received = parseInt(data.val());
					});

					setTimeout(function() {
						if(received!==null) {
							if(money>0) {
								if(give>money) {
									send(msg, 'You can\'t give more than you have');
								} else {
									send(msg, 'You gave '+give+' to <@'+id_target+'> :outbox_tray:');
									money -= give;
									received += give;
									DB.profile(id).updateData('data/money', money);
									DB.profile(id_target).updateData('data/money', received);
								}
							} else {
								send(msg, 'You can\'t give gems');
							}
						} else {
							send(msg, 'This user does not have an account');
						}
					},DB.responseTime);
				} else {
					return 'You can\'t give gems to yourself';
				}
			} else {
				return 'You must write how much gems you want to give and for who\nExample: `a!give 10 @user#0000`';
			}
		}
	},

	{
		name : 'rep',
		description : 'give reputation point to a specific user',
		usage : '`a!rep {user}`',
		group: 'social',
		result : (msg) => {
			let message = msg.content;
			let reg = /rep(utation)? <@!?\d+>/;
			let id = msg.author.id;

			if(reg.test(message)) {
				let target;
				if(msg.content.startsWith("reputation")) target = msg.content.split('reputation')[1];
				else target = msg.content.split('rep')[1];
				let id_target = target.replace(/<@!?(\d+)>/,'$1').replace(' ',"");
				let Now = Date.now();
				let repDelay;
				let rep_target;

				DB.profile(id).getData('delay/rep', function(data) {
					repDelay = data.val();
				});

				DB.profile(id_target).getData('data/rep', function(data) {
					rep_target = data.val();
				});

				setTimeout(function() {
					let ans = mtsm(parseInt(Now-repDelay));
					if(id_target==msg.author.id) {
						send(msg, 'You can\'t give reputation point to yourself');
					} else if(rep_target===null) {
						send(msg, 'This user does not have an account');
					} else {
						if(Now-repDelay >= 86400000) {
							repDelay = Now;
							rep_target += 1;

							DB.profile(id).updateData('delay/rep', repDelay);
							DB.profile(id_target).updateData('data/rep', rep_target);

							send(msg, 'You gave **1** reputation point to <@'+id_target+'> :diamond_shape_with_a_dot_inside: ');
						}
						send(msg, 'You need to wait **'+ans+'** to give a new reputation point :hourglass:');
					}
				},DB.responseTime);
			} else {
				send(msg, 'You must to tag a real person');
			}
		},
	},

	{
		name:'top',
		description: 'show the scoreboard of Ahri\'s users (sort by XP)',
		usage: '`a!top` or `a!scoreboard`',
		group: 'social',
		result: (msg) => {
			getTop(msg);
		}
	},
	{
		name:'scoreboard',
		group: 'hidden',
		result: (msg) => {
			getTop(msg);
		}
	},

	{
		name: 'color',
		description: 'Personalize your profile embed color',
		usage: '`a!color #FFFFFF` or `a!color 0xFFFFFF`',
		group: 'personal',
		result: (msg) => {
			let color = msg.content.split('color ')[1];
			if(color===undefined) return 'Not possible to set a color :cry:';
			
			if(/(#|0x)?([a-f0-9A-F]{3}){1,2}/.test(color)) {
				let c = color.replace('#','').replace('0x','');
				if(c.length==3) {
					c = '0x'+c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
				}

				send(msg, 'Color updated ('+c+')');
				DB.updateData('choices/color', c);
			} else {
				return 'color couldn\'t be found.';
			}
		}
	},

	{
		name : 'post',
		description : 'write a post which all your follower will receive in DM from me',
		usage : '`a!post {message}`',
		group: 'social',
		result : (msg) => {
			let reg = /\S/;
			let post = msg.content.split('post ')[1];
			let name = msg.author.username+'#'+msg.author.discriminator;
			let avatar = msg.author.avatarURL;

			if(post==undefined) return 'You must write a message !';
			if(reg.test(post) && post.length>12) {
				let Now = Date.now();
				let date = new Date().toDateString();//+" | "+new Date().getHours+":"+new Date().getMinutes;
				let embed = new Discord.RichEmbed()
					.setTitle('from '+name)
					.setThumbnail(avatar)
					.setColor(0x494C51)
					.setDescription(post)
					.setFooter(date, 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349');
				
				let postDelay, followers;
				DB.getData('delay/post', function(data) {
					postDelay = data.val();
				});

				DB.getData('followers', function(data) {
					followers = data.val();
				});

				setTimeout(function() {
					let ans = mtsm(parseInt(Now-postDelay));
					if(Now-postDelay >= 86400000) {
						postDelay = Now;
						let l = (Object.keys(followers).length)-1;
						followers =  Object.entries(followers);

						if(l>0) {
								for(i in followers) {
									let follower = followers[i][1];	
									try {
										let follower = followers[i][1];		
										bot.users.get(follower).createDM().then(channel => {
											channel.send(embed);
										});
									} catch(error) {
										console.log('Could not send to '+follower);
									}
								}
								DB.updateData('delay/post', postDelay);
								send(msg, 'Your post has been send');
								send(msg, 'You need to wait **'+ans+'** to send another post :hourglass:');
						} else {
							send(msg, 'You don\'t have followers !');
						}
					} else {
						send(msg, 'You need to wait **'+ans+'** to send another post :hourglass:');
					}
				},DB.responseTime);
			} else {
				return 'Post length is too short';
			}
		}
	},

	{
		name : 'reset',
		description : 'reset you password',
		usage : '`a!reset`',
		group: 'hidden',
		result : (msg) => {
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
		name: 'set_desc',
		description: 'set your description',
		usage: '`a!set_desc {your desc`',
		group: 'personal',
		result: (msg) => {
			let desc = msg.content.split('set_desc ')[1];

			if(desc===undefined) return 'You cannot have an empty description';
			if(desc.length<100) {
				DB.updateData('param/desc', desc);
				return 'Description saved';
			} else {
				return 'Your description is too long sorry :cry:';
			}
		}
	},

	{
		name: 'createRole',
		description: 'Create a role',
	  	usage: '`a!createRole {name} {+}` (if you want to add to you)',
	  	group: 'management',
		result: (msg) => {
		   	let id = msg.author.id;
		  	let id_guild = msg.guild.id;
			let perms;		   
			let access = 0;

			checkServer(id_guild, msg.guild.name, msg.guild.ownerID);

			DB.getServerPerms(id_guild+'/permsRole', function(data) {
				perms = data.val();
			})

			msg.channel.send('Checking if you have the permission...').then(message => {
				setTimeout(function() {
					for(i in perms) {
						let role = Object.entries(perms)[i];
						if(msg.guild.members.get(msg.author.id).roles.has(role)) {
							access = 1;
							message.edit('You have the permission...');
						}
					}

					if(access==1 || id==msg.guild.ownerID || admin(id)) {
						let newRole = msg.content.split('createRole ')[1];
						if(newRole===undefined) {
							message.edit('The role cannot be an empty string');
						} else {
							let aNewRole = newRole.split(' ');
							if(aNewRole[aNewRole.length-1]=='+') {
								newRole = '';
								for(i in aNewRole) {
									if(i==aNewRole.length-1) break;
									newRole += aNewRole[i]+' ';
								}

								aNewRole = newRole.toLowerCase();

								let a = 0;
								let roles = msg.guild.roles.map(role => role.name);
								for(i=0; i<roles.length; i++) {
									let ro = roles[i].toLowerCase();
									console.log(ro+(' '.repeat(20-ro.length))+' | '+aNewRole+(' '.repeat(20-aNewRole.length))+' | '+(aNewRole==ro));
									if(aNewRole==ro) a++;
								}

								if(a>0) message.edit('This role already exist !');
								else {
									msg.guild.createRole({
										name: newRole
									});
									
									setTimeout(function() {
										let role = msg.guild.roles.find('name', newRole);
										msg.guild.members.get(id).addRole(role);
									}, 500);
									message.edit('The role has been created and added to you');
								}
							} else {
								let aNewRole = newRole.toLowerCase();
								let a = 0;
								let roles = msg.guild.roles.map(role => role.name);
								for(i=0; i<roles.length; i++) {
									let ro = roles[i].toLowerCase();
									console.log(ro+(' '.repeat(20-ro.length))+' | '+aNewRole+(' '.repeat(20-aNewRole.length))+' | '+(aNewRole==ro));
									if(aNewRole==ro) a++;
								}

								if(a>0) message.edit('This role already exist !');
								else {
									msg.guild.createRole({
										name: newRole
									});
									message.edit('The role has been created');
								}
							}
						}
					} else {
						message.edit('You don\'t have the permission !');
					}
				},DB.responseTime);
			});
		}
	},

	{
		name: 'deleteRole',
		description: 'Delete a role',
	   usage: '`a!deleteRole {name}`',
	   group: 'management',
		result: (msg) => {
		   	let id = msg.author.id;
		  	let id_guild = msg.guild.id;
			let perms;
			let access = 0;
			let delRole = msg.content.split('deleteRole ')[1];
			if(delRole=='@everyone') return 'You cannot delete this role';

			checkServer(id_guild, msg.guild.name, msg.guild.ownerID);

			DB.getServerPerms(id_guild+'/permsRole', function(data) {
				perms = data.val();
			});

			msg.channel.send('Checking if you have the permission...').then(message => { 
				setTimeout(function() {
					for(i in perms) {
						let role = Object.entries(perms)[i][1];
						if(msg.guild.members.get(msg.author.id).roles.has(role)) {
							let access = 1;
							message.edit('You have the permission...');
						}
					}

					if(access || id==msg.guild.ownerID || admin(id)) {
						if(delRole===undefined) {
							message.edit('Target a Role please');
						} else {
							let aNewRole = delRole.toLowerCase();
							let a = 0;
							let roles = msg.guild.roles.map(role => role.name);
							for(i=0; i<roles.length; i++) {
								let ro = roles[i].toLowerCase();
								console.log(ro+(' '.repeat(20-ro.length))+' | '+aNewRole+(' '.repeat(20-aNewRole.length))+' | '+(aNewRole==ro));
								if(aNewRole==ro) a++;
							}

							if(a==0) message.edit('This role does not exist !');
							else {
								try {
									msg.guild.roles.find('name',delRole).delete();
									message.edit('The role has been deleted');
								} catch(error) {
									message.edit('Failed to delete the role');
								}
							}
						}
					} else {
						message.edit('You don\'t have the permission !');
					}
				},DB.responseTime);
			});
		}
	},

	{
		name: 'setPermTo',
 		description: 'give access to some administrator command to a specific role (only for Administrator of the server)',
		usage: '`a!setPermTo {role}`',
		group: 'management',
 		result: (msg) => {
			let id = msg.author.id;
			 
		   	let id_guild = msg.guild.id;
			let perms;
			let role = msg.content.split('setPermTo ')[1];
			
			checkServer(id_guild, msg.guild.name, msg.guild.ownerID);

			DB.server(id_guild).getServerPerms(id_guild+'/permsRole', function(data) {
				perms = data.val();
			});

			if(id!=msg.guild.ownerID && !admin(id)) return 'You don\' have the permission';
			if(role===undefined) return 'Please target a role';

			setTimeout(function() {
				let roles = msg.guild.roles.map(role => role.name);
				let rolesID = msg.guild.roles.map(role => role.id);
				let a = 0;

				for(i in roles) {
					if(role==roles[i]) a=i;
				}

				if(a>0) {
					role = rolesID[a];
					let j = 0;
					for(i in perms) {
						if(perms[i]==role) j++;
					}

					if(j==0) {
						DB.addPerms(id_guild, 'permsRole', Object.keys(perms).length, role);
						send(msg, 'This role have now special permissions');
					} else {
						send(msg, 'This role already has special permissions');
					}
				} else {
					send(msg, 'Cannot find this role');
				}
			},DB.responseTime);
		}
	},

	{
		name: 'remPermTo',
 		description: 'remove access to some administrator command to a specific role (only for Administrator of the server)',
		usage: '`a!remPermTo {role}`',
		group: 'management',
 		result: (msg) => {
			let id = msg.author.id;
			 
		   	let id_guild = msg.guild.id;
			let perms;
			let role = msg.content.split('remPermTo ')[1];
			
			checkServer(id_guild, msg.guild.name, msg.guild.ownerID);

			DB.server(id_guild).getServerPerms(id_guild+'/permsRole', function(data) {
				perms = data.val();
			});

			if(id!=msg.guild.ownerID && !admin(id)) return 'You don\' have the permission';
			if(role===undefined) return 'Please target a role';

			setTimeout(function() {
				let roles = msg.guild.roles.map(role => role.name);
				let rolesID = msg.guild.roles.map(role => role.id);
				let a = 0;

				for(i in roles) {
					if(role==roles[i]) a = i;
				}

				let n;
				for(i in perms) {
					if(rolesID[a]==perms[i]) n = i;
				}

				if(a>0) {
					role = rolesID[a];
					let j = 0;
					for(i in perms) {
						if(perms[i]==role) j++;
					}

					if(j==0) {
						send(msg, 'This role is not already on the list');
					} else {
						send(msg, 'This role no longer has special permissions');
						let newPerms = {};
						let entry = Object.entries(perms)[n];
						entry = entry[0];
						let c = -1;
						for(i in perms) {
							c++;
							console.log('c: '+c+' | entry: '+entry+' | =? '+(c==entry));
							if(i==entry) {
								c--;
								continue;
							}
							newPerms[(c+1)+""] = perms[i];
							dump(msg, newPerms);
						}

						DB.setPerms(id_guild, newPerms);
					}
				} else {
					send(msg, 'Cannot find this role');
				}
			},DB.responseTime);
		}
	},

	{
		name: 'whohasperm',
		description: 'show all roles who have the special permissions',
		usage: '`a!whohasperm`',
		group: 'management',
		result: (msg) => {
			let id_guild = msg.guild.id;
			checkServer(id_guild, msg.guild.name, msg.guild.ownerID);

			let perms;
			DB.server(id_guild).getServerPerms(id_guild+'/permsRole', function(data) {
				perms = data.val();
			});

			setTimeout(function() {
				let rolesName = msg.guild.roles.map(role => role.name);
				let rolesID = msg.guild.roles.map(role => role.id);
				let permID = [];

				for(i in perms) {
					permID[i] = perms[i];
				}

				let permNAME = [];

				for(i in permID) {
					for(j in rolesID) {
						console.log(permID[i]+' | '+rolesID[i]+' | '+(permID[i]==rolesID[j]));
						if(permID[i]==rolesID[j]) permNAME.push(rolesName[j]);
					}
				}

				if(permNAME==[]) permNAME = ['Nobody'];
				console.log(permNAME);
				send(msg, '```\n'+permNAME+'```')
			},DB.responseTime);
		}
	},

	{
		name: 'test',
		group: 'hidden',
		result: (msg) => {
			if(!admin(msg.author.id)) return;
			let txt = "```asciidoc\n= Ahri is back ! =```"
			+ 	"She is faster (1 second less response)\n"
			+	"However, it may have some errors, please use the command\n"
			+	"`a!return Your message` to inform me of your error, and / or improvement.\n"
			+	"The configuration of the database has undergone many changes.\n"
			+	"The next major update is to remove all its commands to leave only the main, and we can add a commands module on its server through a command a!config module.import `module`";
			
			var guildList = bot.guilds.array(); 
			try { 
				guildList.forEach(guild => 
				guild.channels.find('name','general').send(txt));
			} catch (err) { 
				console.log("Could not send message to one server: "+guild.name);
			}
		}
	}
];
// 🏆🌐⚠️☢🥇🥈🥉🏅
module.exports = commands; 