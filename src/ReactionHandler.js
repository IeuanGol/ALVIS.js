const Discord = require('discord.js');

class ReactionHandler {
  constructor(bot) {
    this.bot = bot;
    this.REPORT_THRESHOLD = this.bot.config.message_report_threshold;
  }

  handle(messageReaction, user) {
    var discord_bot = this.bot;
    if (!messageReaction.message.channel instanceof Discord.TextChannel) return;
    var emoji = messageReaction.emoji.name;

    if (user.id != discord_bot.user.id && messageReaction.me){
      if (emoji === "🔁"){
        //TODO
      }else if (emoji === "⏮"){
        //TODO
      }else if (emoji === "⏯"){
        if (messageReaction.message.guild.voiceConnection && messageReaction.message.guild.members.get(user.id).voiceChannel){
          if (messageReaction.message.guild.voiceConnection.channel.id == messageReaction.message.guild.members.get(user.id).voiceChannelID){
            if (discord_bot.basic.dispatchers[messageReaction.message.guild.id].paused){
              discord_bot.util.resumeDispatcher(messageReaction.message.guild.id);
              discord_bot.util.logStandardCommand(messageReaction.message, "resume", user);
            }else if (!discord_bot.basic.dispatchers[messageReaction.message.guild.id].paused){
              discord_bot.util.pauseDispatcher(messageReaction.message.guild.id);
              discord_bot.util.logStandardCommand(messageReaction.message, "pause", user);
            }
          }
        }
      }else if (emoji === "⏹"){
        if (messageReaction.message.guild.voiceConnection && messageReaction.message.guild.members.get(user.id).voiceChannel){
          if (messageReaction.message.guild.voiceConnection.channel.id == messageReaction.message.guild.members.get(user.id).voiceChannelID){
            discord_bot.util.endDispatcher(messageReaction.message.guild.id);
            discord_bot.util.logStandardCommand(messageReaction.message, "stop", user);
          }
        }
      }else if (emoji === "⏭"){
        //TODO
      }else if (emoji === "🔀"){
        //TODO
      }else if (emoji === "🔇"){
        if (messageReaction.message.guild.voiceConnection && messageReaction.message.guild.members.get(user.id).voiceChannel){
          if (messageReaction.message.guild.voiceConnection.channel.id == messageReaction.message.guild.members.get(user.id).voiceChannelID){
            if (messageReaction.message.guild.voiceConnection){
              if (messageReaction.message.guild.voiceConnection.dispatcher.volume == 0){
                messageReaction.message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(discord_bot.util.getIntegerVolume()/100);
              }else{
                messageReaction.message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(0);
              }
            }
          }
        }
      }else if (emoji === "🔉"){
        if (messageReaction.message.guild.voiceConnection && messageReaction.message.guild.members.get(user.id).voiceChannel){
          if (messageReaction.message.guild.voiceConnection.channel.id == messageReaction.message.guild.members.get(user.id).voiceChannelID){
            var newVolume = discord_bot.util.decreaseVolume();
            if (messageReaction.message.guild.voiceConnection) messageReaction.message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(newVolume/100);
          }
        }
      }else if (emoji === "🔊"){
        if (messageReaction.message.guild.voiceConnection && messageReaction.message.guild.members.get(user.id).voiceChannel){
          if (messageReaction.message.guild.voiceConnection.channel.id == messageReaction.message.guild.members.get(user.id).voiceChannelID){
            var newVolume = discord_bot.util.increaseVolume();
            if (messageReaction.message.guild.voiceConnection) messageReaction.message.guild.voiceConnection.dispatcher.setVolumeLogarithmic(newVolume/100);
          }
        }
      }else{
        return;
      }
      messageReaction.remove(user);
    }else if (user.id != discord_bot.user.id){
      if (emoji === "REPORT" && messageReaction.count >= this.REPORT_THRESHOLD && this.REPORT_THRESHOLD != -1){
        if (messageReaction.message.author.id != discord_bot.user.id){
          messageReaction.message.author.send("Your post was flagged by numerous users and automatically removed from " + messageReaction.message.channel + ".\nPlease try to post content that is more channel-appropriate.");
          discord_bot.util.logger("Removed post flagged as 'flag' on " + messageReaction.message.guild.name + ":" + messageReaction.message.channel.name + " by " +  messageReaction.message.author.username + " and notified them about it.");
          messageReaction.message.delete();
        }
      }else if (emoji === "REPORT_SHITPOST" && messageReaction.count >= this.REPORT_THRESHOLD && this.REPORT_THRESHOLD != -1){
        if (messageReaction.message.author.id != discord_bot.user.id){
          messageReaction.message.author.send("Your post was labeled a 'shitpost' by numerous users and automatically removed from " + messageReaction.message.channel + ".\nPlease try to post content that is more channel-appropriate.");
          discord_bot.util.logger("Removed post flagged as 'shitpost' on " + messageReaction.message.guild.name + ":" + messageReaction.message.channel.name + " by " +  messageReaction.message.author.username + " and notified them about it.");
          messageReaction.message.delete();
        }
      }else if (emoji === "REPORT_REPOST" && messageReaction.count >= this.REPORT_THRESHOLD && this.REPORT_THRESHOLD != -1){
        if (messageReaction.message.author.id != discord_bot.user.id){
          messageReaction.message.author.send("Your post was labeled a 'repost' by numerous users and automatically removed from " + messageReaction.message.channel + ".\nPlease try to avoid posting content that was recently posted by another user.");
          discord_bot.util.logger("Removed post flagged as 'repost' on " + messageReaction.message.guild.name + ":" + messageReaction.message.channel.name + " by " +  messageReaction.message.author.username + " and notified them about it.");
          messageReaction.message.delete();
        }
      }
    }
  }
}

module.exports = ReactionHandler;
