const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'queue',
  cooldown: 3,
  description: 'All songs info',
  async execute(client, message) {
    const channel = client.channels.cache.get('855172507250589726');
    const songQueue = client.queue.get(message.guild.id); //回傳一個queueConstructor的物件
    if (!message.member.voice.channel) {
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    }
    if (!songQueue) {
      return channel.send({
        embed: { description: 'There is nothing music in list ' }
      });
    }

    const queueCommands = new MessageEmbed().setColor('#FF0000');
    const songPlayList = []; //歌單
    const song = []; //單個歌曲

    for (let i = 0; i < songQueue.songList.length; i += 1) {
      if (songQueue.songList[i].length >= 2) {
        songQueue.songList[i].forEach(el => {
          songPlayList.push(el);
        });
      } else {
        songQueue.songList[i].forEach(el => {
          song.push(el);
        });
      }
    }

    const getAllSongs = songPlayList.concat(song);
    const getAllSongsAscending = getAllSongs.sort((a, b) => {
      return a.timestamp - b.timestamp; //最早的時間戳值比最晚的時間戳值小，使用sort升冪排序
    });
    getAllSongsAscending.forEach(async el => {
      await queueCommands
        .addField(`\`[${el.duration}]\` ${el.title}`, `<@${el.requester}>`)
        .setFooter(`Page ${Math.ceil(getAllSongsAscending.length / 26)}`);
    });
    channel.send(queueCommands);
  }
};
