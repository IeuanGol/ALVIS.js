const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const GooglePlayMusic = require('../Services/GooglePlayMusic.js');

class Music extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.service = "GooglePlayMusic";
    if (this.bot.basic.services[this.service].active){
      this.pm = new GooglePlayMusic(bot);
    }
  }

  handle(message, response) {
    if (!this.bot.basic.services[this.service].active){
      this.disabledServiceHandler(message, response, this.service);
      return;
    }
    var discord_bot = this.bot;
    var action = response.result.action;
    var actionType = action.split(".")[1];
    var handler = this;
    if (actionType == "play"){
      if (message.channel instanceof Discord.DMChannel){
        message.reply("I'm sorry. I cannot do that in a DM channel.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }
      if (!(message.channel instanceof Discord.TextChannel)){
        message.reply("I cannot do that here. Ask me again in a public text channel.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }
      if (!message.member.voiceChannel){
        message.reply("I cannot play music for you if you are not in a voice channel.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }else if (!message.member.voiceChannel.joinable){
        message.reply("I am not allowed to join that voice channel to play music.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }else if (message.guild.voiceConnection){
        message.reply("I am already doing something in a voice channel on this server. Try again in a little while.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }else{
        message.reply(response.result.fulfillment.speech)
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        var search_string = "";
        if (response.result.parameters.artist[0]){
          search_string = search_string + response.result.parameters.artist.join(" ") + " ";
        }
        if (response.result.parameters.album){
          search_string = search_string + response.result.parameters.album + " ";
        }
        if (response.result.parameters.song){
          search_string = search_string + response.result.parameters.song + " ";
        }
        if (response.result.parameters.genre){
          search_string = search_string + response.result.parameters.genre;
        }
        if (search_string.length < 4) search_string = response.result.resolvedQuery;
        this.pm.startStreamFromSearch(message, search_string, this.bot.basic.stream_options);
      }
      discord_bot.messageCleanupQueue.add(message, 1, true);
    }else if(actionType == "replay"){
      if (message.channel instanceof Discord.DMChannel){
        message.reply("I'm sorry. I cannot do that in a DM channel.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }
      if (!(message.channel instanceof Discord.TextChannel)){
        message.reply("I cannot do that here. Ask me again in a public text channel.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }
      if (!message.member.voiceChannel){
        message.reply("I cannot play music for you if you are not in a voice channel.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }else if (!message.member.voiceChannel.joinable){
        message.reply("I am not allowed to join that voice channel to play music.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }else if (message.guild.voiceConnection){
        message.reply("I am already doing something in a voice channel on this server. Try again in a little while.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
        return;
      }else{
        this.pm.startCurrentlyCachedSong(message, response, this.bot.basic.stream_options);
      }
      discord_bot.messageCleanupQueue.add(message, 1, true);
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = Music;
