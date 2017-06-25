const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');

class Smalltalk extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    message.reply(response.result.fulfillment.speech);
  }
}

module.exports = Smalltalk;
