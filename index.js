/**
 * @author Dorian Thivolle
 * @package NoxFly/Soraka-Discord-Bot
 */





const preload = require('./modules/preload');

// bot constants
const config = require('./_conf/config');






// discord
let Discord = require('discord.js');
let client = new Discord.Client();









// path
client.root = __dirname;

client.paths = config.paths;

client.prefix = config.discord.prefix;

client.developerId = config.developerId;

client.isDev = id => id === client.developerId;

client.canvasManager = new (require('./class/CanvasManager'));






preload.loadRiotAPI(client);
preload.loadEvents(client);
preload.loadCommands(client);








client.login(config.discord.clientToken);