const Discord = require('discord.js');

class MessageCleanupQueue {
  constructor(bot) {
    this.bot = bot;
    this.queue = {};
    var timer;
    this.setTimer(timer, this, 10000);
  }

  add(message, lifetime, delete_on_death) {
    if (!delete_on_death) {
      delete_on_death = false;
    }else{
      delete_on_death = true;
    }
    var expiration = Math.floor(lifetime * 60000) + new Date().valueOf();
    this.queue[message.id] = {"message": message, "expiration": expiration, "lifetime": lifetime, "delete": delete_on_death};
  }

  remove(id) {
    delete this.queue[id];
  }

  update() {
    var currentTime = new Date().valueOf();
    for (var k in this.queue){
      var item = this.queue[k];
      if (item.expiration <= currentTime){
        if (item.message){
          if (item.message.deletable && item.delete){
            item.message.delete();
          }else if (item.message.editable){
            item.message.edit("`Content deleted after " + item.lifetime + " minutes to reduce clutter.`");
          }else if (item.message.deletable){
            item.message.delete();
            console.log("Error: Message marked for cleanup was not editable; It was deleted instead. Check function usage.");
          }else{
            console.log("Error: Could not modify or delete message marked for cleanup. Check bot permissions on " + item.message.guild.name + ":" + item.message.channel.name);
          }
        }
        delete this.queue[k];
      }
    }
  }

  setTimer(timerVariable, queueVariable, timerPeriod) {
    timerVariable = setInterval(function(){queueVariable.timerUpdateFunction(queueVariable)}, timerPeriod);
  }

  deleteTimer(timerVariable) {
    clearTimeout(timerVariable);
  }

  timerUpdateFunction(queueVariable) {
    queueVariable.update();
  }
}

module.exports = MessageCleanupQueue;
