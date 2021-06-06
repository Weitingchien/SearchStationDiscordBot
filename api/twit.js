const twitterApi = require('twit');

//用戶的身分驗證
const T = new twitterApi({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

module.exports = T;
