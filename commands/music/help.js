const { MessageEmbed } = require('discord.js');
const { readdir } = require('fs/promises');

module.exports = {
  name: 'help',
  cooldown: 1,
  description: 'get Music commands name and description',
  async execute(client, message) {
    const musicCommands = new MessageEmbed()
      .setAuthor('Music Commands', client.user.displayAvatarURL())
      .setColor('#FF0000')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(`${client.user.username}`);
    try {
      const command = await readdir('./commands/music');
      command.forEach(el => {
        const commandName = client.commands.get(el.replace('.js', '')); //使用replace把.js移除
        musicCommands.addField(commandName.name, commandName.description, true);
      });
      message.channel.send(musicCommands);
    } catch (err) {
      throw err;
    }
  }
};
