const Command = require('../../Command');
const Discord = require('discord.js');

module.exports = class Region extends Command {
	match(client, message, args) {
        return args.length < 2;
    }
    
    action(client, message, args) {

        if(args.length === 0) {
            const embed = new Discord.MessageEmbed()
                .setTitle("League patch's version")
                .setColor(0x007fff)
                .setDescription(client.riotAPI.patchVersion);

            message.channel.send(embed);
        }

        else if(args.length === 1 && args[0] === 'refresh') {
            const embed = new Discord.MessageEmbed()
                .setColor(0xdd2e44)
                .setDescription("Retrieving last patch's version and its data...");

            message.channel.send(embed).then(async msg => {
                const oldVersion = client.riotAPI.VERSIONS.dd;

                await client.riotAPI.loadPrerequires(true);

                if(client.riotAPI.VERSIONS.dd === oldVersion) {
                    embed
                        .setColor(0x77b255)
                        .setDescription(`:white_check_mark: **League patch already up to date**`);
                }

                else {
                    embed
                        .setColor(0x77b255)
                        .setDescription(`:white_check_mark: **League patch updated to** \`v${client.riotAPI.patchVersion}\``);
                }

                msg.edit(embed);
            });
        }

	}

	get description() {
		return `Shows League patch's version I am currently looking at.`;
	}

	get usage() {
		return `lang {language (optional)}`;
	}
}