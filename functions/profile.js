let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
const Discord = require('discord.js');

const profile = function(msg,id,name,avatar) {
        let refp = firebase.database().ref('profile/'+id);
        let Actuel = [];
        let a = 0;
    
        refp.on('child_added', function(data) {
            Actuel.push(data.val());
            a++;
        });
        
        try {
            let refF = firebase.database().ref('profile/'+id+'/followers');
            let refC = firebase.database().ref('profile/'+id+'/zzChoice');
            let Actuel2 = [];
            let Actuel3 = [];
    
            refF.on('child_added', function(data) {
                Actuel2.push(data.val());
            });
            refC.on('child_added', function(data) {
                Actuel3.push(data.val());
            });
    
            setTimeout(function(){
                if(a==0) {
                    msg.channel.send('This user does not have an account');
                } else {
                    let money = Actuel[5];
                    let xp = Actuel[10];
                    let lvl = Actuel[4];
                    let lang = Actuel[3];
                    let followers = Actuel2.length-1;
                    let col = Actuel3[0];
                    console.log(col);
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
    
                    let embed;
                    if(avatar=="no") {
                        embed = new Discord.RichEmbed()
                            .setAuthor(name+' ('+id+')')
                            .setColor(0x494C51)
                            .addField("Level :",lvl)
                            .addField("XP :",xp+'/'+upN+' ('+perc+'% to reach next level)')
                            .addField("Money :",money)
                            .addField("Followers :",followers)
                            .addField("Lang :",lang);
                    } else {
                        embed = new Discord.RichEmbed()
                            .setAuthor(name+' ('+id+')')
                            .setColor(col)
                            .setThumbnail(avatar)
                            .addField("Level :",lvl)
                            .addField("XP :",xp+'/'+upN+' ('+perc+'% to reach next level)')
                            .addField("Money :",money)
                            .addField("Followers :",followers)
                            .addField("Lang :",lang);
                    }
                    msg.channel.send(embed);
                }
            },3000);
        } catch(error) {
            msg.channel.send('Sorry, an error occurred, I was unable to view the profile');
        }
};

module.exports = profile;