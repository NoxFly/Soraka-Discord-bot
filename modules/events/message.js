/**
 * Client.on('message')
 * @param {Client} client Discord's client
 * @param {Message} message message sent in a channel
 */
module.exports = (client, message) => {
    // Soraka mention
    const mentionClientRegex = new RegExp(`^<@!?${client.user.id}>`);

    // does not execute from a bot action
    if(message.author.bot) {
        return;
    }

    // message content
    let content = message.content;

    // the message starts with Soraka's prefix or mention
    if(content.startsWith(client.prefix) || mentionClientRegex.test(content)) {
        // remove prefix or mention from content
        content = content.startsWith(client.prefix)? content.slice(client.prefix.length) : content.replace(mentionClientRegex, '');

        // get command name
        const command = content.trim().split(' ')[0];
        // get arguments
        const args = content.trim().split(' ').slice(1).filter(arg => arg.trim().length > 0);

        // if command exists, execute it
        if(client.commands.has(command)) {
            client.commands.get(command).parse(client, message, args);
        }


        else {
            // get champions id
            const lowercaseChamps = Object.keys(client.riotAPI.champions).map(champion => champion.toLowerCase());

            // want to see champion's details
            if(lowercaseChamps.indexOf(command.toLowerCase()) !== -1) {
                const champion = client.riotAPI.champions[Object.keys(client.riotAPI.champions)[lowercaseChamps.indexOf(command.toLowerCase())]];
                client.specials.get('championInfos').showData(client, message, champion);
            }
        }
    }
};