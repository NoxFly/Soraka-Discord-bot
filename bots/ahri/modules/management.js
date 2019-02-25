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
				let a = 3, i;
				msg.channel.send('This channel will be delete in '+a).then((msg) => {
					i = setInterval(function() {
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
			if(msg.content!="a!clearChannel") send(msg, "There is no need for argument");
			if(msg.author.id==msg.guild.ownerID || admin(msg.author.id)) {
				msg.channel.fetchMessages().then(function(list) {
					msg.channel.bulkDelete(list);
				}, function(error) {send(msg,'Error')});
			}
    }
  },
    
  {
		name : 'role',
		description : 'Add or remove to you a role of a server.',
		usage : 'a!role {role}',
		group: 'management',
		result : (msg, args) => {
			let Nroles = (msg.guild.roles.map(role => role.name)).toString().split(","),
				txt = '',
				tt = 0,
				embed; add, roles, rolesID, roleID, role, a, r, aRole, regRole;
			
			tt = Nroles.length-1;
			
			if(msg.content=="role" || msg.content=="roles") {
				for(i in Nroles) {
					if(i>0) txt += Nroles[i]+'\n';
				}
				
				tt = (Nroles.length)-1;
				embed = new Discord.RichEmbed()
					.setTitle('List of roles in '+msg.guild.name+' server')
					.setColor(0x007FFF)
					.addField('Total roles : '+tt,txt);
				 
				send(msg, embed);
			} else if(args.length>0) {
				add = args.join(" ");
				roles = msg.guild.roles.map(role => role.name);
				role;

				try {
					if(!(/,/.test(add))) {
						a = 0;
						aRole;
						regRole = new RegExp(add.toLowerCase());

						for(i=1; i<roles.length; i++) {
							r = roles[i].toLowerCase();
							if(regRole.test(r)) {
								aRole = roles[i];
								role = msg.guild.roles.find('name',roles[i]).id;
								a++;
							}
						}

						if(a==0) {
							send(msg, 'The role doesn\'t exist');
						} else if(msg.guild.members.get(msg.author.id).roles.has(role)) {
							msg.guild.members.get(msg.author.id).removeRole(role);
							setTimeout(function() {
								if(!msg.guild.members.get(msg.author.id).roles.has(role)) {
									send(msg,aRole+' role removed');
								} else {
									send(msg,'this role cannot be removed :thinking:');
								}
							}, 1000);
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
					for(i in Nroles) {
						if(i==0) continue;
						txt += Nroles[i]+'\n';
					}
					
					let tt = (Nroles.length)-1;
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
		usage: 'a!perm role_name',
		group: 'management',
		result: (msg) => {
			if(admin(msg.author.id)) {
				let role = msg.content.split('perm ')[1];
				let id = msg.guild.roles.find('name', role);
				
				if(id==null) send(msg, "The role probably does not exist");
				else {
					let perm = msg.guild.roles.find('name',role).permissions,
						x = 100,
						arr = [],
						p = "";
					let a = perm;
					while(a>0){
						var b = a - Math.pow(2,x);
						if(parseInt(b) == (b) && b>=0){
							a -= Math.pow(2,x);
							arr.push(Math.pow(2,x));
						}
						x--;
					}

					p = checkPerms(arr,p);
					send(msg, "Permissions of the role "+role+" : ```"+p+"```");
				}
			}
		}
  }
];

module.exports = management;