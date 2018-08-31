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

let social = [
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
				
				let id_target = target.replace(/\s+<@!?(\d+)>/,'$1');

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
				
				let id_target = target.replace(/\s+<@!?(\d+)>/,'$1');

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

				let id_target = r.replace(/\d+\s+<@!?(\d+)>/,'$1').replace(' ', '');
				let give = parseInt(r.replace(/(\d+)\s+<@!?\d+>/,'$1'));
				if(give<1) return 'You must give more than 0 !';
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
				let id_target = target.replace(/\s+<@!?(\d+)>/,'$1').replace(' ',"");
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
		usage: '`a!top`',
		group: 'social',
		result: (msg) => {
			if(!(msg.content=="a!top")) return 'not_find';
			getTop(msg);
		}
	},
	{
		name:'scoreboard',
		description: 'show the scoreboard of Ahri\'s users (sort by XP)',
		usage: '`a!scoreboard`',
		group: 'social',
		result: (msg) => {
			if(!(msg.content=="a!scroreboard")) return 'not_find';
			getTop(msg);
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
			if(reg.test(post) && post.length>6) {
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
					if(Now-postDelay >= 7200000) {
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
						send(msg, 'it\'s been **'+ans+'** since you posted\nYou need to wait **2 hours** to send another post :hourglass:');
					}
				},DB.responseTime);
			} else {
				return 'Post length is too short';
			}
		}
	},
];

module.exports = social;