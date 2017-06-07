const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class R6Siege extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    var parameters = response.result.parameters;
    if (parameters.username != ''){
      message.reply(response.result.fulfillment.speech);
      this.bot.commandHandler.commandExecuter.r6Siege.getStats(message, parameters.username, null);
    }else{
      message.reply("I was unable to determine a username from your request. Please be sure to provide me one.\nIf this error persists, try the **!r6stats** command instead.")
    }
  }
}

module.exports = R6Siege;
