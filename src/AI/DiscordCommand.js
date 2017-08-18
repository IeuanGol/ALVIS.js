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

    }else if(actionType == "user_sound"){
      var subType = action.split(".")[2];
      if (subType == "assign"){
        var subType2 = action.split(".")[3];
        if (message.channel instanceof Discord.DMChannel){
          message.reply("I'm sorry. I cannot accept sound management tasks from a DM channel.");
          return;
        }
        if (!(message.channel instanceof Discord.TextChannel)){
          message.reply("I'm sorry. I cannot accept sound management tasks from here. Ask me again in a public text channel.")
          return;
        }
        if (subType2 == "self"){
          this.attemptSetUserSoundSelf(message, response);
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
        }else if (subType2 == "others"){
          this.attemptSetUserSoundOthers(message, response);
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
        }else{
          this.defaultHandler(message, response);
        }
      }else if (subType == "remove"){
        var subType2 = action.split(".")[3];
        if (subType2 == "self"){
          this.attemptRemoveUserSoundSelf(message, response);
          if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
        }else if (subType2 == "others"){
          this.attemptRemoveUserSoundOthers(message, response);
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
      var target = this.bot.util.getMemberFromString(message.guild.members, target_username)
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
    if (this.hasRoleManagementAuthority(message.member, role, target)){
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
    if (this.hasRoleManagementAuthority(requester, role)){
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

  hasRoleManagementAuthority(requester, role, target) {
    if (!requester.hasPermission("MANAGE_ROLES")) return false;
    if (requester.highestRole.comparePositionTo(role) <= 0) return false;
    if (target){
      if (requester.highestRole.comparePositionTo(target.highestRole) <= 0) return false;
    }
    return true;
  }

  attemptSetUserSoundSelf(message, response) {
    var discord_bot = this.bot;
    var sound_name = response.result.parameters.sound_name;
    var user = message.member;
    if (this.bot.util.setUserSound(user.id, user.displayName, sound_name)){
      message.reply("Alright, your join sound is now *" + sound_name + "*.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }else{
      message.reply("I can't seem to find that sound.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }
  }

  attemptSetUserSoundOthers(message, response) {
    var discord_bot = this.bot;
    var sound_name = response.result.parameters.sound_name;
    var username = response.result.parameters.username;
    var user = null;
    var mentions = message.mentions.members.array();
    for (var i in mentions){
      var obj = mentions[i];
      if (!obj.user.bot && obj.id != this.bot.user.id) {
        user = obj;
        break;
      }
    }
    if (!user) user = this.bot.util.getMemberFromString(message.guild.members, username);
    if (!user){
      message.reply("I can't seem to find the user you mentioned.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      return;
    }
    if (this.bot.util.isAdmin(message.member)){
      if (this.bot.util.setUserSound(user.id, user.displayName, sound_name)){
        message.reply("Alright, " + user + " now has *" + sound_name + "* as their join sound.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }else{
        message.reply("I can't seem to find that sound.")
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }else{
      message.reply("I'm sorry. You do not have permission to request that change.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }
  }

  attemptRemoveUserSoundSelf(message, response) {
    var discord_bot = this.bot;
    var user = message.member;
    this.bot.util.setUserSound(user.id, user.displayName, null);
    message.reply("Alright, you no longer have a join sound.")
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
  }

  attemptRemoveUserSoundOthers(message, response) {
    var discord_bot = this.bot;
    var username = response.result.parameters.username;
    var user = null;
    var mentions = message.mentions.members.array();
    for (var i in mentions){
      var obj = mentions[i];
      if (!obj.user.bot && obj.id != this.bot.user.id) {
        user = obj;
        break;
      }
    }
    if (!user) user = this.bot.util.getMemberFromString(message.guild.members, username);
    if (!user){
      message.reply("I can't seem to find the user you mentioned.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      return;
    }
    if (this.bot.util.isAdmin(message.member)){
      this.bot.util.setUserSound(user.id, user.displayName, null);
      message.reply("Alright, " + user + " no longer has a join sound.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }else{
      message.reply("I'm sorry. You do not have permission to request that change.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }
  }
}

module.exports = DiscordCommand;
