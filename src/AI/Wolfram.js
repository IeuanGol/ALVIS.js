const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');
//const WolframAPI = require('wolfram');

class Wolfram extends DefaultResponse {
  constructor(bot) {
    super(bot);
    //this.wolfram_client = WolframAPI.creatClient(this.bot.config.wolfram_key);
  }

  handle(message, response) {
    var topic = null;//response.result.parameters.topic;
    if (topic){
      this.wolfram_client.query(topic, function(err, result) {
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
