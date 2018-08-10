let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
const Discord = require('discord.js');
let randPass = require('./randpass.js');

const check = function(msg, id, name, avatar) {
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
                    // les infos qui ne changent pas
                    user: {
                        id: id,
                        name: name,
                    },
                    // ce qui necessite du delay
                    delay: {
                        daily: 0,
                        post: 0,
                        rep: 0,
                        ad: 0
                    },
                    // les follows
                    followers: {
                        test: 'test'
                    },
                    // les notes
                    notes: {
                        note: '**your notes :**'
                    },
                    // les variables qui changent dans le temps
                    data: {
                        rep: 0,
                        level: 1,
                        money: 0,
                        xp: 0,
                        mpAuth: 0
                    },
                    // les param de compte (important et pas lié au client discord)
                    param: {
                        _reset: 0,
                        _resetTime: 0,
                        desc: 'A very mysterious person',
                        password: password,
                        username: username,
                        Avatar: avatar,
                        BG: 'theme/img/pic.png'
                    },
                    // les choix du user sur les couleurs de son profil etc...
                    choices: {
                        lang: 'EN',
                        color: '0x494C51'
                    }
                });
                
                /*msg.guild.members.get(id).createDM()
                    .then(channel => {
                        channel.send('• Username: '+username+'\n• Password: '+password+'\nConnect you to http://dorian.thivolle.net/ahri to manage your account.')
                        .then(sentMessage => sentMessage.pin());
                    });*/
                    
            } else {
                firebase.database().ref('profile/'+id+'/param').update({
                    zAvatar: avatar
                });
            }
        },200);
};

module.exports = check;