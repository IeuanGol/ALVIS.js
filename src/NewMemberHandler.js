const Discord = require('discord.js');

class NewMemberHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(newMember) {
    var notificationChannel;
    if (this.bot.config.new_member_announcement_channel){
      notificationChannel = (newMember.guild.channels.find("name", this.bot.config.new_member_announcement_channel) ? newMember.guild.channels.find("name", this.bot.config.new_member_announcement_channel) : newMember.guild.channels.find("name", "general"));
    }else{
      notificationChannel = newMember.guild.channels.find("name", "general");
    }
    var admin_role = newMember.guild.roles.find("name", this.bot.permissions.admin_role);
    var manager_role = newMember.guild.roles.find("name", this.bot.permissions.manager_role);
    var default_role = newMember.guild.roles.find("name", this.bot.permissions.default_role);

    if (this.bot.config.announce_new_members){
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.setThumbnail(newMember.user.avatarURL);
      embed.setAuthor(newMember.guild.name, this.bot.webAssets.packetcloud_icon, this.bot.webAssets.packetCloud_website);
      var embed_content = "I have set up your basic permissions. Feel free to **@mention** or **DM** me for further assistance.\nUse `" + this.bot.basic.command_prefix + "help` for a list of my functions.\n";
      var message_content = "<@" + newMember.id + ">";
      if ((admin_role || manager_role)){
        embed_content += "\n";
        if (this.bot.config.new_member_notify_admins) message_content += " ";
        if (admin_role){
          embed_content += "<@&" + admin_role.id + ">";
          if (this.bot.config.new_member_notify_admins) message_content += "<@&" + admin_role.id + ">";
          if (manager_role){
            embed_content +=  " <@&" + manager_role.id + ">";
            if (this.bot.config.new_member_notify_admins) message_content += " <@&" + manager_role.id + ">";
          }
        }else if (manager_role){
          embed_content += "<@&" + manager_role.id + ">";
          if (this.bot.config.new_member_notify_admins) message_content += "<@&" + manager_role.id + ">";
        }
        embed_content += ", please configure their permissions as needed.";
      }
      embed.addField("Welcome to the server, " + newMember.displayName + "!", embed_content);
      if(notificationChannel) notificationChannel.send(message_content, {embed: embed});
      else this.bot.util.logger("ERROR: Could not announce new member, a valid channel name is not set in the config.");
    }
    if (this.bot.config.welcome_dm){
      //TODO
    }
    if (default_role){
      newMember.addRole(default_role);
      if (this.bot.config.welcome_dm) this.bot.util.logger("Welcomed " + newMember.user.username + " to " + newMember.guild.name + " and gave them " + default_role.name + " role");
      else this.bot.util.logger("Watched " + newMember.user.username + " join " + newMember.guild.name + " and gave them " + default_role.name + " role");
      return;
    }
    if (this.bot.config.welcome_dm) this.bot.util.logger("Welcomed " + newMember.user.username + " to " + newMember.guild.name);
    else this.bot.util.logger("Watched " + newMember.user.username + " join " + newMember.guild.name);
  }

}

module.exports = NewMemberHandler;
