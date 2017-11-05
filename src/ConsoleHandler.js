const Discord = require('discord.js');

class ConsoleHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(command_line, message, sudo_permission) {
    var bot = this.bot;
    var sudo = false;
    if (command_line.startsWith(this.bot.basic.command_prefix)) command_line = command_line.substring(1);
    if (message && command_line.startsWith("console")) command_line = command_line.substring(0, message.content.indexOf(" ") + 1);
    if (!command_line.length) return;
    var command = command_line.split(" ");
    var command_type = command[0];
    if (message){
      console.log(command_line);
      message.reply("\n`CONSOLE: " + command_line + "`")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) bot.messageCleanupQueue.add(msg, 1, true)});
    }
    if (command_type === "sudo"){
      if (sudo_permission || !message){
        sudo = true;
        command = command.slice(1);
        command_type = command[0];
      }else{
        this.consoleLogger("You do not have the ability to use sudo", message);
        return;
      }
    }
    if (command_type === "help"){
      this.consoleLogger("Console Commands:\nhelp\nreboot|restart\nexit|shutdown|stop\n", message);
    }else if (command_type === "stop" || command_type === "exit" || command_type === "shutdown"){
      if (sudo){
        if (message) message.author.send("Shutting Down");
        this.consoleLogger("Shutting Down", message);
        this.bot.destroy().then(function(){
          bot.util.save();
          process.exit(0);
        });
      }else{
        this.consoleLogger("Insufficient privileges, please use sudo", message);
      }
    }else if (command_type === "restart" || command_type === "reboot") {
      if (sudo){
        if (message) message.author.send("Restarting");
        this.consoleLogger("Stopping", message);
        this.bot.destroy().then(function(){
          bot.util.save();
          bot.util.logger("Starting");
          bot.login(bot.config.discord_token).
          then(function(){
            bot.consoleHandler.consoleLogger("Restart Complete", message);
          });
        });
      }else{
        this.consoleLogger("Insufficient privileges, please use sudo", message);
      }
    }else{
      this.consoleLogger("Unknown console command '" + command_type + "'", message);
    }
  }

  consoleLogger(content, message){
    var bot = this.bot;
    if (message) message.channel.send("`CONSOLE: " + this.bot.util.logger(content) + "`")
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) bot.messageCleanupQueue.add(msg, 1, true)});
    else this.bot.util.logger(content);
  }
}

module.exports = ConsoleHandler;
