const Discord = require('discord.js');

class DefaultResponse {
  constructor(bot){
    this.bot = bot;
    this.util = this.bot.util;
  }

  handle(message, response) {
    this.defaultHandler(message, response);
  }

  defaultHandler(message, response) {
    var discord_bot = this.bot;
    if (response.result.fulfillment.speech !== ""){
      message.reply(response.result.fulfillment.speech);
    }else{
      if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
      message.reply("I am unable to respond to your `" + response.result.action + "` query at this time. Perhaps this feature is still in development.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      this.bot.util.logger("Default Query Response was unable to handle " + response.result.action + " query from " + message.author.username);
    }
  }

  disabledServiceHandler(message, service) {
    var embed = new RichEmbed();
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    embed.setThumbnail(this.bot.webAssets.packetcloud_icon);
    embed.setTitle("PacketCloud™");
    embed.setDescription("[Documentation](" + this.bot.webAssets.alvis_github_readme + ")\n[GitHub](" + this.bot.webAssets.alvis_github + ")\n[Website](" + this.bot.webAssets.packetcloud_website + ")")
    embed.setURL(this.bot.webAssets.packetcloud_website);
    var discord_bot = this.bot;
    if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
    message.reply("My **" + service + "** service module is not currently active. I am unable to respond to your request.\nServices can be enabled by providing required API or service credentials in my configuration files.\nContact my developers for more information:", {"embed": embed})
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    this.bot.util.logger("Was unable to properly handle " + response.result.action + " query from " + message.author.username + " because the " + service + " service is not active.");
  }
}

module.exports = DefaultResponse;
