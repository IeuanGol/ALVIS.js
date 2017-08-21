const Discord = require('discord.js');

class NewMemberHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(newMember) {
    var defaultChannel = newMember.guild.defaultChannel;
    var admin_role = newMember.guild.roles.find("name", this.bot.permissions.admin_role);
    var manager_role = newMember.guild.roles.find("name", this.bot.permissions.manager_role);
    var default_role = newMember.guild.roles.find("name", this.bot.permissions.default_role);

    var embed = new Discord.RichEmbed();
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    embed.setThumbnail(newMember.user.avatarURL);
    var embed_content = "I have set up your basic permissions. Feel free to **@mention** or **DM** me for further assistance.\nUse **" + this.bot.basic.command_prefix + "help** for a list of commands.\n";
    var message_content = "<@" + newMember.id + ">";
    if (admin_role || manager_role){
      embed_content += "\n";
      message_content += " ";
      if (admin_role){
        embed_content += "<@&" + admin_role.id + ">";
        message_content += "<@&" + admin_role.id + ">";
        if (manager_role){
            embed_content +=  " <@&" + manager_role.id + ">";
            message_content += " <@&" + manager_role.id + ">";
        }
      }else if (manager_role){
        embed_content += "<@&" + manager_role.id + ">";
        message_content += "<@&" + manager_role.id + ">";
      }
      embed_content += ", please configure their role as needed.";
    }
    embed.addField("Welcome to the server, " + newMember.displayName + "!", embed_content);
    defaultChannel.send(message_content, {embed: embed});
    if (default_role){
      newMember.addRole(default_role);
      this.bot.util.logger("Welcomed " + newMember.user.username + " to " + newMember.guild.name + " and gave them " + default_role.name + " role");
      return;
    }
    this.bot.util.logger("Welcomed " + newMember.user.username + " to " + newMember.guild.name);
  }

}

module.exports = NewMemberHandler;
