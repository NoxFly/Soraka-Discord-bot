let firebase = require('firebase');
let main = require('./../../../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
let App = main.app;

// External functions
const admin = require('./../../../functions/admin.js');
const checkPerms = require('./../../../functions/checkPerms.js');
const dump = require('./../../../functions/dump.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

let management = [
    {
		name: 'id',
		description : 'display id of the server.',
		usage: 'a!id',
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
		usage: 'a!deleteChannel',
		group: 'management',
		result: (msg) => {
			if(msg.content!="a!deleteChannel") return;
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
		usage: 'a!clearChannel',
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
					p = checkPerms(arr,p);
					send(msg, "Permissions of the role "+role+" : ```"+p+"```");
				}
			}
		}
  }
];

module.exports = management;