const Discord = require('discord.js');

class MessageCleanupQueue {
  constructor(bot) {
    this.bot = bot;
    this.queue = {};
    var timer;
    this.setTimer(timer, this, 1000);
    this.expired_tags = [];
  }

  add(message, lifetime, delete_on_death, expiration_tags) {
    if (!delete_on_death) {
      delete_on_death = false;
    }else{
      delete_on_death = true;
    }
    var expiration = Math.floor(lifetime * 60000) + new Date().valueOf();
    this.queue[message.id] = {"message": message, "expiration": expiration, "lifetime": lifetime, "delete": delete_on_death};
    if (expiration_tags) {
      this.queue[message.id].expiration_tags = expiration_tags;
    }
  }

  remove(id) {
    delete this.queue[id];
  }

  update() {
    var currentTime = new Date().valueOf();
    for (var k in this.queue){
      var item = this.queue[k];
      if (item.expiration <= currentTime){
        this.cleanupMessage(item);
        delete this.queue[k];
      }else{
        if (item.hasOwnProperty("expiration_tags")){
          for (var l = 0; l < this.expired_tags.length; l++){
            if (item.expiration_tags.includes(this.expired_tags[l])){
              this.cleanupMessage(item, true);
              delete this.queue[k];
              break;
            }
          }
        }
      }
    }
    this.expired_tags = [];
  }

  cleanupMessage(queue_item, force_delete) {
    if (!queue_item.message) return;
    if (queue_item.message.deletable && (queue_item.delete || force_delete)){
      queue_item.message.delete();
    }else if (queue_item.message.editable){
      queue_item.message.edit("`Content removed after " + queue_item.lifetime + " minutes to reduce clutter.`", {"embed": null});
    }else if (queue_item.message.deletable){
      queue_item.message.delete();
      console.log("Error: Message marked for cleanup was not editable; It was deleted instead. Check function usage.");
    }else{
      console.log("Error: Could not modify or delete message marked for cleanup. Check bot permissions on " + queue_item.message.guild.name + ":" + queue_item.message.channel.name);
    }
  }

  expireTag(tag) {
    this.expired_tags.push(tag);
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
