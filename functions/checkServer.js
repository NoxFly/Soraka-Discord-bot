const checkServer = function(id, name, owner) {
    const main = require('./../bot.js');
    const bot = main.bot;
    const Database = main.database;
    const Discord = require('discord.js');

    let exist;
    Database.server(id).getData('id', function(data) {
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
                },
                modules: {
                    test: 'test'
                }
            }

            Database.server(id).setServerData(Guild);
        }
    },1000);
};

module.exports = checkServer;