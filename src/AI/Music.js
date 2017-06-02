const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class Music extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    message.reply("I am unable to answer music/sound queries at this time.\n\nThis feature is still in development.");
  }
}

module.exports = Music;
