const fs = require('file-system');
const Discord = require('discord.js');



/**
 * Loads all Client events that exist as file in the project (like message, ready...)
 * @param {Client} client discord's client
 */
module.exports.loadEvents = async client => {
    const eventsDir = client.root + client.paths.events;

	// get all Discord events that are registered in a file
	const evtFiles = await fs.readdirSync(eventsDir).filter(file => fs.statSync(eventsDir + '/' + file).isFile());

	// bind event from file
	evtFiles.forEach(file => {
		const eventName = file.split(".")[0];
		const event = require(`${eventsDir}/${file}`);

		// bind
		client.on(eventName, args => event(client, args));

		// we do no long need this as a require / class, because the event is binded
		delete require.cache[require.resolve(`${eventsDir}/${file}`)];
	});
};






/**
 * Loads all commands
 * @param {Client} client Discord's client
 */
module.exports.loadCommands = async client => {

	client.commands = new Discord.Collection();
	client.specials = new Discord.Collection();

    // get the commands directory
	const commandsDir = client.root + client.paths.commands;
	const directories = await fs.readdirSync(commandsDir).filter(file => fs.statSync(commandsDir + '/' + file).isDirectory());


	// for each sub-folder of the commands folder
	for(let folder=0; folder < directories.length; folder++) {
		fs.readdir(`${commandsDir}/${directories[folder]}`, (err, files) => {
			// error while loading a command directory
			if(err) {
				return console.error(`This command folder cannot be read: ${directories[folder]}\n\t${err}`);
			}

			
			// category name (without the [number]- at the beginning)
			const category = directories[folder].toLowerCase();

			// for each file (command) of a command directory
			files.forEach(file => {
				// it must be a js file
				if(!file.endsWith(".js")) {
					return;
				}

				// get the command
				const cmd = new (require(`${commandsDir}/${directories[folder]}/${file}`))(client);

				// special class
				if(file === 'championInfos.js') {
					client.specials.set('championInfos', cmd);
				}
				
				// command
				else {
					cmd.name = file.slice(0, -3);
					
					// set the category of the command thanks the folder name it's in
					cmd.category = category;


					// add command to commands list
					client.commands.set(cmd.name, cmd);
				}
                
				// remove command's cache
				delete require.cache[require.resolve(`${commandsDir}/${directories[folder]}/${file}`)];
			});
		});
	}
};











/**
 * loads Riot API
 * @param {Client} client Discord's client
 */
module.exports.loadRiotAPI = async client => {
	const riotAPIPath = `${client.root}/class/RiotAPI.js`;
	
	const RiotAPI = require(riotAPIPath);
	
	client.riotAPI = new RiotAPI(client.root + client.paths.config, client.root + client.paths.data);

	delete require.cache[require.resolve(riotAPIPath)];
};