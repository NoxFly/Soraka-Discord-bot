let firebase = require('firebase');
let main = require('./../../../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
const fs = require('fs');
let App = main.app;

// External functions
const getTop = require('./../../../functions/gettop.js');
const mtsm = require('./../../../functions/mtsm.js');

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
		result : (msg, args) => {
			if(args.length!=1) return;
			let target = args[0];
			let regID = new RegExp('<@!?'+msg.author.id+'>');
			
			let id = msg.author.id;
			
			if(/<@!?\d+>/.test(target)) {
				if(/<@!?433365347463069716>/.test(target) || target == '@Ahri') send(msg, 'Thanks but you can\'t follow me :heart:');
				if(regID.test(target)) {
					send(msg, 'You can\'t follow yourself lol');
				}
				
				let id_target = target.replace(/(\s+)?<@!?(\d+)>/,'$2');

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
				send(msg, 'Need a real tag of someone !');
			}
		}
	},

	{
		name : 'unfollow',
		description : 'unfollow someone',
		usage : '`a!unfollow {user tag}`',
		group: 'social',
		result : (msg, args) => {
			if(args.length!=1) return;
			let target = args[0];
			let regID = new RegExp('<@!?'+msg.author.id+'>');
			let id = msg.author.id;
			
			if(/<@!?\d+>/.test(target)) {
				if(/<@!?433365347463069716>/.test(target) || target == '@Ahri' || regID.test(target)) send(msg, 'User not valid');
				
				let id_target = target.replace(/(\s+)?<@!?(\d+)>/,'$2');

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
								send(msg, 'You stopped follwing this person :no_entry_sign:');
							} else {
								send(msg, 'You never followed this person :thinking:');
							}
						},DB.responseTime);
					}
				},DB.responseTime);
			} else {
				send(msg, 'Need a real tag of someone !');
			}
		}
	},

	{
		name : 'give',
		description : 'give gems to a specific user',
		usage : '`a!give {integer} {user}`',
		group: 'social',
		result : (msg, args) => {
			if(args.length!=2) return;
			let r = args.join(" ");
			if(/\d+ <@!?\d+>/.test(r)) {
				let id_target = args[1].replace(/<@!?(\d+)>/,"$1"),
					give = args[0],
					id = msg.author.id,
					money,
					received;
				if(give<1) {
					send(msg, 'You must give more than 0 !');
					return;
				}

				if(id_target!=msg.author.id) {
					DB.profile(id).getData('data/money', function(data) {
						money = data.val();
					});

					DB.profile(id_target).getData('data/money', function(data) {
						received = data.val();
						console.log(data.val())
					});

					setTimeout(function() {
						if(/^\d+$/.test(received)) {
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
					send(msg, 'You can\'t give gems to yourself');
				}
			} else {
				send(msg, 'You must write how much gems you want to give and for who\nExample: `a!give 10 @user#0000`');
			}
		}
	},

	{
		name : 'rep',
		description : 'give reputation point to a specific user',
		usage : '`a!rep {user}`',
		group: 'social',
		result : (msg, args) => {
			if(args.length!=1) return;
			let message = msg.content;
			let reg = /<@!?\d+>/;
			let id = msg.author.id;

			if(reg.test(args[0])) {
				let target;
				let id_target = args[0].replace(/<@!?(\d+)>/,'$1');
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
						send(msg, 'it\'s been **'+ans+'** since you give a reputation point\nYou need to wait **24 hours** to give another point :hourglass:');
					}
				},DB.responseTime);
			} else {
				send(msg, 'You must to mention a user');
			}
		},
	},

	{
		name:'top',
		description: 'show the scoreboard of Ahri\'s users (sort by XP)',
		usage: 'a!top',
		group: 'social',
		result: (msg, args) => {
			getTop(msg, args);
		}
	},
	{
		name:'scoreboard',
		description: 'show the scoreboard of Ahri\'s users (sort by XP)',
		usage: 'a!scoreboard',
		group: 'social',
		result: (msg, args) => {
			getTop(msg, args);
		}
    },
    
    {
		name : 'post',
		description : 'write a post which all your follower will receive in DM from me',
		usage : '`a!post {message}`',
		group: 'social',
		result : (msg, args) => {
			if(args.length==0) send(msg, 'You must write a message !');
			let reg = /\S/;
			let post = args.join(" ");
			let name = msg.author.username+'#'+msg.author.discriminator;
			let avatar = msg.author.avatarURL;

			if(reg.test(post) && post.length>6) {
				let Now = Date.now();
				let date = new Date().toDateString();
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
								try {
									let follower = followers[i][1];		
									bot.users.get(follower).send(embed);
								} catch(error) {
									console.log('Could not send to one follower : '+i);
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
				send(msg, 'Post length is too short');
			}
		}
	},
];

module.exports = social;