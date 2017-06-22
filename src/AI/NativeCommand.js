const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class NativeCommand extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    var action = response.result.action;
    var actionType = action.split(".")[1];
    if (actionType == "flip_coin"){
      this.flip_coin(message);
    }else if (actionType == "pick_number"){
      var subType = action.split(".")[2];
      if (subType == "between"){
        var num1 = parseInt(response.result.parameters.number);
        var num2 = parseInt(response.result.parameters.number1);
        console.log(num1 + " " + num2);
        if (num1 <= num2){
          var min = num1;
          var max = num2
        }else{
          var min = num2;
          var max = num1;
        }
        message.reply("I choose the number " + this.bot.util.getRandomInt(min, max) + ".");
      }else if (subType == "less_than"){
        var max = parseInt(response.result.parameters.number);
        if (max <= 1) {
          message.reply("I choose the number " + (max - this.bot.util.getRandomInt(1, 1000)) + ".");
        }else{
          message.reply("I choose the number " + this.bot.util.getRandomInt(1, max) + ".");
        }
      }else{
        this.defaultHandler(message, response);
      }
    }else if (actionType == "roll_die"){
      this.roll_die(message, response.result.parameters.number);
    }else{
      this.defaultHandler(message, response);
    }
  }

  flip_coin(message) {
    var outcome = ["heads", "tails"];
    message.reply("I flipped " + outcome[this.bot.util.getRandomInt(0, 1)] + ".");
  }

  roll_die(message, sides) {
    sides = parseInt(sides);
    if (isNaN(sides)){
      sides = 6;
    }else{
      sides = Math.round(sides);
    }
    var roll_value = this.bot.util.getRandomInt(1, sides);
    if (roll_value > 10){
      message.reply("I rolled " + roll_value);
    }else{
      message.reply("I rolled a " + roll_value);
    }
  }
}

module.exports = NativeCommand;
