let bot = require('../../bot.js');
let firebase = require('firebase');
const Discord = require('discord.js');

var config = {
    apiKey: "AIzaSyCyBzTHpY-FrJPsqAfTdlJaSIa9lQi5EVc",
    authDomain: "ahri-561c5.firebaseapp.com",
    databaseURL: "https://ahri-561c5.firebaseio.com",
    projectId: "ahri-561c5",
    storageBucket: "ahri-561c5.appspot.com",
    messagingSenderId: "90077155476"
};

firebase.initializeApp(config);

/* **** */
let avatar = '';


// Basic - Games - Utility - Personal - Social
// management

// External functions
function randPass() {
	return Math.random().toString(36).slice(-8);
}

function check(msg,ref,id,name) {
	ref = firebase.database().ref('profile/'+id);
	let a = 0;
	ref.on('child_added', function() {
		a++;
	});
	
	setTimeout(function() {
		if(a==0) {
			let username = name;
			let password = randPass();
			let newRef = firebase.database().ref('profile').child(id);
			newRef.set({
				daily: 0,
				followers: {
					test: 'test'
				},
				id: id,
				lang: 'EN',
				level: 1,
				money: 0,
				name: name,
				notes: {
					note: '**your notes :**'
				},
				post: 0,
				rep: {
					repPT: 0,
					repTi: 0
				},
				xp: 0,
				zParam: {
					_reset: 0,
					_resetTime: 0,
					desc: 'A very mysterious person',
					mpAut: 0,
					password: password,
					username: username,
					zAvatar: avatar,
					zBG: 'theme/img/pic.png'
				}
			});
			
			msg.guild.members.get(id).createDM()
				.then(channel => {
					channel.send('• Username: '+username+'\n• Password: '+password+'\nConnect you to http://dorian.thivolle.net/ahri to manage your account.')
					.then(sentMessage => sentMessage.pin());
				});
				
		} else {
			firebase.database().ref('profile/'+id+'/zParam').update({
				zAvatar: avatar
			});
		}
	},2000);
}

function profile(msg,id,name,avatar) {
	let refp = firebase.database().ref('profile/'+id);
	let Actuel = [];

	refp.on('child_added', function(data) {
		Actuel.push(data.val());
	});
	
	try {
		let refF = firebase.database().ref('profile/'+id+'/followers');
		let Actuel2 = [];

		refF.on('child_added', function(data) {
			Actuel2.push(data.val());
		});

		setTimeout(function(){
			msg.channel.stopTyping();
			let money = Actuel[5];
			let xp = Actuel[10];
			let lvl = Actuel[4];
			let lang = Actuel[3];
			let followers = Actuel2.length-1;
			while(Math.pow(lvl,2.3)*10<xp) {
				lvl++;
			}
			
			refp.update({
				level: lvl
			});
			
			let lowN = Math.round(Math.pow(lvl-1,2.3)*10);
			let upN = Math.round(Math.pow(lvl,2.3)*10);
			let mXP = upN-lowN;
			let aXP = xp-lowN;
			let perc = Math.round((aXP*100)/mXP);

			let embed = new Discord.RichEmbed()
				.setAuthor(name+' ('+id+')')
				.setColor(0x494C51)
				.setThumbnail(avatar)
				.addField("Level :",lvl)
				.addField("XP :",xp+'/'+upN+' ('+perc+'% to reach next level)')
				.addField("Money :",money)
				.addField("Followers :",followers)
				.addField("Lang :",lang);
				msg.channel.send(embed);
		},3000);
	} catch(error) {
		msg.channel.send('Sorry, an error occurred, I was unable to view the profile');
	}
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

// *** //

const commands = [
	// finie
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
						return text;
						}
					}
				
				return 'I can\'t help you, the command does not exist 😓';
				
			} else if(/^(help)$/.test(msg.content.split('a!')[1])) {
			
			/* ** */                /* ** */
			
			let txt = '';
			
			let basics = '\n__**Basic :**__\n',
				games = '\n__**Game :**__\n',
				utility = '\n__**Utility :**__\n',
				personal = '\n__**Personal :**__\n',
				social = '\n__**Social :**__\n';
			
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
				}
			}
			
			 txt = basics + '\n' + games + '\n' + utility + '\n'+personal + '\n' + social;
				
			 setTimeout(function() {
			 	msg.author.createDM().then(channel => {
					channel.send(basics);
					channel.send(games);
					channel.send(utility);
					channel.send(personal);
					channel.send(social);
				}); 
			 },1000);
			 
			return 'All commands sent in your DMs';
			
			} else {
				return 'not_find';
			}
		}
	},
	// finie
	{
		name: 'id',
		result: (msg) => {
			if(admin(msg.author.id)) {
				msg.channel.send('server id: '+msg.guild.id).then((msg) => {
					setTimeout(function() {
						msg.delete();
					},5000);
				});
			}
		}
	},
	// pas finie
	{
		name: 'deleteChannel',
		result: (msg) => {
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
	// pas finie
	{
		name: 'add',
		result: (msg) => {
			if(admin(msg.author.id)) {
				if(/a!add \d+ <@(\d+)>/.test(msg.content)) {
					let id = msg.content.replace(/a!add -?\d+ <@(\d+)>/, '$1');
					let add = msg.content.replace(/a!add (-?\d+) <@\d+>/, '$1');
					
					bot.fetchUser(id).then(user => {
						let name = user.username+'#'+user.discriminator;
						let a = 0;
						let us = [];
						let ref = 	firebase.database().ref('profile/'+id);
						ref.on('child_added', function(data) {
							a++;
							us.push(data.val());
						});
						
						setTimeout(function() {
								if(a==0) {
									msg.channel.send('This user does not have an account');
								} else {
									let money = parseInt(us[5]);
									
									money += parseInt(add);
									
									ref.update({
										money: money
									});
									msg.channel.send('money added');
								}
							},1000);
					});
				}
			}
		}
	},
	// pas finie
	/*{
		name: 'reac',
		result: (msg) => {
			msg.channel.send('add your reaction').then(function(msg) {
				msg.react('👍');
				msg.react("👎");
			});
		}
	},*/
	{
		name: 'clearChannel',
		result: (msg) => {
			if(msg.author.id==msg.guild.ownerID || admin(msg.author.id)) {
				msg.channel.fetchMessages().then(function(list) {
					msg.channel.bulkDelete(list);
				}, function(err) {msg.channel.send('Error')});
			}
		}
	},
	// finie
	{
		name : 'set_lang',
		description : 'set your personnal language.',
		usage : '`a!set_lang EN/FR/IT/DE/ES/RU/JP/CH`',
		group: 'personal',
		result : (msg) => {
			let languages = ['EN','FR','IT','DE','ES','PT','RU','JP','CH'];
			if(/^(set_lang)\s\w+$/.test(msg.content.split('a!')[1])) {
			let lang = msg.content.split('set_lang ')[1].toUpperCase();
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
			let refp = firebase.database().ref('profile/'+id);
			msg.channel.startTyping();
			let Actuel = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 		});
  	 		check(msg,refp,id,name);
			
			setTimeout(function(){
				
					let Alang = Actuel[3];
					
					if(languages.indexOf(lang)<0){
						let txt = '';
						for(let i=0;i<languages.length;i++) {
							txt += '`'+languages[i]+'`,';
						}
						msg.channel.stopTyping();
						msg.channel.send('Languages available : '+txt);
					} else {
				
						refp.update({
							lang: lang
						});
						msg.channel.send('Your language has been saved ('+lang+')');
						msg.channel.stopTyping();
					}
				},3000);
				return '';
			} else {
				return 'not_find';
			}
		}
	},
	// finie
	{
		name: 'server',
		description : 'display the informations of the server.',
		usage: '`a!server`',
		group: 'basic',
		result : (msg) => {
			if(/^(server)$/.test(msg.content.split('a!')[1])) {
				
				let Nroles = msg.guild.roles.map(role => role.name);
				let NRoles = Nroles.toString().split(',');
				let roles = '';
				for(i in NRoles) {
					if(i==0) continue;
					roles += NRoles[i]+', ';
				}
				
				let Guild = msg.guild;
				
				let channels = Guild.channels.size;
				channels -= 2;
				
				let online = parseInt(Guild.memberCount-Guild.members.filter(member => member.presence.status === 'offline').size);
				
				let embed = new Discord.RichEmbed()
					.setTitle(Guild.name.toUpperCase()+' information')
					.setThumbnail(Guild.iconURL)
					.setColor(0xDA004E)
					//.addField("ID", '• '+Guild.id)
					.addField("Owner", '• '+Guild.owner.user.tag+'\n• (ID: '+Guild.ownerID+')')
					.addField("Roles", '• '+Guild.roles.size+'\n• '+roles)
					.addField("Members", '• '+Guild.memberCount+'\n• Online : '+online)
					.addField("Channels ", '• '+channels)
					.addField("Region", '• '+Guild.region)
					.addField("Create on ", '• '+Guild.createdAt);

				return embed;
			} else {
				return 'not_find';
			}
		}
	},
	// finie
	{
		name : 'invite',
		description : 'display the invite link of the super bot Ahri.',
		usage : '`a!invite`',
		group: 'basic',
		result : (msg) => {
			if(/^(invite)$/.test(msg.content.split('a!')[1])) {
				let link = 'https://discordapp.com/oauth2/authorize?client_id=%20433365347463069716&scope=bot&permissions=1364720855';
				let embed = new Discord.RichEmbed()
					.setTitle('Ahri\'s link')
					.setThumbnail('https://cdn.discordapp.com/app-icons/433365347463069716/72eed0ac82ac1f947b1a413c4c6c9ad2.png')
					.setColor(0xDA004E)
					.setDescription(link)
					.addField('Note','If my creator doesn\'t have internet, I will not be able to be connected.')
					.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online h24. \n$12 = 1 years hosting.')
					.addField('Link :','https://paypal.me/NoxFly');
				return embed;
			} else {
				return 'not_find';
			}
		}
	},
	// finie
	{
		name : 'loveme',
		description : 'say yes or no.',
		usage : '`a!loveme`',
		group: 'game',
		result : (msg) => {
			if(/^(loveme)$/.test(msg.content.split('a!')[1])) {
				let love = ['yes ❤','no 🤡'];
				return 'My answer is '+love[Math.round(Math.random())];
			} else {
				return 'not_find';
			}
		}
	},
	// finie
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
				let res = (r==n)?'You win':'You lose';
				return 'Your number: '+n+'\nDice result : '+r+'\n'+res;
			} else {
				return 'You must choose a number';
			}
		}
	},
	// finie
	{
		name : 'toss',
		description : 'heads or tails ?\n \tYou win double your bet or you lose your bet',
		usage : '`a!toss` `head / tails` `an integer`,\n\tfor example : a!toss tails 50',
		group: 'game',
		result : (msg) => {
			// heads or tails = pile ou face
			let n = msg.content.split('toss ')[1];
			let reg = /(heads|tails)\s[0-9]+$/;
			
			if(!reg.test(n)) {
				return 'You need to chose heads or tails and an integer';
			}
			
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
			let refp = firebase.database().ref('profile/'+id);
			
			msg.channel.startTyping();
			let Actuel = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 	});
  	 	check(msg,refp,id,name);
		
			setTimeout(function(){
				let money = Actuel[5];
				let somme = n.match(/\d+/);
				if(money>0 && somme>money) {
					msg.channel.send('You can\'t bet greater than money you have. :scales:');
				}
				if(money==0) {
					msg.channel.send('Sorry, you can play this game only if you have money.\n To obtain money, write a!daily each 12 hours !');
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
						s = ' :dollar:';
					} else if(p=='lose ') {
						somme = -somme;
						s = ' :money_with_wings:';
					}

					money += somme;
					if(money < 0) {
						money = 0;
					}
				
					refp.update({
						money: money
					});
				
					msg.channel.send('the piece turns on itself ...\n '+r+' ! You '+p+Math.abs(somme)+s+'\nYour money : ' + money);
				}
			},3000);
			msg.channel.stopTyping();
			return '';
		}
	},
	// finie
	{
		name : 'joke',
		description : 'let me tell you a joke...',
		usage : '`a!joke`',
		group: 'game',
		result : (msg) => {
			
			let refj = firebase.database().ref('jokes');
			
			msg.channel.startTyping();
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
			
				msg.channel.send(embed);
			},1000);
			msg.channel.stopTyping();
			return '';
		}

	},
	// finie
	{
		name : 'quote',
		description : 'let me tell you a quotation...',
		usage : '`a!quote`',
		group: 'game',
		result : (msg) => {
			let lang = 'EN';
			
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
			
			let refp = firebase.database().ref('profile/'+id);
			
			msg.channel.startTyping();
			let quotes = [];
			let Actuel = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
			});
		
			setTimeout(function(){
			 	lang = Actuel[3];
			 	let l2 = Math.round(Math.random()*4)+1;
			 	
			 	let refq = firebase.database().ref('quotes/'+lang+'/'+l2);
			 	refq.on('child_added',function (data) {
					quotes.push(data.val());
  	 			});
			 	
			 	setTimeout(function() {
					let quote = quotes[1];
					let embed = new Discord.RichEmbed()
						.setTitle('['+lang+'] by '+quotes[0])
						.setColor(0xFFE0B2)
						.setDescription(quote);

					msg.channel.send(embed);
				},1000);
			},1000);
			msg.channel.stopTyping();
			return '';
		}

	},
	// PAS finie
	/*
	{
		name : 'eval',
		description : 'gives the result of the requested calculation',
		usage : '`a!eval` `your calculation`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('eval')[1];
			
			// Si il n'y a pas de nombre
			if(!(/\d+/.test(n))) {
				return 'Need a number !';
			}
			
			// verifie niveau de calcul pas haut
			if(/\w+/.test(n)) {
				return 'Sorry I don\'t have hight level in calculation... or you wrote something wrong';
			}
			
			return 'Result : '+eval(n);
		}
	},
	*/
	// finie
	{
		name : 'date',
		description : 'say the current date',
		usage : '`a!date`',
		group: 'utility',
		result : (msg) => {
			let D = new Date();
			let H = D.getHours();
			let M = D.getMinutes();
			let S = D.getSeconds();
			return 'from you it\'s : '+H+':'+M+':'+S;
		}
	},
	// finie
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
	// finie
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
	// PAS finie
	{
		name : 'google',
		/*description : 'search something on google',
		usage : '`a!google` `your search`',
		group: 'utility',*/
		result : (msg) => {
			let reg = /\S/;
			let args = msg.content.split('google')[1];
			if(reg.test(args)) {
				args = args.replace(/\s/,'').replace(/\s+/g,'%20');
				let link = 'http://www.google.fr/search?q='+args;
				let embed = new Discord.RichEmbed()
					.setTitle(link)
					.setColor(0xFFE0B2)
					.setImage(link+'.jpg');

				return embed;
			}
		}
	},
	// finie
	{
		name : 'note',
		description : 'save something you want to restore another moment. Maximum notes : 10.',
		usage : '`a!note` `your note`',
		group: 'personal',
		result : (msg) => {
			let note = msg.content.split('note ')[1];
			let reg = /\S/gi;
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
    	let refp = firebase.database().ref('profile/'+id);
 			let Actuel = [];
 			
			refp.on('child_added',function(data) {
				Actuel.push(data.val());
			});
			check(msg,refp,id,name);
			
			let refn = firebase.database().ref('profile/'+id+'/notes');
			
			let notes = [];
			refn.on('child_added',function(data) {
				notes.push(data.val());
			});
			
			
			setTimeout(function() {
				let i = notes.length;
				let c = 'note'+notes.length;
				if(notes.length<11 && reg.test(note)) {
					refn.child(c).set(note);
    			
					msg.channel.send('Your note has been saved :inbox_tray::pencil:');
				} else {
					let txt = '';
					(reg.test(note))?
					txt = 'Maximum number of notes reached !':
					txt = 'A note cannot be empty';
					msg.channel.send(txt);
				}
			},1000);
			return '';
		}
	},
	// finie
	{
		name : 'mynotes',
		description : 'show your personnals note.',
		usage : '`a!mynote`',
		group: 'personal',
		result : (msg) => {
			let name = msg.author.username+'#'+msg.author.discriminator;
			let defaultMsg = 'You don\'t have any note 🙃';
				
			let id = msg.author.id;
    	let refp = firebase.database().ref('profile/'+id);
 			let Actuel = [];
			refp.on('child_added',function(data) {
				Actuel.push(data.val());
			});
			check(msg,refp,id,name);
			
			let txt = '';
			setTimeout(function() {
				let refn = firebase.database().ref('profile/'+id+'/notes');
			
				let notes = [];
				refn.on('child_added',function(data) {
					notes.push(data.val());
				});
				
				setTimeout(function() {
					if(notes.length==1) {
						txt = 'You don\'t have any notes 🙃';
					} else {
			 			txt = '**Your personnal note(s) :**\n';
						for(let a=1;a<(notes.length);a++){
							txt += '\t• '+notes[a] + '\n';
						}
					}
					msg.channel.send(txt);
				},1000);
			},1000);
		}
	},
	// finie
	{
		name : 'clearnote',
		description : 'clear your personnals notes.',
		usage : '`a!clearnote {an integer} (optional)`',
		group: 'personal',
		result : (msg) => {
			msg.channel.startTyping();
			let n = msg.content.split('clearnote ')[1];
			let name = msg.author.username+'#'+msg.author.discriminator;
			let id = msg.author.id;
			
			let refp = firebase.database().ref('profile/'+id);
			check(msg,refp,id,name);
			
			
			if(/\d+/.test(n)) {
				if(n>0 && n<11) {
					setTimeout(function() {
						let refn = firebase.database().ref('profile/'+id+'/notes');
			
						let notes = [];
						refn.on('child_added',function(data) {
							notes.push(data.val());
						});
				
						setTimeout(function() {
							if(notes.length==1) {
								msg.channel.send('You don\'t have any notes 🙃');
								msg.channel.stopTyping();
							} else {
								if((notes.length-1)>=n) {
									let a = 'note'+n;
									let table = [];
										//firebase.database().ref('profile/'+id+'/notes/'+a).remove();
										
									for(i in notes) {
										if(i==(n) || i==0) continue;
										table.push(notes[i]);
									}
										
									for(i=1;i<notes.length;i++) {
										let b = 'note'+i;
									firebase.database().ref('profile/'+id+'/notes/'+b).remove();
									}
									
									for(i=1;i<table.length+1;i++) {
										let c = 'note'+i;
										refn.child(c).set(table[(i-1)]);
									}
									
									
									msg.channel.send('note '+n+' deleted');
									msg.channel.stopTyping();
								} else {
									msg.channel.send('Sorry I can\'t find this note');
								}
								msg.channel.stopTyping();
							}
						},1000);
					},1000);
					
					msg.channel.stopTyping();
				} else {
					return 'Your integer must be between 1 and 10';
					msg.channel.stopTyping();
				}
			} else {
				setTimeout(function() {
					let refn = firebase.database().ref('profile/'+id+'/notes');
			
					let notes = [];
					refn.on('child_added',function(data) {
						notes.push(data.val());
					});
				
					setTimeout(function() {
						if(notes.length==1) {
							msg.channel.send('You don\'t have any notes 🙃');
							msg.channel.stopTyping();
						} else {
							for(i=1;i<notes.length;i++) {
								let a = 'note'+i;
									firebase.database().ref('profile/'+id+'/notes/'+a).remove();
							}
							msg.channel.send('All notes cleared');
							msg.channel.stopTyping();
						}
					},1000);
				},1000);
			}
			
			return ' ';
		}
	},
	// finie
	{
		name : 'daily',
		description : 'Obtain daily xp and monay ($200) each 12 hours.',
		usage : '`a!daily`',
		group: 'personal',
		result : (msg) => {
			msg.channel.startTyping();
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
    		let refp = firebase.database().ref('profile/'+id);
 			let Actuel = [];
 			
			refp.on('child_added',function(data) {
				Actuel.push(data.val());
			});
			check(msg,refp,id,name);
			
			setTimeout(function() {
				
				let newRef = firebase.database().ref('profile').child(id);
				let Now = Date.now();
				let daily = Actuel[0];
				let money = Actuel[5];
				let xp = Actuel[10];
				let lvl = Actuel[4];
				let ans;
										
				if(Now-daily >= 43200000) {
					daily = Now;
					while (Math.pow(lvl,2.3)*10<xp) {
						lvl++;
					}
													
					newRef.update({
						daily: Now,
						money: parseInt(money+200),
						xp: xp+20,
						level: lvl
					});
												
					msg.channel.send('You received 20xp and $200 ! :dollar:');
				}
									   
				ans = mtsm(43200000-(Now-daily));
				msg.channel.send('Next daily available in : '+ans+' :hourglass:');
				msg.channel.stopTyping();
				return '';
				
			},1000);
		}
	},
	// finie
	{
		name : 'money',
		description : 'show your personal money.',
		usage : '`a!money`',
		group: 'personal',
		result : (msg) => {
			msg.channel.startTyping();
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
			let refp = firebase.database().ref('profile/'+id);
			let Actuel = [];
			
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 		});
			check(msg,refp,id,name);
			
			setTimeout(function(){
  	  			let money = Actuel[5];
				msg.channel.send('You currently have $'+money);
			},3000);
			
			msg.channel.stopTyping();
			return '';
		}
	},
	// finie
	{
		name: 'profile',
		description : 'show your personal profile.',
		usage: '`a!profile`',
		group: 'personal',
		result: (msg) => {
			msg.channel.startTyping();
			let a1; // ID
			let a2; // user#0000
			
			if(msg.content=='a!profile') {
				a1 = msg.author.id;
				a2 = msg.author.username+'#'+msg.author.discriminator;
				avatar = msg.author.avatarURL;
				let refp = firebase.database().ref('profile/'+a1);
				check(msg,refp,a1,a2);
				profile(msg,a1,a2,avatar);

			} else {
				a1 = msg.content.replace(/a!profile <@!?(\d+)>/,'$1');
				ref = firebase.database().ref('profile/'+a1);
				let a = 0;
				ref.on('child_added', function() {
					a++;
				});
	
				setTimeout(function() {
					if(a==0) {
						msg.channel.send('This user have not account :frowning:');
					} else {
						bot.fetchUser(a1).then(user => {
							a2 = user.username+'#'+user.discriminator;
							profile(msg,a1,a2,null);
						});
						//msg.channel.send('this command is under development :tools:');
					}
				},1000);

				
				
				
			}
			
			msg.channel.stopTyping();
			return '';
		}
	},
	// finie
	{
		name : 'return',
		description : 'send a message to Ahri\'s creator.',
		usage : '`a!return` `your message`',
		group: 'utility',
		result : (msg) => {
			let id = msg.author.id;
			let refp = firebase.database().ref('profile/'+id);
			
			let name = msg.author.username+'#'+msg.author.discriminator;
			let authorMSG = msg.content.split('return')[1];
			
			let Actuel = [];
			let Actuel2 = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 	});
  	 	check(msg,refp,id,name);
			
			setTimeout(function() {
				let refA = firebase.database().ref('profile/'+id+'/zParam');
				refA.on('child_added',function (data) {
					Actuel2.push(data.val());
  	 		});
				
				setTimeout(function() {
					let Now = Date.now();
					let mpAut = Actuel2[3];
					
					if(/\S/.test(authorMSG)) {
						if(Now-mpAut >= 85400000) {
							mpAut = Now;
					
							firebase.database()
								.ref('profile/'+id+'/zParam')
								.update({
									mpAut: Now
								});
					
							let embed = new Discord.RichEmbed()
								.setAuthor(name+' ('+msg.author.id+')')
								.setColor(0x007FFF)
								.setThumbnail(msg.author.avatarURL)
								.addField("message :",authorMSG);
				
							bot.users.get('316639200462241792').createDM().then(channel => {
								channel.send(embed);
							});
							msg.channel.send('message sent');
						}

						let ans = mtsm(85400000-(Now-mpAut));
						msg.channel.send('You need to wait '+ans+' to send a message');
					} else {
						msg.channel.send('Lol, my creator will not read an empty message, don\'t you ? :grimacing::joy:');
					}
				},1000);
			},1000);
			return '';
		}
	},
	// finie
	{
		name : 'follow',
		description : 'follow someone',
		usage : '`a!follow {user tag}`',
		group: 'social',
		result : (msg) => {
			msg.channel.startTyping();
			let m = msg.content.substring(9);
			let id = new RegExp('<@!?'+msg.author.id+'>');
			
			let idP = msg.author.id;
			let refp = firebase.database().ref('profile/'+idP);
			let name = msg.author.username+'#'+msg.author.discriminator;
			let Actuel = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 	});
  	 	check(msg,refp,idP,name);
			
			if(/<@!?\d+>/.test(m)) {
				if(/<@!?433365347463069716>/.test(m) || m == '@Ahri') return 'Thanks but you can\'t follow me :heart:';
				if(id.test(m)) {
					return 'You can\'t follow you lol';
				}
				
				let idU = m.replace(/<@!?(\d+)>/,'$1');
				let ref = firebase.database().ref('profile');
				let rep = 'Sorry, the user is not valid, or he doesn\'t have an Ahri\'s account';
				let way = idU.substring(8);
				
				ref.on('child_added',function (data) {
  				data = data.val();
  				res = data.id-idU;
  				
  				
  				if (res==0 || res=="0") {
   					let a = 0, b = 0;
   					let reFer = firebase.database().ref('profile/'+data.id+'/followers');
   
						reFer.on('child_added', function(data) {
   						data = data.val();
  	 					if (data==msg.author.id) {
    						a++;
   						}
						});
						
						setTimeout(function() {
   	 					if (a==0) {
    						
   							reFer.child(way).set(idP);
        
								rep = 'You are following this person';
							} else {
    						rep = 'Already followed';
							}
						},1000);
  				}
				});
				setTimeout(function(){
					msg.channel.send(rep);
				},3000);
			} else {
				return 'Need a real tag of someone !';
			}
			
			msg.channel.stopTyping();
		}
	},
	// finie
	{
		name : 'unfollow',
		description : 'unfollow someone',
		usage : '`a!unfollow {user tag}`',
		group: 'social',
		result : (msg) => {
			msg.channel.startTyping();
			let m = msg.content.substring(11);
			let id = new RegExp('<@!?'+msg.author.id+'>');
			let idP = msg.author.id;
			let refp = firebase.database().ref('profile/'+idP);
			let name = msg.author.username+'#'+msg.author.discriminator;
			let Actuel = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 		});
  	 		check(msg,refp,idP,name);
			
			
			if(/<@!?\d+>/.test(m)) {
				if(/<@!?433365347463069716>/.test(m) || m == '@Ahri') return 'You can\'t follow or unfollow me';
				if(id.test(m)) {
					return 'You can\'t follow or unfollow you lol';
				}
				
				let idU = m.replace(/<@!?(\d+)>/,'$1');
				
				
				let rep = 'Sorry, the user is not valid, or he doesn\'t have an Ahri\'s account';
				let ref = firebase.database().ref('profile/'+idU+'/followers');
				let a = 0;
				ref.on('child_added', function(data) {
    			data = data.val();
    			if(data==msg.author.id) {
        	a++;
    			}
				});
				
				let way = idU.substring(8);
				
				setTimeout(function() {
    			if (a==0) {
       		rep = 'you are not already following him';
    			} else {
       		ref.on('child_added', function(data) {
        		data = data.val();
         		if(data==msg.author.id) {
         			
           	firebase.database().ref('profile/'+idU+'/followers/'+way).remove();
           	rep = 'you unfollowed this person';
         		}
      			});
      		}
				},2000);
				
				setTimeout(function(){
					msg.channel.send(rep);
				},3000);
			}
			msg.channel.stopTyping();
		}
	},
	// PAS finie
	{
		name : 'role',
		description : 'Add or remove to you a role of a server',
		usage : '`a!role {role name}`',
		group: 'management',
		result : (msg) => {
			msg.channel.startTyping();
			let Nroles = msg.guild.roles.map(role => role.name);
			let Iroles = msg.guild.roles.map(role => role.id);
			
			let NRoles = Nroles.toString().split(',');
			let IRoles = Iroles.toString().split(',');
			let txt = '';
			
			if(/roles(list)?/.test(msg.content)) {
				for(i in NRoles) {
					if(i==0) continue;
					txt += NRoles[i]+' ('+IRoles[i]+')\n';
				}
				
				let tt = (NRoles.length)-1;
				let embed = new Discord.RichEmbed()
					.setTitle('List of roles in '+msg.guild.name+' server')
					.setColor(0x007FFF)
					.addField('Total roles : '+tt,txt);
				msg.channel.stopTyping();
				return embed;
				
			} else {
				let add = msg.content.split('role ')[1];
				let roles = msg.guild.roles.map(role => role.name);
				let rolesID = msg.guild.roles.map(role => role.id);
				
				let tableRoles = roles.toString().split(',');
				roleID = rolesID.toString().split(',');
				
				let rID = [];
				let role;

				try {
					if(!(/,/.test(add))) {
						
						role = msg.guild.roles.find('name',add).id;

						if(msg.guild.members.get(msg.author.id).roles.has(role)) {
							msg.guild.members.get(msg.author.id).removeRole(role);
							msg.channel.stopTyping();
							return add+' role unroled'
						}
	
						msg.channel.stopTyping();
						setTimeout(function() {
							if(msg.guild.members.get(msg.author.id).addRole(role)) {
								msg.channel.send(add+' role added');
							} else {
								msg.channel.send('this role cannot be added');
							}
						},500);
					} else {
						
						add = add.split(/ ?, ?/g);
						msg.channel.stopTyping();
						
						role = [];
						txt = "these roles have been added: ";
						let txt2 = "these roles have been removed: ";
						let txt3 = "these roles cannot be added: ";
						let more = "`, ";
						
						for(i=0;i<add.length;i++) {
							
							if(i==add.length-1) more = "`";
							role.push(msg.guild.roles.find('name',add[i]).id);
							if(msg.guild.members.get(msg.author.id).roles.has(role[i])) {
								msg.guild.members.get(msg.author.id).removeRole(role[i]);
								txt2 += "`"+add[i]+more;
							} else {
								msg.guild.members.get(msg.author.id).addRole(role[i]);
								if(msg.guild.members.get(msg.author.id).roles.has(role[i])) {
									txt3 += "`"+add[1]+more;
								}
								txt += "`"+add[i]+more;
							}
						}

						if(txt=="these roles have been added: ") {
							if(txt2=="these roles have been removed: ")	return txt3;
							if(txt3=="these roles cannot be added: ") return txt2;
							return txt2+'\n'+txt3;
							
						}
						if(txt2=="these roles have been removed: ") {
							if(txt=="these roles have been added: ") return txt3;
							if(txt3=="these roles cannot be added: ") return txt;
							return txt+"\n"+txt3;
						}
						return txt+'\n'+txt2+'\n'+txt3;;
					}

				} catch(error) {
					msg.channel.stopTyping();
					for(i in NRoles) {
						if(i==0) continue;
						txt += NRoles[i]+' ('+IRoles[i]+')\n';
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
	// PAS finie
	{
		name : 'yt',
		/*description : 'search on youtube',
		usage : '`a!yt {search}`',
		group: 'utility',*/
		result : (msg) => {
			let r = msg.content.substring(5);
			r = 'https://m.youtube.com/result?q='+r;
			let embed = new Discord.RichEmbed()
					.setTitle(r)
					.setColor(0xFF0000);
			
			return embed;
		}
	},
	// PAS finie
	{
		name : 'give',
		description : 'give money to a specific user',
		usage : '`a!give {integer} {user}`',
		group: 'social',
		result : (msg) => {
			let r = msg.content.substring(7);
			if(/\d+ <@!?\d+>/.test(r)) {
				let id = r.replace(/\d+ <@!?(\d+)>/,'$1');
				let name = msg.author.username+'#'+msg.author.discriminator;
				let autID = msg.author.id;
				let give = r.replace(/(\d+) <@!?\d+>/,'$1');

				if(id!=msg.author.id) {
					//return 'cmd pas finie';
					msg.channel.startTyping();
					let ref = firebase.database().ref('profile/'+autID);
					let ref2 = firebase.database().ref('profile/'+id);
					let a = 0;
					let rec = [];
					ref2.on('child_added', function(data) {
						a++;
						rec.push(data.val());
					});

					check(msg,ref,autID,name);

					let user = [];
					ref.on('child_added', function(data) {
						user.push(data.val());
					});

					setTimeout(function() {
						if(a==0) {
							msg.channel.send('This user doesn\'t have an account');
							msg.channel.stopTyping();
						} else {
							let money = user[5];
							let recMoney = rec[5];
							if(money==0) {
								msg.channel.send('You don\'t have money');
								msg.channel.stopTyping();
							} else {
								if(give>money) {
									msg.channel.send('You can\'t send more than you have');
									msg.channel.stopTyping();
								} else {
									ref2.update({
										money: parseInt(recMoney+give)
									});
									ref.update({
										money: parseInt(money-give)
									});
									msg.channel.send('You gave '+give+' :dollar: to <@'+id+'>');
									msg.channel.stopTyping();
								}
							}
						}
					},1000);
				} else {
					return 'You can\'t give money to yourself';
					msg.channel.stopTyping();
				}
			} else {
				return 'You must write how much money you want to give and for who\nExample: `a!give 10 @user#0000`';
			}
		}
	},
	// finie
	{
		name : 'donate',
		description : 'show you the link of my Paypal. The goal is to be host in a VPS to be online h24. Even $1 is enought',
		usage : '`a!donate`',
		group: 'social',
		result : (msg) => {
			let r = msg.content.substring(8);
			if(r=='') {
				let embed = new Discord.RichEmbed()
					.setTitle('My paypal :')
					.setColor(0x007FFF)
					.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online h24. \n$12 = 1 year')
					.addField('Link :','https://paypal.me/NoxFly');
				return embed;
			}
		}
	},
	// finie
	{
		name : 'rep',
		description : 'give reputation point to a specific user',
		usage : '`a!rep {user}`',
		group: 'social',
		result : (msg) => {
			let r = msg.content;
			msg.channel.startTyping();
			let reg = /rep(utation)? <@!?\d+>/;
			
			if(reg.test(r)) {
				// Actuel[9];
				let u2 = msg.content.substring(6);
				let id = msg.author.id;
				let id2 = u2.replace(/<@!?(\d+)>/,'$1');
				let ref = firebase.database().ref('profile');
				let a = 0;
				ref.on('child_added', function(data) {
					data = data.val();
					if(data.id==id2) {
						a++;
					}
  	 			});
  	 		
				
				let refp = firebase.database().ref('profile/'+id);
				let refR = firebase.database().ref('profile/'+id+'/rep');
				let name = msg.author.username+'#'+msg.author.discriminator;
				let Actuel = [];
				refp.on('child_added', function(data) {
					Actuel.push(data.val());
  	 			});
  	 			check(msg,refp,id,name);
				
				let Now = Date.now();
				
				setTimeout(function() {
					if(a==0) {
						msg.channel.send('Tag a valid user, who already have an Ahri\'s account');
						msg.channel.stopTyping();
					} else {
						let Actuel2 = [];
						refR.on('child_added', function(data) {
							Actuel2.push(data.val());
						});
					
						setTimeout(function() {
							let repTi = Actuel2[1],
								repPT = Actuel[0];
							
							let ans = mtsm(parseInt(Now-repTi));
					
							if(Now-repTi >= 86400000) {
							
								refR.update({
									repTi: Now
								});
									
								msg.channel.send('You give a reputation point to '+u2+' !');
								msg.channel.stopTyping();
								let Actuel3 = [];	
								firebase.database().ref('profile/'+id2+'/rep').on('child_added', function(data) {
									Actuel3.push(data.val());
								});
								
								setTimeout(function() {
									let pt = Actuel3[0];
									pt++;
									firebase.database().ref('profile/'+id2+'/rep').update({
										repPT:pt
									});
								},1000);
								
							} else {
								msg.channel.send('You need to wait '+ans+' before give a reputation point');
								msg.channel.stopTyping();
							}
						},1000);
					}
				},1000);
			} else {
				msg.channel.stopTyping();
				return 'You need to tag someone';
			}
		}
	},
	// finie
	{
		name : 'post',
		description : 'write a post which all your follower will receive in DM from me',
		usage : '`a!post {message}`',
		group: 'social',
		result : (msg) => {
			msg.channel.startTyping();
			let reg = /\S/;
			let post = msg.content.substring(7);
			let user = msg.author.username+'#'+msg.author.discriminator;
			
			
			if(reg.test(post) && post.length>6) {
				let Now = Date.now();
				let embed = new Discord.RichEmbed()
					.setTitle('from '+user)
					.setColor(0x494C51)
					.setDescription(post);
				
				let id = msg.author.id;
				let refp = firebase.database().ref('profile/'+id);
				let name = msg.author.username+'#'+msg.author.discriminator;
				let Actuel = [];
				refp.on('child_added', function(data) {
					Actuel.push(data.val());
  	 		});
  	 		check(msg,refp,id,name);
  	 		
  	 		setTimeout(function() {
  	 			let postD = Actuel[8];
  	 			
  	 			let ans = mtsm(parseInt(Now-postD));
  	 			
  	 			if(Now-postD >= 86400000) {
  	 				
  	 				refp.update({
  	 					post: Now
  	 				});
  	 				
  	 				let refF = firebase.database().ref('profile/'+id+'/followers');
  	 				let Actuel2 = [];
						refF.on('child_added', function(data) {
							Actuel2.push(data.val());
  	 				});
  	 			
  	 				Actuel2 = Actuel2.slice(0,-1);
  	 				if(Actuel2.length>0) {
  	 					setTimeout(function() {
  	 						for(i in Actuel2) {
								   let fol = Actuel2[i];			
								   bot.users.get(Actuel2[i]).createDM().then(channel => {
										channel.send(embed);
									});
							
								}
								msg.channel.stopTyping();
								msg.channel.send('Your post has been send\nYou need to wait '+ans+' to send another post :hourglass:');
  	 					},1000);
  	 				} else {
  	 					msg.channel.stopTyping();
  	 					msg.channel.send('You don\'t have followers !');
  	 				}
  	 			} else {
  	 				msg.channel.stopTyping();
  	 				msg.channel.send('You need to wait '+ans+' to send another post');
  	 			}
  	 		},1000);
				
			} else {
				msg.channel.stopTyping();
				return 'Post length too short';
			}
		}
	},
	// finie
	{
		name : 'reset',
		description : 'reset you password',
		usage : '`a!reset`',
		group: '',
		result : (msg) => {
			let id = msg.author.id;
			let name = msg.author.username+'#'+msg.author.discriminator;
			let refp = firebase.database().ref('profile');
  	 	check(msg,refp,id,name);
  	 	
  	 	let Actuel = [];
  	 	setTimeout(function() {
  	 		let ref = firebase.database().ref('profile/'+id+'/zParam');
  	 		ref.on('child_added',function (data) {
					Actuel.push(data.val());
  	 		});
  	 		
  	 		setTimeout(function() {
  	 			let time = Actuel[1];
  	 			let possible = Actuel[0];
  	 			name = Actuel[5];
  	 			let Now = Date.now();
  	 			
  	 			if(possible==1) {
  	 				let pass = randPass();
  	 				ref.update({
  	 					password: pass,
  	 					_reset: 0,
  	 					_resetTime: Now
  	 				});
  	 				msg.author.createDM().then(channel => {
							channel.send('• Username: '+name+'\n• Password: '+pass+'\nConnect you to dorian.thivolle.net/ahri to manage your account.').then(sentMessage => sentMessage.pin());
						});
						
  	 			} else {
  	 				msg.channel.send('You need to reclick on `reset` button because the time is over.\nhttps://dorian.thivolle.net/ahri');
  	 			}
  	 			
  	 		},1000);
  	 	},1000);
		}
	},
	/*
 	{
		name : 'nick',
		description : 'set you a nickname on this server',
		usage : '`a!nick {nickname}`',
		group: 'personal',
		result : (msg) => {
 			let nick = msg.content.split('nick ')[1];
 			let user = msg.author.id;
 			
 			if(nick!='' && nick!=' ' && nick!=undefined && nick!=null) {
 				msg.guild.members.get(msg.author.id).setNickname(nick);
 				return 'Your nickname has been changed';
 			} else {
 				return 'Your nickname cannot be empty';
 			}
 		}
 	},
	 */
	// finie
 	{
 		name: 'ping',
 		description: 'Show the ms you have between when you send message and my reaction',
 		usage: 'a!ping',
 		group: 'utility',
 		result: (msg) => {
 			msg.channel.send("pong !\n*"+((msg.createdTimestamp-Date.now())-1300)+" ms*");
 		}
 	},
 	// PAS finie
 	{
 		name: 'createRole',
 		description: 'Create a role (only Administrator of the server)',
 		usage: 'a!createRole {name} {+} (if you want to add to you)',
 		result: (msg) => {
 			let id = msg.author.id;
 			
 			if(id==msg.guild.ownerID || admin(id)) {
 				let r = msg.content.split('createRole ')[1];
 				let reg = /\S/;
 				r = r.split(' ');
 			
 				if(reg.test(r)) {
 					msg.guild.createRole({
 						name: r[0]
 					});
 					
 					let res = "";
 					if(r[1]=="+") {
 						setTimeout(function() {
 							res = "and added to you";
 							let role = msg.guild.roles.find('name',r[0]);
 							msg.guild.members.get(id).addRole(role);
 						},500);
 					}
 					setTimeout(function() {
 						msg.channel.send("the role `"+r+"` has been created "+res);
 					},600);
 				}
 			} else {
 				return "you don't have the permission :x:";
 			}
 		}
 	},
 	// PAS finie
 	{
 		name: 'deleteRole',
 		description: 'Create a role (only Administrator of the server)',
 		usage: 'a!createRole {name} {+} (if you want to add to you)',
 		result: (msg) => {
 			let id = msg.author.id;
 			
 			if(id==msg.guild.ownerID) {
 				let r = msg.content.split('deleteRole ')[1];
 				let reg = /\S/;
 				if(reg.test(r)) {
 					msg.guild.roles.find('name',r).delete();
 					return 'role `'+r+'` removed';
 				}
 				
 			}
 		}
 	},
 	// PAS finie
 	{
 		name: 'setPermTo',
 		description: 'Set `createRole` command accessible to member of role you want (only for Administrator of the server)',
 		usage: 'a!setPermTo {role}',
 		result: (msg) => {

 			let ref = firebase.database().ref('servers/'+msg.guild.id);
			let ref2 = firebase.database().ref('servers/'+msg.guild.id+'/permRole');

			let role = msg.content.split('setPermTo ')[1];
			
			let perm = [];
 			let a = 0;
 			ref.on('child_added', function(data) {
				a++;
			});

			ref2.on('child_added', function(data) {
				perm.push(data.val());
			});
			
			setTimeout(function() {
				if(a==0) {
					ref.set({
						id: msg.guild.id,
						name: msg.guild.name,
						permRole: {
							1: msg.guild.ownerID
						}
					});
					perm.push(msg.channel.ownerID);
				}

				/*let j = 0;
				for(i=0; i<perm.length; i++) {
					if(msg.author.id==perm[i]) {
						j++;
					}
				}*/

				if(msg.author.id!=msg.guild.ownerID) {
					msg.channel.send('You\'re not allowed to use this command');
				} else {
					if(role==" " || role=="") {
						msg.channel.send('you need to target a role');
					} else {
						try {
							let fRole = msg.guild.roles.find('name',role).id;
							ref2.child(perm.length+1).set(fRole);
							msg.channel.send('This role can now create or delete roles');
						} catch(error) {
							msg.channel.send('An error occured. The role you wrote probably does not exist');
						}
					}
				}
			},1000);
 		}
	 },
	 // PAS finie
	 {
		name: 'remPermTo',
		description: 'Set `createRole` command unaccessible to member of role you want (only for Administrator of the server)',
		usage: 'a!setPermTo {role}',
		result: (msg) => {

			let ref = firebase.database().ref('servers/'+msg.guild.id);
		   	let ref2 = firebase.database().ref('servers/'+msg.guild.id+'/permRole');

		   	let role = msg.content.split('setPermTo ')[1];
		   
		   	let perm = [];
			let a = 0;
			ref.on('child_added', function(data) {
			   a++;
		   	});

		   	ref2.on('child_added', function(data) {
			   	perm.push(data.val());
		   	});
		   
		   	setTimeout(function() {
			   	if(a==0) {
				   	ref.set({
					   	id: msg.guild.id,
					   	name: msg.guild.name,
					   	permRole: {
						   	1: msg.guild.ownerID
					  	}
				   	});
				   perm.push(msg.channel.ownerID);
				}

			   	if(msg.author.id!=msg.guild.ownerID) {
				   	msg.channel.send('You\'re not allowed to use this command');
			   	} else {
					if(role==" " || role=="") {
						msg.channel.send('you need to target a role');
					} else {
					   if(role==msg.guild.ownerID) {
							msg.channel.send('You can\'t do that');
						} else {
							try {
								let fRole = msg.guild.roles.find('name',role).id;
								msg.channel.send(fRole);
								let i = 0;
								/*for(i; i<perm.length; i++) {
									if(perm[i]==role) break;
								}
								msg.channel.send(i);*/
								msg.channel.send('This role now can\'t create or delete roles');
							} catch(error) {
								msg.channel.send('An error occured. The role you wrote probably does not exist');
							}
					   	}
				   	}
			   	}
		   },1000);
		}
	},
	// PAS finie
	{
		name: 'my',
		description: 'Show information you want',
		usage: 'a!my {setting}',
		group: 'personal',
		result: (msg) => {
			let sett = msg.content.split("my ")[1];
			
			if(sett=="pic" || sett=="picture") {
				console.log(msg.author.avatarURL);
				if(msg.author.avatarURL!=null) {
					return msg.author.avatarURL;
				} else {
					return 'You don\'t have profile picture';
				}
			} else if(sett=="id") {
				return msg.author.id;
			} else if(sett=="name" || sett=="username") {
				return msg.author.username+'#'+msg.author.discriminator;
			} /*else if(sett=="bot") {
				return msg.author.bot;
			}*/
		}
	}, {
		name: 'mute',
		description: 'mute someone',
		usage: 'a!mute user#0000',
		group: 'basic',
		result: (msg) => {
			let user = msg.content.split('mute ')[1];
			user = user.replace(/<@!?(\d+)>/,'$1');
			
			if(admin(msg.author.id)) {
				module.exports.run = async(bot,msg,args) => {
					let muteRole = msg.guild.roles.find('name',"muted");

					if(!muteRole) {
						try {
							muteRole = await msg.guild.createRole({
								name: "muted",
								color: "#000000",
								permissions: []
							});

							msg.guild.channels.forEach(async(channel, id) => {
								await channel.overwritePermission(muteRole, {
									SEND_MESSAGES: false,
									ADD_REACTIONS: false
								});
							msg.channel.send('Ok chef, jlai mute ce batard, on verra dans le temps');
							});
						} catch(error) {
							console.log(error.stack);
						}
					}
				}
			}
		}
	}
];

module.exports = commands; 