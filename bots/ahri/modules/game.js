let firebase = require('firebase');
let main = require('./../../../bot.js');
let bot = main.bot;
let DB = main.database;
const champ = require('./../../../functions/champions.json');
const Discord = require('discord.js');
const fs = require('fs');
let App = main.app;

// External functions
const admin = require('./../../../functions/admin.js');
const check2 = require('./../../../functions/checktwo.js');
const getTop = require('./../../../functions/gettop.js');
const mtsm = require('./../../../functions/mtsm.js');
const dump = require('./../../../functions/dump.js');
const profile = require('./../../../functions/profile.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}


let game = [
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
		name: 'rps',
		description: 'Play Rock Paper Scissors with me :scissors: lose or win 10 :gem:',
		usage: '`a!rps {weapon}`',
		group: 'game',
		result: (msg) => {
			let weapon = msg.content.split('rps ')[1];
			if(weapon===undefined) return 'Choose a weapon !';

			let weapons = ["rock","paper","scissors"];

			if(weapons.indexOf(weapon)==-1) return '**Rock**, **paper** or **scissors** !';

			weapon = weapon.toLowerCase();
			let iUser;

			if(weapon=='rock') iUser = 0;
			else if(weapon=='paper') iUser = 1;
			else iUser = 2;

			let icons = {
				rock: ':mountain:',
				paper: ':leaves:',
				scissors: ':scissors:'
			}

			let iAhri = Math.round(Math.random()*2);
			let ennemy = weapons[iAhri];
			let result;

			if(iUser<iAhri && ((iUser!=0 && iAhri!=2) || (iUser!=2 && iAhri!=0))) result = 'lose';
			else {
				if(iUser==0 && iAhri==2) result = 'won';
				else if(iUser==2 && iAhri==0) result = 'lose';
				else if(iUser==iAhri) result = 'draw';
				else result = 'won';
			}

			let txt = 'You chose '+weapon+' '+icons[weapon]+'\nI chose '+ennemy;

			if(result=='won') {
				txt += '\nYou '+result+' 10 :gem:';
			} else if(result=='lose') {
				txt += '\nYou '+result+' 10 :gem:';
			}

			send(msg, txt);

			let money;

				DB.getData('data/money', function(data) {
					money = data.val();
					console.log(money);
				});

				setTimeout(function() {
					if(result=='won') {
						money += 10;
					} else if(result=='lose') {
						money -= 10;
					}

					DB.updateData('data/money', money);
				},DB.responseTime);
		}
	},

	{
		name: 'fight',
		description: 'fight a random champion, and win xp and gems. You only lose gems',
		usage: '`a!fight`',
		group: 'game',
		result: (msg) => {
			return 'In development';
		}
	}
];

module.exports = game;