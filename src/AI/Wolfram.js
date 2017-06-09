const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class Wolfram extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.wolfram_client = require('wolfram').createClient(this.bot.config.wolfram_key);
  }

  handle(message, response) {
    var topic = response.result.parameters.topic;
    if (topic){
      this.wolfram_client.query("what is " + topic, function(err, result) {
      var handler = this;
        if (err){
          console.log(err);
          handler.defaultHandler(message, response);
          return;
        }
        console.log(result);
      });
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = Wolfram;
