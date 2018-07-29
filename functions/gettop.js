let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
const Discord = require('discord.js');

const getTop = function(msg) {
    let type = '';
	if(msg.content.includes('top')) {
		type = 'top ';
	} else {
		type = 'scoreboard ';
	}
	let ref = firebase.database().ref('profile/');
	let user = [];
	let id = msg.author.id;

	ref.on('child_added', function(data) {
		data = data.val();
		let sName = data.name+"";
		user.push(
			{
				name: sName.replace(/#\d+/,''),
				level: data.level,
				xp: data.xp,
				id: data.id
			}
		);
	});
	
	let txt = "📕 Scoreboard:\nNAME:"+(' '.repeat(28))+"XP:\n\n";
	msg.channel.send('loading...').then(message => {
		setTimeout(function() {
			user.sort(function(a,b) {return b.xp-a.xp});

			id = new RegExp(id);
			
			let j = 0;
			for(i in user) {
				j++;
				console.log(user[i].id+' | '+id.test(user[i].id));
				if(id.test(user[i].id)) break;
			}

			let iPage = Math.round(msg.content.split(type)[1]);
			console.log(iPage);
			if(iPage<1 || iPage*10-10>user.length || isNaN(iPage)) iPage = 1
			let iEnd = iPage*10-1;
			let iStart = iPage*10-10;
			let iMaxPage = Math.ceil((user.length)/10);
			console.log('user length: '+(user.length-1)+' | iPage: '+iPage+' | iStart: '+iStart+' | iEnd: '+iEnd+' | iMaxPage: '+iMaxPage);

			for(i=iStart; i<iEnd; i++) {
				if(i==user.length-1) break;
				let n = user[i].name+"";
				let l = user[i].level+"";
				txt += n+'('+l+')'+(' '.repeat(30-n.length))+user[i].xp+'\n';
			}
				message.edit('```'+txt+'\nPage '+iPage+'/'+iMaxPage+' | '+(user.length)+' total users\nYour place: '+j+'```');
		},2000);
	});
};

module.exports = getTop;