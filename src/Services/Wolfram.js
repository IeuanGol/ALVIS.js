const Discord = require('discord.js');

class Wolfram {
  constructor(bot) {
    this.bot = bot;
    this.wolfram_client = require('wolfram').createClient(this.bot.config.wolfram_key);
  }

  sendWolframResponse(message, response, header, show_images, credit_wolfram) {
    var credit = "";
    if (credit_wolfram) credit = "\n*Results courtesy of Wolfram Alpha*"
    message.reply(response.result.fulfillment.speech)
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) this.bot.messageCleanupQueue.add(msg, 0.5, true)});
    var handler = this;
    this.wolfram_client.query(response.result.resolvedQuery, function(err, result) {
      if (err){
        console.log(err);
        return;
      }
      if (result.length > 0){
        var display = "";
        var images = "";
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
              display = display + b.value + "\n";
            }
            if (b.image != "" && show_images){
              images = images + b.image + "\n";
            }
          }
          if (has_value == true || show_images){
            display = display + "```\n";
          }
        }
        if (show_images && images != "") images = "**Images:**\n" + images;
        message.reply(header + display + images + credit, {split: true})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) handler.bot.messageCleanupQueue.add(msg, 10)});
      }else{
        message.reply("I could not secure any concrete knowledgebase about the subject.");
      }
    });
  }
}

module.exports = Wolfram;
