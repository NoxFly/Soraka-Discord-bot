module.exports = class Command {
    /**
     * Execute a command if all rules filled.
     * @param {Client} client Discord's client
     * @param {Message} message Discord's message
     * @param {array} args arguments
     * @return either it has executed the command or not
     */
    parse(client, message, args) {
        if(this.match(client, message, args) && !(this.restricted && !client.isDev(message.author.id))) {
            this.action(client, message, args);
            return true;
        }
        
        return false;
    }
}