const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
const { MessageEmbed } = require('discord.js');

const videoPlayer = async (guild, song, client, channel) => {
  const songQueue = client.queue.get(guild.id); //回傳一個queueConstructor的物件
  if (!song) {
    songQueue.voiceChannel.leave();
    client.queue.delete(guild.id);
  }
  /*   const stream = await ytdl(song.url, { type: 'opus' });
  if (!stream) {
    const searching = await channel.send(`Searching...`);
  } */
  songQueue.connection
    .play(await ytdl(song.url), { type: 'opus' }) //使用opus編碼器，代表運行時不需要FFmpeg轉碼器
    .on('finish', () => {
      songQueue.songs.shift();
      videoPlayer(guild, songQueue.songs[0]); //當播放完一首曲子再繼續把剩下的曲子放完
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
  songAdded.setFooter();
  //songAdded.setFooter(`author:${song.author}`);
  await channel.send(songAdded);
};

const skipSong = (message, serverQueue, channel) => {
  if (!message.member.voice.channel)
    return channel.send('You need to be in a channel to execute this command!');
  if (!serverQueue) {
    return channel.send(`There are no songs in queue`);
  }
  serverQueue.connection.dispatcher.end();
};

const stopSong = (message, serverQueue, channel) => {
  if (!message.member.voice.channel)
    return channel.send('You need to be in a channel to execute this command!');
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

module.exports = {
  name: 'play',
  description: 'play music',
  aliases: ['skip', 'stop'],
  cooldown: 0,
  async execute(client, message, cmd, args) {
    const channel = client.channels.cache.get('853660743433453599');
    const voiceChannel = message.member.voice.channel; //成員必須在語音頻道
    let song = {};
    if (!voiceChannel)
      return channel.send(
        'You need to be in a channel to execute this command!'
      );
    const permissions = voiceChannel.permissionsFor(message.client.user); //獲取此頻道中成員整體權限集
    const serverQueue = client.queue.get(message.author.id);
    console.log(permissions);
    if (!permissions.has('CONNECT'))
      return channel.send('You dont have the correct permissions');
    if (!permissions.has('SPEAK'))
      return channel.send('You dont have the correct permissions');

    if (cmd === 'play') {
      if (!args.length)
        return channel.send('You need to send the second argument');
      if (ytdl.validateURL(args[0])) {
        const songInfo = await ytdl.getInfo(args[0]);
        console.log(songInfo);
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
        console.log(video);
        if (video) {
          song = {
            title: video.title,
            url: video.url,
            description: video.description,
            thumbnail: video.thumbnail,
            duration: video.timestamp,
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
        channel.send(`Youtube: ${song.title} added to queue!`);
      }
    } else if (cmd === 'skip') skipSong(message, serverQueue, channel);
    else if (cmd === 'stop') stopSong(message, serverQueue, channel);
  }
};
