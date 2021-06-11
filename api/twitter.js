const twit = require('./twit');

module.exports.findTweet = client => {
  const stream = twit.stream('statuses/filter', {
    follow: [process.env.TWITTER_USER_ID, '1234824733457125377'] //my twitter specify whichever Twitter ID you want to follow
  });
  stream.on('tweet', tweet => {
    console.log('call api');
    //只發送基本推文，不包含轉推等其他狀態，要不然重複的貼文內容會一直被傳送到頻道
    if (
      tweet.retweeted_status ||
      tweet.in_reply_to_status_id ||
      tweet.in_reply_to_status_id_str ||
      tweet.in_reply_to_user_id ||
      tweet.in_reply_to_user_id_str ||
      tweet.in_reply_to_screen_name
    ) {
      return;
    }
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${
      tweet.id_str
    }`;
    try {
      client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(url); //discord.js v12需要使用.cache存取channels集合
    } catch (err) {
      console.error(err);
    }
  });
};
