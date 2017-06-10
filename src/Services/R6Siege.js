const Discord = require('discord.js');

class R6Siege {
  constructor(bot) {
    this.bot = bot;
  }

  getStats(message, username, platform) {
    var noplatform = false;
    var region = "ncsa";
    var currentSeason = "6";
    if (!message) return;
    if (!platform){
      platform = "uplay";
      noplatform = true;
    }
    if (!username) return;
    var playtime_converter = this.convertPlaytime;
    var rank_converter = this.convertRank;
    var request = require('request');
    var handler = this;
    request("https://api.r6stats.com/api/v1/players/" + username + "?platform=" + platform, function (error, response, body) {
      var playerData = JSON.parse(body).player;
      if (typeof playerData === "undefined"){
        if (noplatform){
          message.reply("I could not locate player data. Are you sure the username is correct?");
        }else{
          message.reply("I could not locate player data. Are you sure the username is correct? If you are providing a platform, be sure it is also correct.");
        }
        return;
      }
      var casual = playerData.stats.casual;
      var ranked = playerData.stats.ranked;
      var request2 = require('request');
      request2("https://api.r6stats.com/api/v1/players/" + username + "/seasons?platform=" + platform +"&season=" + currentSeason, function (error2, response2, body2) {
        var seasonData = JSON.parse(body2).seasons;
        var replyContent = "Here you go:\n```\nRAINBOW SIX SIEGE - PLAYER ACTION REPORT\n\nPlayer: " + playerData.username + "\nPlatform: " + playerData.platform + "\nDate: " + playerData.updated_at.slice(0, 10) + "\n\n";
        replyContent = replyContent + "Level: " + playerData.stats.progression.level + "\n\n";
        replyContent = replyContent + "Casual:\n    Wins:     " + casual.wins + "\n    Losses:   " + casual.losses + "\n    W/L:      " + casual.wlr + "\n    Kills:    " + casual.kills + "\n    Deaths:   " + casual.deaths + "\n    K/D:      " + casual.kd + "\n    Playtime: " + playtime_converter(casual.playtime) + "\n\n";
        replyContent = replyContent + "Ranked:\n    Wins:     " + ranked.wins + "\n    Losses:   " + ranked.losses + "\n    W/L:      " + ranked.wlr + "\n    Kills:    " + ranked.kills + "\n    Deaths:   " + ranked.deaths + "\n    K/D:      " + ranked.kd + "\n    Playtime: " + playtime_converter(ranked.playtime) + "\n";
        if (seasonData[currentSeason] && seasonData[currentSeason][region]) {
          var season = seasonData[currentSeason][region];
          var rank = rank_converter(season.ranking.rank);
          replyContent = replyContent + "\nSeason:\n    Rank:     " + rank + "\n    Wins:     " + season.wins +"\n    Losses:   " + season.losses + "\n    Abandons: " + season.abandons + "\n    Skill:    " + Math.round(season.ranking.mean) + " ± " + season.ranking.stdev + "\n";
        }
        replyContent = replyContent + "```";
        var Bot = this.bot;
        message.reply(replyContent)
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) handler.bot.messageCleanupQueue.add(msg, 10)});
      });
    });
  }

  convertPlaytime(playtime) {
    var hours = Math.floor(playtime / 3600);
    var minutes = Math.floor((playtime - hours * 3600) / 60);
    var output = hours + "h " + minutes + "m";
    return output;
  }

  convertRank(rank_number) {
    var mapping = ["Unranked", "Copper 4", "Copper 3", "Copper 2", "Copper 1", "Bronze 4", "Bronze 3", "Bronze 2", "Bronze 1", "Silver 4", "Silver 3", "Silver 2", "Silver 1", "Gold 4", "Gold 3", "Gold 2", "Gold 1", "Platinum 3", "Platinum 2", "Platinum 1", "Diamond"];
    return mapping[rank_number];
  }
}

module.exports = R6Siege;
