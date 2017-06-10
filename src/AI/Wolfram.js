const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class Wolfram extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.wolfram_client = require('wolfram').createClient(this.bot.config.wolfram_key);
  }

  handle(message, response) {
    var action = response.result.action;
    var actionType = action.split(".")[1];
    if (actionType == "topic_search"){
      this.topicHandler(message, response);
    }else if (actionType == "resolve_equation"){
      this.mathsHandler(message, response);
    }else{
      this.defaultHandler(message, response);
    }
  }

  topicHandler(message, response) {
    message.reply(response.result.fulfillment.speech)
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) this.bot.messageCleanupQueue.add(msg, 0.5, true)});
      var handler = this;
      this.wolfram_client.query(response.result.resolvedQuery, function(err, result) {
      if (err){
        console.log(err);
        handler.defaultHandler(message, response);
        return;
      }
      if (result.length > 0){
        var display = "";
        for (var i = 0; i < result.length; i++){
          var a = result[i];
          var first = true;
          var has_value = false;
          for (var j = 0; j < a.subpods.length; j++){
            var b = a.subpods[j];
            if (b.value != ""){
              if (first == true){
                display = display + "**" + a.title + ":**```\n";
                first = false;
              }
              has_value = true;
              display = display  + b.value + "\n";
            }
          }
          if (has_value == true){
            display = display + "```\n";
          }
        }
        message.reply("I found this for you:\n\n" + display + "\n*Results courtesy of Wolfram Alpha*", {split: true})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) handler.bot.messageCleanupQueue.add(msg, 10)});
      }else{
        message.reply("I could not secure any concrete knowledgebase about the subject.");
      }
    });
  }

  mathsHandler(message, response) {
    this.defaultHandler(message, response);
  }
}

module.exports = Wolfram;
