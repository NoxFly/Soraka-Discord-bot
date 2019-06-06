const firebase = require('firebase');
const main = require('./../bot.js');
const bot = main.bot;
const Discord = require('discord.js');
const DB = main.database;

const quests = [
    {
        name: 1,
        result: (client, profile, type) => {
            if(!type) return client.emoji.id == "459380508615245834" && profile.game.galleons >= 2;
        }
    },

    {
        name: 2,
        result: (client, profile, type) => {
            if(!type) return client.emoji.id == "459380507503886351" && profile.game.galleons >= 20;
        }
    },

    {
        name: 3,
        result: (client, profile, type) => {
            if(!type) return client.emoji.id == "459380509135339530" && profile.game.galleons >= 20;
        }
    },

    {
        name: 4,
        result: (client, profile, type) => {
            if(!type) return client.emoji.id == "459380499174129666" && profile.game.galleons >= 10;
        }
    },

    {
        name: 5,
        result: (client, profile, type) => {
            if(type) return client.content == "wiz-daily" && Date.now()-profile.game.daily>=79200000;
        }
    },

    {
        name: 6,
        result: (client, profile, type) => {
            let attacks = ["avada-kedavra", "sectumsempra", "endoloris", "stupefix"];
            let user_spells = Object.values(profile.game.spells);
            let args = client.content.replace(/wiz-(\w+)\s+<@!?\w+>/, "$1");


            if(type) return attacks.indexOf(args)>-1 && user_spells.indexOf(args);
        }
    },

    {
        name: 7,
        result: (client, profile, type) => {
            if(type) return profile.game.home_point >= 20;
        }
    }
];

module.exports = quests;