let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let DB = main.database;
let champ = require('./../../functions/champions.json');
const Discord = require('discord.js');

// Basic - Games - Utility - Personal - Social - management

// External functions
let admin = require('./../../../functions/admin.js');
let check2 = require('./../../../functions/checktwo.js');
let mtsm = require('./../../../functions/mtsm.js');
let dump = require('./../../../functions/dump.js');

function send(msg, message) {
	msg.channel.send(message);
}

let management = [
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
		name: 'createRole',
		description: 'Create a role',
	  	usage: '`a!createRole {name} {+}` (if you want to add to you)',
	  	group: 'management',
		result: (msg) => {
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
			let perms;
			let access = 0;
			let delRole = msg.content.split('deleteRole ')[1];
			if(delRole=='@everyone') return 'You cannot delete this role';

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
			let perms;
			let role = msg.content.split('setPermTo ')[1];

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
			let perms;
			let role = msg.content.split('remPermTo ')[1];
			
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
];

module.export = management;