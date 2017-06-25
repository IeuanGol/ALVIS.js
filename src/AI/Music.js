const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const GooglePlayMusic = require('../Services/GooglePlayMusic.js');

class Music extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.pm = new GooglePlayMusic(bot);
  }

  handle(message, response) {
    var action = response.result.action;
    var actionType = action.split(".")[1];
    var handler = this;
    if (actionType == "play"){
      if (message.channel instanceof Discord.DMChannel){
        message.reply("I'm sorry. I cannot do that in a DM channel.");
        return;
      }
      if (!(message.channel instanceof Discord.TextChannel)){
        message.reply("I cannot do that here. Ask me again in a public text channel.");
        return;
      }
      if (!message.member.voiceChannel){
        message.reply("I cannot play music for you if you are not in a voice channel.");
        return;
      }else if (!message.member.voiceChannel.joinable){
        message.reply("I am not allowed to join that voice channel to play music.");
        return;
      }else if (message.guild.voiceConnection){
        message.reply("I am already doing something in a voice channel on this server. Try again in a little while.");
        return;
      }else{
        message.reply(response.result.fulfillment.speech);
        var search_string = "";
        if (response.result.parameters.artist[0]){
          search_string = search_string + response.result.parameters.artist[0] + " ";
        }
        if (response.result.parameters.song){
          search_string = search_string + response.result.parameters.song + " ";
        }
        if (response.result.parameters.genre){
          search_string = search_string + response.result.parameters.genre + " ";
        }
        this.pm.startStreamFromSearch(message, search_string, this.bot.basic.stream_options);
      }
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = Music;
