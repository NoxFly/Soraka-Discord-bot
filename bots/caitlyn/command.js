//let firebase = require('firebase');

const commands = [
	
	{
   name : 'help',
   description : 'show all commands with their description and usage',
   result : (msg) => {
			let reg = /^help (\w+)$/, txt = '';
			
			// Si il y a quelque chose après
			if(reg.test(msg.content.split('$')[1])) {
				let n = msg.content.split('help ')[1];
				let text = '';
				
				// On cherche la commande demandée
				for(let i=0; i<commands.length;i++) {
						let reg2 = new RegExp(commands[i].name);
						// Si on a trouvé, on affiche
						if(reg2.test(n)) {
							text = "  • `"+n+"` : ";
							text += commands[i].description;
							return text;
						}
					}
				
				// La commande n'a pas été trouvée
				return 'I can\'t help you, the command does not exist 😓';
				
			} else if(/^(help)$/.test(msg.content.split('$')[1])) {
				for(let i=0;i<commands.length;i++){
					txt += '  • `'+commands[i].name+' ` : '+commands[i].description+'\n';
				}
				return txt;
			}
		}
	},
	
	{
   name : 'invite',
   description : 'Show info about Caitlyn and her invite link',
   result : (msg) => {
 			let cmd = msg.content.replace('$step','');
     return 'https://discordapp.com/api/oauth2/authorize?client_id=443430082459992065&permissions=2110258391&scope=bot';
		}
	},
    /*
    {
		name : 'return',
		description : 'send a message to Ahri\'s creator.',
		usage : '`a!return` `your message`',
		result : (msg) => {
			let id = msg.author.id;
			let refp = Firebase.database().ref('profile/'+id);
			
			let name = msg.author.username;
			let authorMSG = msg.content.split('return')[1];
			
			let Actuel = [];
			let Actuel2 = [];
			refp.on('child_added',function (data) {
				Actuel.push(data.val());
  	 	});
  	 	check(msg,refp,id,name);
			
			setTimeout(function() {
				let refA = Firebase.database().ref('profile/'+id+'zParam/');
				refA.on('child_added',function (data) {
					Actuel2.push(data.val());
  	 		});
				
				setTimeout(function() {
					let Now = Date.now();
					let mpAut = Actuel2[0];
					msg.channel.send('mp: '+mpAut);
					
					// Si msg != vide
					if(/\S/.test(authorMSG)) {
						// Si cooldown écoulé
						if(Now-mpAut >= 85400000) {
							mpAut = Now;
					
							Firebase.database()
								.ref('profile/'+id+'/zParam/')
								.update({
									mpAut: Now
								});
					
							let embed = new Discord.RichEmbed()
								.setAuthor(name)
								.setColor(0x007FFF)
								.setThumbnail(msg.author.avatarURL)
								.addField("message :",authorMSG);
				
							// Envoie de Ahri à moi
							msg.author.createDM().then(channel => {
								channel.send(embed);
							}); 
							msg.channel.send('message send');
						}

						let ans = mtsm(85400000-(Now-mpAut));
						msg.channel.send('You need to wait '+ans+' to send a message');
					} else {
						msg.channel.send('Lol, my creator will not read an empty message, don\'t you ? :grimacing::joy:');
					}
				},1000);
			},1000);
			return false;
		}
	}*/

];

module.exports = commands;