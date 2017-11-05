const Discord = require('discord.js');
const fs = require('fs');
const APIai = require('apiai');
const MessageCleanupQueue = require('./MessageCleanupQueue.js');
const BotMessageHandler = require('./BotMessageHandler.js');
const ResponseHandler = require('./AI/ResponseHandler.js');
const NewMemberHandler = require('./NewMemberHandler.js');
const CommandHandler = require('./CommandHandler.js');
const ConsoleHandler = require('./ConsoleHandler.js');
const StartupCheck = require('./StartupCheck.js');
const ChatHandler = require('./ChatHandler.js');
const DMHandler = require('./DMHandler.js');
const Util = require('./Util.js');
const GoogleAssistant = require('./GoogleAssistant.js');

class DiscordBot extends Discord.Client {
  constructor() {
    super();
    this.config = require('../config/config.json');
    this.responses = require('../config/responses.json');
    this.basic = require('./basic.json');
    this.permissions = require('../config/permissions.json');
    this.userSounds = require('../config/userSounds.json');
    this.webAssets = require('../assets/webAssets.json');
    this.colours = require('../assets/colours.json');
    this.util = new Util(this);

    if (this.startupIntegrityCheck()){
      this.responseHandler = new ResponseHandler(this);
      this.botMessageHandler = new BotMessageHandler(this);
      this.messageCleanupQueue = new MessageCleanupQueue(this);
      this.newMemberHandler = new NewMemberHandler(this);
      this.commandHandler = new CommandHandler(this);
      this.consoleHandler = new ConsoleHandler(this);
      this.chatHandler = new ChatHandler(this);
      this.dmHandler = new DMHandler(this);
      this.util = new Util(this);//yes, this is needing to be redefined
      this.googleAssistant = new GoogleAssistant(this);

      this.chatbot = APIai(this.config.apiai_agent_token);

      this.addEventListeners();

      this.createMediaContainers();

      this.setVolumeToDefault();

      this.login(this.config.discord_token);

      var stdin = process.openStdin();
      var bot = this;
      stdin.addListener("data", function(d){
        bot.consoleHandler.handle(d.toString().trim())});

    }else{
      this.util.logger("Startup Configuration Check FAILED! Ensure settings are configured correctly then try again.");
    }
  }

  startupIntegrityCheck() {
    return new StartupCheck(this).runConfigCheck();
  }

  setVolumeToDefault() {
    this.util.setIntegerVolume(this.config.default_volume);
  }

  createMediaContainers() {
    this.basic.last_played = {};
    this.basic.dispatchers = {};
  }

  addEventListeners() {
    this.on('ready', this.readyListener);
    this.on('error', this.errorListener);
    this.on('message', this.messageListener);
    this.on('disconnect', this.disconnectListener);
    this.on('reconnecting', this.reconnectingListener);
    this.on('messageDelete', this.messageDeleteListener);
    this.on('guildMemberAdd', this.guildMemberAddListener);
    this.on('voiceStateUpdate', this.voiceStateUpdateListener);
  }

  readyListener() {
    this.basic.username = this.user.username;
    this.basic.user_id = this.user.id;
    this.util.logger("Logged in to Discord as '" + this.basic.username + "'");
    if (this.config.bot_game_link) this.user.setGame(this.config.bot_game, this.config.bot_game_link);
    else this.user.setPresence(this.config.bot_game);
  }

  errorListener() {
    this.util.logger('Error in connection to Discord');
    try{
      this.login(this.config.discord_token);
    }catch(err){}
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
    this.util.logger('Disconnected from Discord');
  }

  reconnectingListener() {
    this.util.logger('AutoReconnecting to Discord');
  }

  messageDeleteListener(message) {
    this.messageCleanupQueue.remove(message.id);
  }

  guildMemberAddListener(newMember) {
    this.newMemberHandler.handle(newMember);
  }

  voiceStateUpdateListener(oldMember, newMember) {
    if (newMember.voiceChannel && !oldMember.voiceChannel){
      if (newMember.voiceChannel.joinable && !newMember.voiceChannel.full && newMember.voiceChannel.speakable && (newMember.voiceChannel.members.array().length > 1) && this.userSounds[newMember.id] && !newMember.guild.voiceConnection){
        this.util.playSound(newMember.voiceChannel, this.basic.sound_path + "/" + this.util.soundData[this.userSounds[newMember.id].sound].file, {});
        this.util.logger("Played user sound for " + newMember.user.username + " on " + newMember.guild.name + ":" + newMember.voiceChannel.name);
      }
    }
  }
}

module.exports = new DiscordBot();
