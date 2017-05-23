const Discord = require('discord.js');
const fs = require('fs');
const Cleverbot = require('cleverbot');
const BotMessageHandler = require('./BotMessageHandler.js');
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
    this.botMessageHandler = new BotMessageHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.chatHandler = new ChatHandler(this);
    this.dmHandler = new DMHandler(this);
    this.chatbot = new Cleverbot({key: this.config.chatbot_key});
    this.util = new Util(this);

    this.addEventListeners();

    this.login(this.config.token);
  }

  addEventListeners() {
    this.on('ready', this.readyListener);
    this.on('message', this.messageListener);
    this.on('disconnect', this.disconnectListener);
    this.on('reconnecting', this.reconnectingListener)
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
}

module.exports = new DiscordBot();
