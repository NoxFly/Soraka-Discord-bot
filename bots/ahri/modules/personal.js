let firebase = require('firebase');
let main = require('./../../../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
const fs = require('fs');
let App = main.app;

// External functions
const admin = require('./../../../functions/admin.js');
const checkPerms = require('./../../../functions/checkPerms.js');
const getTop = require('./../../../functions/gettop.js');
const mtsm = require('./../../../functions/mtsm.js');
const dump = require('./../../../functions/dump.js');
const profile = require('./../../../functions/profile.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

let personal = [
  {
		name : 'lang',
		description : 'set your personnal language for the quotes.',
		usage : '`a!lang EN/FR/IT/DE/ES/RU/JP/CH`',
		group: 'personal',
		result : (msg, args) => {
			let languages = ['EN','FR','IT','DE','ES','PT','RU','JP','CH'];
			if(args.length==1) {
				let lang = args[0].toUpperCase();

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
			}
		}
  },
    
  {
		name : 'note',
		description : 'save something you want to restore another moment. Maximum notes : 10.',
		usage : '`a!note` `your note`',
		group: 'personal',
		result : (msg, args) => {
			let note = args.join(" ");
			if(args.length==0) send(msg, 'A note cannot be empty');

			
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
		usage: 'a!mynote',
		group: 'personal',
		result : (msg) => {
			if(msg.content!="a!mynotes") return;
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
		result : (msg, args) => {
			let n = args[0];
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
					send(msg, 'Your integer must be between 1 and 10');
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
		description : 'Obtain daily xp and money (200 gems and 20xp) each 12 hours.',
		usage: 'a!daily',
		group: 'personal',
		result : (msg) => {
			if(!(msg.content=="a!daily")) return;
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
					send(msg, 'You received **20xp** and **200**:gem: !\nNext daily available in : **'+ans+'** :hourglass_flowing_sand:');
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
		usage: 'a!money',
		group: 'personal',
		result : (msg) => {
			if(!(msg.content=="a!money")) return;
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
		usage: 'a!profile',
		group: 'personal',
		result: (msg, args) => {
			let iID;
			let sUSER;
			if(msg.content=='a!profile') {
				iID = msg.author.id;
				sUSER = msg.author.username+'#'+msg.author.discriminator;
				avatar = msg.author.avatarURL;
				setTimeout(function() {profile(msg, iID, sUSER, avatar)},500);
			} else if(args.length==1) {
				iID = args[0].replace(/<@!?(\d+)>/,'$1');
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
		group: 'personal',
		result : (msg, args) => {
			let avatar = msg.author.avatarURL;
			let name = msg.author.username+'#'+msg.author.discriminator;
			
			if(msg.content=='a!level') {
				if(avatar===null) avatar = 'https://vignette.wikia.nocookie.net/vsbattles/images/5/56/Discord-Logo.png/revision/latest?cb=20180506140349';
				DB.getData('data', function(data) {
					data = data.val();
					let embed = new Discord.RichEmbed()
						.setColor(0x333333)
						.setAuthor(name, avatar)
						.addField('Level', data.level, true)
						.addField('Exp.', data.xp, true);
					send(msg, embed);
				});
			} else if(args.length==1) {
				let id = args[0].replace(/<@!?(\d+)>/,'$1');
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
		name: 'color',
		description: 'Personalize your profile embed color',
		usage: '`a!color #FFFFFF` or `a!color 0xFFFFFF`',
		group: 'personal',
		result: (msg, args) => {
			if(args.length==0) send(msg, 'Not possible to set a color :cry:');
			let color = args[0];
			
			if(/(#|0x)?([a-f0-9A-F]{3}){1,2}/.test(color)) {
				let c = color.replace(/#|0x/,'');
				if(c.length==3) {
					c = '0x'+c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
				} else {
					c = '0x'+c;
				}
				
				let embed = new Discord.RichEmbed()
					.setColor(c)
					.setDescription('Color updated ('+c+')');
				send(msg, embed);
				DB.updateData('choices/color', c);
			} else {
				send(msg, 'color couldn\'t be found.');
			}
		}
  },
    
  {
		name: 'desc',
		description: 'set your description',
		usage: '`a!desc {your description}`',
		group: 'personal',
		result: (msg, args) => {
			if(args.length==0) return;
			let desc = args.join(" ");

			if(desc.length<26) {
				DB.updateData('param/desc', desc);
				send(msg, 'Description saved');
			} else {
				send(msg, 'Your description is too long sorry :cry: (26 char max)');
			}
		}
	}
];

module.exports = personal;