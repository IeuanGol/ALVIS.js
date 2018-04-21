const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const GooglePlayMusic = require('../Services/GooglePlayMusic.js');

class Playback extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    var discord_bot = this.bot;
    var action = response.result.action;
    var actionType = action.split(".")[1];
    var handler = this;

    if(actionType == "stop"){
      if (message.channel instanceof Discord.TextChannel){
        if (message.guild.voiceConnection && message.member.voiceChannel){
          if (message.guild.voiceConnection.channel.id == message.member.voiceChannel.id){
            message.reply(response.result.fulfillment.speech)
            .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
            discord_bot.util.endDispatcher(message.guild.id);
            discord_bot.messageCleanupQueue.add(message, 1, true);
            return;
          }
        }
      }
      message.reply("There is currently no audio for me to stop.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      discord_bot.messageCleanupQueue.add(message, 1, true);

    }else if (actionType == "set_volume"){
      if (message.channel instanceof Discord.DMChannel){
        message.reply("You cannot change my playback volume from within a DM channel.");
        return;
      }
      var subType = action.split(".")[2];
      if (subType == "value"){
        var newVolume = parseInt(response.result.parameters.number);
        if (isNaN(newVolume)){
          var currentVolume = discord_bot.util.getIntegerVolume();
          message.reply("My playback volume is currently at " + currentVolume + "%.")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          discord_bot.messageCleanupQueue.add(message, 1, true);
          return;
        }
        newVolume = Math.floor(newVolume/10);
        if (newVolume > 10) newVolume = 10;
        if (newVolume < 1) newVolume = 1;
        this.bot.util.setIntegerVolume(newVolume*10);
        if (message.guild.voiceConnection) message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(newVolume/10);
        message.reply("My playback volume is now at " + newVolume*10 + "%.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }else if (subType == "increase"){
        var newVolume = this.bot.util.increaseVolume();
        if (message.guild.voiceConnection) message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(newVolume/100);
        message.reply("My playback volume is now at " + newVolume + "%.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }else if (subType == "decrease"){
        var newVolume = this.bot.util.decreaseVolume();
        if (message.guild.voiceConnection) message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(newVolume/100);
        message.reply("My playback volume is now at " + newVolume + "%.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }else{
        this.defaultHandler(message, response);
      }
      discord_bot.messageCleanupQueue.add(message, 1, true);

    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = Playback;
