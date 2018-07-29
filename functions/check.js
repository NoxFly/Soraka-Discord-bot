let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
const Discord = require('discord.js');
let randPass = require('./randpass.js');

const check = function(msg,ref,id,name, avatar) {
        avatar = avatar || '';
        ref = firebase.database().ref('profile/'+id);
        let a = 0;
        ref.on('child_added', function() {
            a++;
        });
        
        setTimeout(function() {
            if(a==0) {
                let username = name;
                let password = randPass();
                let newRef = firebase.database().ref('profile').child(id);
                newRef.set({
                    daily: 0,
                    followers: {
                        test: 'test'
                    },
                    id: id,
                    lang: 'EN',
                    level: 1,
                    money: 0,
                    name: name,
                    notes: {
                        note: '**your notes :**'
                    },
                    post: 0,
                    rep: {
                        repPT: 0,
                        repTi: 0
                    },
                    xp: 0,
                    zParam: {
                        _reset: 0,
                        _resetTime: 0,
                        desc: 'A very mysterious person',
                        mpAut: 0,
                        password: password,
                        username: username,
                        zAvatar: avatar,
                        zBG: 'theme/img/pic.png'
                    }
                });
                
                msg.guild.members.get(id).createDM()
                    .then(channel => {
                        channel.send('• Username: '+username+'\n• Password: '+password+'\nConnect you to http://dorian.thivolle.net/ahri to manage your account.')
                        .then(sentMessage => sentMessage.pin());
                    });
                    
            } else {
                firebase.database().ref('profile/'+id+'/zParam').update({
                    zAvatar: avatar
                });
            }
        },2000);
};

module.exports = check;