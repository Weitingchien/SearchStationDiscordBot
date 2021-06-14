const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
const { MessageEmbed } = require('discord.js');

const videoPlayer = async (guild, song, client, channel) => {
  const searching = await channel.send('Searching...');
  const songQueue = client.queue.get(guild.id); //回傳一個queueConstructor的物件
  if (!song) {
    searching.delete();
    songQueue.voiceChannel.leave();
    client.queue.delete(guild.id);
    return;
  }
  try {
    const stream = await ytdl(song.url);
    songQueue.connection
      .play(stream, { type: 'opus', highWaterMark: 20, filter: 'audioonly' }) //使用opus編碼器，代表運行時不需要FFmpeg轉碼器
      .on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0], client, channel); //當播放完一首曲子再繼續把剩下的曲子放完
      });
    const songAdded = new MessageEmbed();
    songAdded.setColor('#FF0000');
    songAdded.setTitle(song.title);
    songAdded.setAuthor('Now playing', client.config.CDIconUrl);
    songAdded.setThumbnail(song.thumbnail);
    songAdded.setDescription(song.description);
    songAdded.addFields(
      { name: 'Author', value: song.author, inline: true },
      { name: 'Views', value: song.views, inline: true },
      { name: 'Duration', value: song.duration, inline: true }
    );
    songAdded.setFooter(`Upload: ${song.ago}`, client.config.youtubeIconUrl);
    await channel.send(songAdded);
    searching.delete();
  } catch (err) {
    console.log(err);
  }
};

/* const skipSong = (message, serverQueue, client, channel) => {
  if (!message.member.voice.channel)
    return channel.send('You need to be in a channel to execute this command!');
  if (!serverQueue) {
    return channel.send(`There are no songs in queue`);
  }
  serverQueue.connection.dispatcher.destroy();
  serverQueue.songs.shift();
  videoPlayer(message.guild, serverQueue.songs[0], client, channel);
}; */

/* const stopSong = (message, serverQueue, channel) => {
  if (!message.member.voice.channel)
    return channel.send('You need to be in a channel to execute this command!');
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.destroy();
}; */

module.exports = {
  name: 'play',
  aliases: ['p'],
  cooldown: 0,
  description: 'play music',
  //導出videoPlayer函式表達式給skip
  videoPlayer,
  async execute(client, message, cmd, args) {
    const channel = client.channels.cache.get('853660743433453599');
    const voiceChannel = message.member.voice.channel; //成員必須在語音頻道
    const serverQueue = client.queue.get(message.guild.id); //message.guild.id為伺服器ID
    if (!voiceChannel)
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    const permissions = voiceChannel.permissionsFor(message.client.user); //獲取此頻道中成員整體權限集
    if (!permissions.has('CONNECT'))
      return channel.send('You dont have the correct permissions');
    if (!permissions.has('SPEAK'))
      return channel.send('You dont have the correct permissions');

    if (cmd === 'play' || cmd === 'p') {
      if (!args.length)
        return channel.send('You need to send the second argument');
      let song = {};
      if (ytdl.validateURL(args[0])) {
        const songInfo = await ytdl.getInfo(args[0]);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url
        };
        // If the video is not a URL then use keywords to find that video.
      } else {
        const videoFinder = async query => {
          const videoResult = await ytSearch(query);
          return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };
        const video = await videoFinder(args.join(' '));
        if (video) {
          song = {
            title: video.title,
            url: video.url,
            description: video.description,
            thumbnail: video.thumbnail,
            duration: video.timestamp,
            ago: video.ago,
            views: video.views,
            author: video.author.name
          };
        } else {
          channel.send('Error finding video!');
        }
      }
      if (!serverQueue) {
        const queueConstructor = {
          voiceChannel,
          textChannel: message.channel, //使用者在此頻道下指令
          connection: null,
          songs: [] //歌曲會加入到此queueConstructor的song array裡面
        };
        client.queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);
        try {
          const connection = await voiceChannel.join(); //對應到第79行的play，等待機器人連線才能播放
          queueConstructor.connection = connection;
          videoPlayer(
            message.guild,
            queueConstructor.songs[0],
            client,
            channel
          );
        } catch (err) {
          client.queue.delete(message.guild.id);
          channel.send('❌:There was an error connecting!');
          throw err;
        }
      } else {
        serverQueue.songs.push(song);
        channel.send(`👍 ${song.title} added to queue!`);
      }
    } /* else if (cmd === 'skip') skipSong(message, serverQueue, client, channel);
    else if (cmd === 'stop') stopSong(message, serverQueue, client, channel); */
  }
};
