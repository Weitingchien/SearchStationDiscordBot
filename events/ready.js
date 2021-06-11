const twitter = require('../api/twitter');

module.exports = client => {
  console.log(`Logged in as ${client.user.username}!✅`);
  twitter.findTweet(client);
};
