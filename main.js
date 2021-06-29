const SearchStationDiscordBot = require('./structures/SearchStationDiscordBot');

const client = new SearchStationDiscordBot();

client.build();

process.on('uncaughtException', err => console.error(err));

process.on('unhandledRejection', err => console.error(err));

process.on('rejectionHandled', err => console.error(err));

module.exports = client;
