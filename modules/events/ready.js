/**
 * Client.on('ready')
 * @param {Client} client Discord's client
 * @param  {...any} args arguments
 */
module.exports = (client, ...args) => {
    // client is ready
    console.log(client.user.tag + ' ready !');

    // all champions id
    const championIds = Object.keys(client.riotAPI.champions);

    // set activity rotation interval
    const setActivity = () => {
        const champion = client.riotAPI.champions[championIds[Math.floor(Math.random() * championIds.length)]]?.name || 'Akali';
        client.user.setActivity(`with ${champion} | ${client.prefix}help`);
    };

    //
    setActivity();
    client.setInterval(setActivity, 60000);
};