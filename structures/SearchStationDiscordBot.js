require('dotenv').config({ path: `.env` });
const { Collection, Client } = require('discord.js');
const { readdir } = require('fs/promises');
const chalk = require('chalk');
const Logger = require('./Logger');

class SearchStationDiscordBot extends Client {
  constructor(props) {
    //沒呼叫super(props)前不能使用this
    super(props);
    this.commands = new Collection();
    this.cooldowns = new Map();
    this.queue = new Map();
    this.config = require('../config');
    this.logger = new Logger();

    this.start(); //執行loadCommands()、loadEvents()
  }

  async loadCommands() {
    try {
      const commandFolders = await readdir('./commands'); //commandFolders的值是['info']
      commandFolders.forEach(async folder => {
        const files = await readdir(`./commands/${folder}`); //['ping.js]
        files.forEach(file => {
          const command = require(`../commands/${folder}/${file}`);
          this.commands.set(command.name, command);
          if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
          }
        });
      });
    } catch (err) {
      this.logError(err);
    }
  }

  async loadEvents() {
    try {
      const eventsFiles = await readdir('./events');
      eventsFiles.forEach(file => {
        //console.log(file.split('.')); => [ 'message', 'js' ] [ 'ready', 'js' ]
        const event = require(`../events/${file}`);
        this.on(file.split('.')[0], event.bind(null, this)); // call、apply回傳function執行結果，但bind是回傳綁定this後的原函式
        this.log(`Event: ${file.split('.')[0]}`);
      });
    } catch (err) {
      this.logError(err);
    }
  }

  async log(text) {
    this.on('ready', () => this.logger.log(text));
  }

  start() {
    this.loadCommands();
    this.loadEvents();
  }

  build() {
    this.login(process.env.TOKEN);
    this.log(chalk.hex('#42b983').bold(`SearchStationDiscordBot Start ✅`));
  }
}
module.exports = SearchStationDiscordBot;
