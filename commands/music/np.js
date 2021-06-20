module.exports = {
  name: 'np',
  cooldown: 1,
  description: 'Shows information about the song that is currently playing',
  execute(client, message) {
    const channel = client.channels.cache.get('855172507250589726');
    const songQueue = client.queue.get(message.guild.id);
    if (!message.member.voice.channel) {
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    }
    if (!songQueue) {
      return channel.send({
        embed: { title: 'There is nothing playing right now' }
      });
    }
    if (
      songQueue.songList[0].isUrl === true ||
      songQueue.songList[0][0].isUrl === true
    ) {
      channel.send({
        embed: {
          title: 'Now Playing',
          color: '#FF0000',
          description: `${songQueue.songList[0].title ||
            songQueue.songList[0][0].title} - ${message.author.toString()}`
        }
      });
    } else {
      channel.send({
        embed: {
          title: 'Now Playing',
          color: '#FF0000',
          description: `${
            songQueue.songList[0].title
          } - ${message.author.toString()}`,
          thumbnail: songQueue.songList[0].thumbnail
        }
      });
    }
  }
};
