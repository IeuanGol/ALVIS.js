const Discord = require('discord.js');

class MessageCleanupQueue {
  constructor(bot) {
    this.bot = bot;
    this.queue = {};
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
      if (this.queue[k].expiration <= currentTime){
        if (this.queue[k].message){
          if (this.queue[k].message.deletable && this.queue[k].delete){
            this.queue[k].message.delete();
          }else if (this.queue[k].message.editable){
            this.queue[k].message.edit("`Content deleted after " + this.queue[k].lifetime + " minutes to reduce clutter.`");
          }
        }
        delete this.queue[k];
      }
    }
  }
}

module.exports = MessageCleanupQueue;
