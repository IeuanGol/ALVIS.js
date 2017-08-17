const Discord = require('discord.js');
const Util = require('../Util.js');
const DefaultResponse = require('./DefaultResponse.js');
const DiscordCommand = require('./DiscordCommand.js');
const Music = require('./Music.js');
const NativeCommand = require('./NativeCommand.js');
const News = require('./News.js');
const Playback = require('./Playback.js');
const R6Siege = require('./R6Siege.js');
const Smalltalk = require('./Smalltalk.js');
const Translate = require('./Translate.js');
const Weather = require('./Weather.js');
const Wolfram = require('./Wolfram.js');

class ResponseHandler {
  constructor(bot) {
    this.bot = bot;
    this.util = new Util(bot);
    this.defaultresponse = new DefaultResponse(this.bot);
    this.discordcommand = new DiscordCommand(this.bot);
    this.music = new Music(this.bot);
    this.nativecommand = new NativeCommand(this.bot);
    this.news = new News(this.bot);
    this.playback = new Playback(this.bot);
    this.r6siege = new R6Siege(this.bot);
    this.smalltalk = new Smalltalk(this.bot);
    this.translate = new Translate(this.bot);
    this.weather = new Weather(this.bot);
    this.wolfram = new Wolfram(this.bot);
  }

  handle(message, response) {
    var action = response.result.action;
    var actionType = action.split(".")[0];
    if (actionType == "discordcommand"){
      this.discordcommand.handle(message, response);
    }else if (actionType == "music"){
      this.music.handle(message, response);
    }else if (actionType == "nativecommand"){
      this.nativecommand.handle(message, response);
    }else if (actionType == "news"){
      this.news.handle(message, response);
    }else if (actionType == "playback"){
      this.playback.handle(message, response);
    }else if (actionType == "r6siege"){
      this.r6siege.handle(message, response);
    }else if (actionType == "smalltalk"){
      this.smalltalk.handle(message, response);
    }else if (actionType == "translate"){
      this.translate.handle(message, response);
    }else if (actionType == "weather"){
      this.weather.handle(message, response);
    }else if (actionType == "wolfram"){
      this.wolfram.handle(message, response);
    }else if (action == "input.unknown"){
      this.defaultresponse.handle(message, response);
    }else{
      this.defaultresponse.handle(message, response);
    }

    this.logResponse(message, action);
  }

  logResponse(message, queryType) {
    if (message.channel instanceof Discord.DMChannel){
			this.util.logger("Replied to " + queryType + " DM query from " + message.author.username);
		}else if (message.channel instanceof Discord.TextChannel) {
			this.util.logger("Replied to " + queryType + " query from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
		}else {
      this.util.logger("Replied to " + queryType + " query from " + message.author.username);


    }
  }

}

module.exports = ResponseHandler;
