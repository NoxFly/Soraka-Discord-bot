let main = require('./../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');

const checkServer = function(id, name, owner) {
    let exist;
    DB.server(id).getData('id', function(data) {
        console.log('data:'+data.val());
        exist = data.val();
    });

    setTimeout(function() {
        console.log('exist: '+exist);
        if(exist===null) {
            let Guild = {
                id: id,
                name: name,
                owner: owner,
                permsRole: {
                    0: 'test'
                }
            }

            DB.server(id).setServerData(Guild);
        }
    },200);
};

module.exports = checkServer;