const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class R6Siege extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    var parameters = response.result.parameters;
    if (parameters.username != ''){
      message.reply(response.result.fulfillment.speech)
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) this.bot.messageCleanupQueue.add(msg, 0.5, true)});
      this.bot.commandHandler.commandExecuter.r6Siege.getStats(message, parameters.username, null);
    }else{
      message.reply("I was unable to determine a username from your request. Please be sure to provide me one.\nIf this error persists, try the **!r6stats** command instead.")
    }
  }
}

module.exports = R6Siege;
