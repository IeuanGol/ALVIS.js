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
        if (message.channel instanceof Discord.DMChannel){
          message.reply("I'm sorry. I cannot accept server managment tasks from a DM channel.");
          return;
        }
        if (!(message.channel instanceof Discord.TextChannel)){
          message.reply("I'm sorry. I cannot accept server managment tasks from here. Ask me again in a public text channel.")
          return;
        }
        if (subType2 == "self"){
          this.attemptManageRoleSelf(message, response, "add");
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
        }else if (subType2 == "others"){
          this.attemptManageRoleOthers(message, response, "add");
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
        }else{
          this.defaultHandler(message, response);
        }

      }else if (subType == "remove_role"){
        var subType2 = action.split(".")[3];
        if (subType2 == "self"){
          this.attemptManageRoleSelf(message, response, "remove");
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
        }else if (subType2 == "others"){
          this.attemptManageRoleOthers(message, response, "remove");
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
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
    var discord_bot = this.bot;
    var role_name = response.result.parameters["discord-role"];
    var target_username = response.result.parameters.username;
    var mentions = message.mentions.members.array();
    var target = null;
    for (var i in mentions){
      var member = mentions[i];
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
      message.reply("I can't seem to find the user you mentioned.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      return;
    }
    var role = message.guild.roles.find(obj => obj.name.toLowerCase() == role_name.toLowerCase());
    if (!role){
      message.reply("I can't seem to find that role.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      return;
    }
    if (this.hasAuthority(message.member, role, target)){
      if (intent == "add"){
        if (target.roles.find("name", role.name)){
          message.reply("<@" + target.id + "> already has **" + role.name + "** role.")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          return;
        }
        target.addRole(role);
        message.reply("Alright, I gave **" + role.name + "** role to <@" + target.id + ">.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }else if (intent == "remove"){
        if (!target.roles.find("name", role.name)){
          message.reply("<@" + target.id + "> does not have **" + role.name + "** role.")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          return;
        }
        target.removeRole(role);
        message.reply("Alright, I took **" + role.name + "** role from <@" + target.id + ">.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }else{
      message.reply("I'm sorry. You do not have authority to request that change.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }
  }

  attemptManageRoleSelf(message, response, intent) {
    var discord_bot = this.bot;
    var role_name = response.result.parameters["discord-role"];
    var requester = message.member;
    var target = message.member;
    var role = message.guild.roles.find(obj => obj.name.toLowerCase() == role_name.toLowerCase());
    if (!role){
      message.reply("I can't seem to find that role.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      return;
    }
    if (this.hasAuthority(requester, role)){
      if (intent == "add"){
        if (target.roles.find("name", role.name)){
          message.reply("You already have **" + role.name + "** role.")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          return;
        }
        target.addRole(role);
        message.reply("Alright, I gave you **" + role.name + "** role.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }else if (intent == "remove"){
        if (!target.roles.find("name", role.name)){
          message.reply("You do not have **" + role.name + "** role.")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          return;
        }
        target.removeRole(role);
        message.reply("Alright, I took away your **" + role.name + "** role.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }else{
      message.reply("I'm sorry. You do not have authority to request that change.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }
  }

  hasAuthority(requester, role, target) {
    if (!requester.hasPermission("MANAGE_ROLES")) return false;
    if (requester.highestRole.comparePositionTo(role) <= 0) return false;
    if (target){
      if (requester.highestRole.comparePositionTo(target.highestRole) <= 0) return false;
    }
    return true;
  }
}

module.exports = DiscordCommand;
