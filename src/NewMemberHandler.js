const Discord = require('discord.js');

class NewMemberHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(newMember) {
    var defaultChannel = newMember.guild.defaultChannel;
    var admin_role_id = newMember.guild.roles.find("name", this.bot.permissions.admin_role).id;
    var manager_role_id = newMember.guild.roles.find("name", this.bot.permissions.manager_role).id;
    var default_role_id = newMember.guild.roles.find("name", this.bot.permissions.default_role).id;
    var embed = new Discord.RichEmbed();
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    embed.setThumbnail(newMember.user.avatarURL);
    embed.addField("Welcome to the server, " + newMember.displayName + "!", "I have set up your basic permissions. Feel free to **@mention** or **DM** me for further assistance.\nUse **!help** for a list of commands.\n\n<@&" + admin_role_id + "> <@&" + manager_role_id + ">, please configure their role as needed.");
    defaultChannel.send("<@" + newMember.id + "> " + "<@&" + admin_role_id + "> " + "<@&" + manager_role_id + ">," , {embed: embed});
    if (this.bot.permissions.default_role !== ""){
      var defaultRole = newMember.guild.roles.find("name", this.bot.permissions.default_role).id;
      if (defaultRole){
        newMember.addRole(defaultRole);
        this.bot.util.logger("Welcomed " + newMember.user.username + " to " + newMember.guild.name + " and gave them " + this.bot.permissions.default_role + " role");
        return;
      }
    }
    this.bot.util.logger("Welcomed " + newMember.user.username + " to " + newMember.guild.name);
  }

}

module.exports = NewMemberHandler;
