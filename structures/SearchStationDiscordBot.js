require('dotenv').config({ path: `.env` });
const { Collection, Client } = require('discord.js');
const { readdir } = require('fs/promises');

class SearchStationDiscordBot extends Client {
  constructor(props) {
    super(props);
    this.commands = new Collection();
    this.cooldowns = new Map();
    this.queue = new Map();
    this.config = require('../config');

    this.start();
  }

  async loadCommands() {
    try {
      const commandFolders = await readdir('./commands'); //commandFolders的值是['info']
      commandFolders.forEach(async folder => {
        const files = await readdir(`./commands/${folder}`); //['ping.js]
        files.forEach(async file => {
          const command = require(`../commands/${folder}/${file}`);
          this.commands.set(command.name, command);
          if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
          }
        });
      });
      //這邊使用下面的for...of寫法，ESlint會出現iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.
      /*for (const folder of commandFolders) {
        const files = await readdir(`./commands/${folder}`);
        for (const file of files) {
          const command = require(`../commands/${folder}/${file}`);
          this.commands.set(command.name, command);
        }
      } */
    } catch (err) {
      console.log(err);
    }
  }

  async loadEvents() {
    try {
      const eventsFiles = await readdir('./events');
      eventsFiles.forEach(file => {
        //console.log(file.split('.')); => [ 'message', 'js' ] [ 'ready', 'js' ]
        const event = require(`../events/${file}`);
        this.on(file.split('.')[0], event.bind(null, this)); // call、apply回傳function執行結果，但bind是回傳綁定this後的原函式
      });
    } catch (err) {
      console.log(err);
    }

    /*for (const file of eventsFiles) {
      const event = require(`../events/${file}`);
      this.on(file.split('.')[0], event.bind(null, this));
      console.log(this);
    } */
    //.filter(file => file.endsWith('.js'));
  }

  start() {
    this.loadCommands();
    this.loadEvents();
  }

  build() {
    this.login(process.env.TOKEN);
  }
}
module.exports = SearchStationDiscordBot;

/* require('dotenv').config({ path: `.env` });
const { Collection, Client } = require('discord.js');
const fs = require('fs'); 
const twitter = require('./api/twitter');
const client = new Client();

//client.login(process.env.TOKEN);
//client.commands = new Collection(); // Collection是一個Map，它還有包含許多實用方法

/* client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!✅`);
  twitter.findTweet(client);
}); */

/* client.on('message', async message => {
  //使用slice()切除前綴: !ping會變成ping，使用trim()刪除空格、使用split(/ +/)處理可能出現的重複空格
  const args = message.content
    .slice(process.env.DISCORD_Bot_Prefix.length)
    .trim()
    .split(/ +/);
  //使用shift()獲取陣列中的第一個元素
  const command = args.shift().toLowerCase();
  if (!client.commands.has(command)) return; //如果client.commands集合裡沒有這個命令就return
  if (!message.content.startsWith(process.env.DISCORD_Bot_Prefix)) return; //如果開頭沒有prefix就return

  try {
    //client.commands.get(command)會返回一個物件，裡面有我們模組內自定義的內容
    client.commands.get(command).execute(client, message, args); //執行對應指令的execute方法
  } catch (err) {
    console.error(err);
    message.reply('There was an error trying to execute that command!');
  }
}); */

/* const commandFiles = fs
.readdirSync('./commands')
.filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
const command = require(`./commands/${file}`);
client.commands.set(command.name, command);
} */
