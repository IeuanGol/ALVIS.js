const Discord = require('discord.js');
const fs = require('fs');
const APIai = require('apiai');
const BotMessageHandler = require('./BotMessageHandler.js');
const ResponseHandler = require('./AI/ResponseHandler.js');
const CommandHandler = require('./CommandHandler.js');
const ChatHandler = require('./ChatHandler.js');
const DMHandler = require('./DMHandler.js');
const Util = require('./Util.js');

class DiscordBot extends Discord.Client {
  constructor() {
    super();
    this.config = require('../config/config.json');
    this.responses = require('../config/responses.json');
    this.basic = require('./basic.json');
    this.permissions = require('../config/permissions.json');
    this.userSounds = require('../config/userSounds.json');
    this.botMessageHandler = new BotMessageHandler(this);
    this.responseHandler = new ResponseHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.chatHandler = new ChatHandler(this);
    this.dmHandler = new DMHandler(this);
    this.chatbot = APIai(this.config.chatbot_key);
    this.util = new Util(this);

    this.addEventListeners();

    this.login(this.config.token);
  }

  addEventListeners() {
    this.on('ready', this.readyListener);
    this.on('message', this.messageListener);
    this.on('disconnect', this.disconnectListener);
    this.on('reconnecting', this.reconnectingListener);
    this.on('voiceStateUpdate', this.voiceStateUpdateListener);
  }

  readyListener() {
    this.basic.username = this.user.username;
    this.basic.user_id = this.user.id;
    this.util.logger("Logged in to Discord as '" + this.basic.username + "'");
    this.user.setGame(this.config.bot_game, this.config.bot_game_link);
  }

  messageListener(message) {
    if (message.author.bot){
      this.botMessageHandler.handle(message);
      return;
    }
    if (message.channel instanceof Discord.DMChannel){
      this.dmHandler.handle(message);
      return;
    }
    if (message.channel instanceof Discord.TextChannel){
      if (message.content.startsWith(this.basic.command_prefix)){
        this.commandHandler.handle(message);
        return;
      }
      this.chatHandler.handle(message);
    }
  }

  disconnectListener() {
    this.util.logger('Bot disconnected from Discord\n');
  }

  reconnectingListener() {
    this.util.logger('AutoReconnecting...');
  }

  voiceStateUpdateListener(oldMember, newMember) {
    if (newMember.voiceChannel && !oldMember.voiceChannel){
      if (newMember.voiceChannel.joinable && !newMember.voiceChannel.full && newMember.voiceChannel.speakable && (newMember.voiceChannel.members.array().length > 1) && this.userSounds[newMember.id] && !newMember.guild.voiceConnection){
        this.util.playSound(newMember.voiceChannel, this.basic.sound_path + "/" + this.userSounds[newMember.id].sound);
        this.util.logger("Played user sound for " + newMember.user.username + " on " + newMember.guild.name + ":" + newMember.voiceChannel.name);
      }
    }
  }
}

module.exports = new DiscordBot();
