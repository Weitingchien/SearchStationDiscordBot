const SearchStationDiscordBot = require('./structures/SearchStationDiscordBot');

const client = new SearchStationDiscordBot();

client.build();

module.exports = client;
