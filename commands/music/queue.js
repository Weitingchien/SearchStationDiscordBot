const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'queue',
  aliases: ['q'],
  cooldown: 3,
  description: 'All songs info',
  async execute(client, message, cmd, args) {
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
    const totalPage = parseInt(getAllSongsAscending.length / 10, 10);
    getAllSongsAscending.forEach(async (el, index) => {
      el.id = index + 1;
    });

    if (args[0] <= `p${totalPage}` && args[0] >= `p${1}`) {
      const selectSong = args[0].substr(1) * 10;
      const selectCache = [];

      for (let i = selectSong; i < selectSong + 10; i += 1) {
        if (!getAllSongsAscending[i]) break;
        selectCache.push(getAllSongsAscending[i]);
      }
      selectCache.forEach(async el => {
        queueCommands
          .addField(
            `\`${el.id}.\` \`[${el.duration}]\` ${el.title}`,
            `<@${el.requester}>`
          )
          .setFooter(`Page ${selectSong / 10}/${totalPage}`);
      });
      channel.send(queueCommands);
    } else {
      for (let i = 0; i < 10; i += 1) {
        queueCommands
          .addField(
            `\`${getAllSongsAscending[i].id}.\` \`[${
              getAllSongsAscending[i].duration
            }]\` ${getAllSongsAscending[i].title}`,
            `<@${getAllSongsAscending[i].requester}>`
          )
          .setFooter(`Page 0/${totalPage}`);
      }
      channel.send(queueCommands);
    }
  }
};
