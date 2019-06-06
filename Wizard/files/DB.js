let firebase = require("firebase");
let main = require('../bot.js');
let bot = main.bot;
const Discord = require('discord.js');

function send(msg, message) {
	msg.channel.send(message);
}

function log(msg, log) {
	let embed = new Discord.RichEmbed()
		.setAuthor('Log')
		.setColor(0xE82C0C)
		.setDescription(log);
	send(msg, embed);
}

class DB {
    constructor() {
        let config = {
            apiKey: "AIzaSyBMwn0LeIL9XbREVLLZpctNZoP0_Xrwj-w",
            authDomain: "wizard-fr.firebaseapp.com",
            databaseURL: "https://wizard-fr.firebaseio.com",
            projectId: "wizard-fr",
            storageBucket: "",
            messagingSenderId: "493208204200"
        };
        firebase.initializeApp(config);
        let database = firebase.database();
        this.database = database;
        this.serverID = 0;
        this.responseTime = 600;
        this.ref = "";
        this.author = false;
    }

    /* user */

    profile(id) {
        this.ref = '/profiles/'+id;
        return this;
    }

    setAuthor(author) {
        this.author = author;
    }

    /* get the data */

    getData(way, callback) {
        let ref = this.database.ref(this.ref+'/'+way);
        ref.on('value', function(data) {
            callback(data);
        });
        return this;
    }

    /* set a new data */

    setData(way, obj) {
        this.database.ref(this.ref+'/'+way).set(obj);
    }

    /* add a new data on a plug */

    addData(way, name, obj) {
        this.database.ref(this.ref+'/'+way).child(name).set(obj);
    }

    updateData(way, data) {
        this.database.ref(this.ref+'/'+way+'/').set(data);
    }

    /* delete data */

    deleteData(way) {
        this.database.ref(this.ref+'/'+way).remove();
    }

    source(way) {
        this.ref = way;
        return this;
    }
}

module.exports = DB;