const twitter = require('../api/twitter');

module.exports = client => {
  //this.log(`Logged in as ${client.user.username}!✅`);
  twitter.findTweet(client);
};
