const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');

class DiscordCommand extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    var discord_bot = this.bot;
    var action = response.result.action;
    var actionType = action.split(".")[1];
    if (actionType == "roles"){
      var subType = action.split(".")[2];
      if (subType == "assign_role"){
        var subType2 = action.split(".")[3];
        if (subType2 == "self"){
          this.attemptAssignRoleSelf(message, response);
        }else if (subType2 == "others"){
          this.attemptAssignRoleOthers(message, response);
        }else{
          this.defaultHandler(message, response);
        }

      }else if (subType == "remove_role"){
        var subType2 = action.split(".")[3];
        if (subType2 == "self"){
          this.attemptRemoveRoleSelf(message, response);
        }else if (subType2 == "others"){
          this.attemptRemoveRoleOthers(message, response);
        }else{
          this.defaultHandler(message, response);
        }

      }else{
        this.defaultHandler(message, response);
      }

    }else{
      this.defaultHandler(message, response);
    }
  }

  attemptManageRoleOthers(message, response, intent) {
    var role_name = response.result.parameters["discord-role"];
    var target_username = response.result.parameters.username;
    var mentions = message.mentions.members.array();
    var target = null;
    for (var member in mentions){
      if (!member.user.bot && member.id != this.bot.user.id) {
        target = member;
        break;
      }
    }
    if (!target){
      var target = message.guild.members.find(val => val.displayName == target_username);
    }
    if (!target){
      var target = message.guild.members.find(val => val.user.username == target_username);
    }
    if (!target){
      message.reply("I can't seem to find the user you mentioned.");
      return;
    }
    var role = message.guild.roles.find(var => var.name.toLowerCase() == role_name.toLowerCase());
    if (!role){
      message.reply("I can't seem to find that role.");
      return;
    }
    if (this.hasAuthority(message.member, role, target)){
      if (intent == "add"){
        target.addRole(role);
        message.reply("Alright, I gave **" + role.name + "** role to <@" + target.id + ">.");
      }else if (intent == "remove"){
        target.removeRole(role);
        message.reply("Alright, I took **" + role.name + "** role from <@" + target.id + ">.");
      }
    }else{
      message.reply("I'm sorry. You do not have authority to request that change.");
    }
  }

  attemptManageRoleSelf(message, response, intent) {
    var role_name = response.result.parameters["discord-role"];
    var requester = message.member;
    var target = message.member;
    var role = message.guild.roles.find(var => var.name.toLowerCase() == role_name.toLowerCase());
    if (!role){
      message.reply("I can't seem to find that role.");
      return;
    }
    if (this.hasAuthority(requester, role)){
      if (intent == "add"){
        target.addRole(role);
        message.reply("Alright, I gave you **" + role.name + "** role.");
      }else if (intent == "remove"){
        target.removeRole(role);
        message.reply("Alright, I took away your **" + role.name + "** role.");
      }
    }else{
      message.reply("I'm sorry. You do not have authority to request that change.");
    }
  }

  hasAuthority(requester, role, target) {
    if (!requester.hasPermission("MANAGE_ROLES")) return false;
    if (requester.highestRole.compareTo(role) <= 0) return false;
    if (target){
      if (requester.highestRole.compareTo(target.highestRole) <= 0) return false;
    }
    return true;
  }
}

module.exports = DiscordCommand;
