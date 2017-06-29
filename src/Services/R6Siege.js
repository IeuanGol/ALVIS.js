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
    var discord_bot = this.bot;
    var profile_picture_url = "https://ubistatic19-a.akamaihd.net/resource/en-ca/game/rainbow6/siege/R6_logo-6.png";
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
      if (playerData.platform == "uplay"){
        profile_picture_url = "https://uplay-avatars.s3.amazonaws.com/" + playerData.ubisoft_id + "/default_146_146.png";
      }
      var casual = playerData.stats.casual;
      var ranked = playerData.stats.ranked;
      var request2 = require('request');
      request2("https://api.r6stats.com/api/v1/players/" + username + "/seasons?platform=" + platform +"&season=" + currentSeason, function (error2, response2, body2) {
        var seasonData = JSON.parse(body2).seasons;
        var embed = new Discord.RichEmbed();
        embed.setDescription("Rainbow Six Siege - Player Action Report");
        embed.addField(playerData.username, "Level: " + playerData.stats.progression.level + "        Platform: " + playerData.platform);
        if (casual) embed.addField("Casual", "```\nWins:     " + casual.wins + "\nLosses:   " + casual.losses + "\nW/L:      " + casual.wlr + "\nKills:    " + casual.kills + "\nDeaths:   " + casual.deaths + "\nK/D:      " + casual.kd + "\nPlaytime: " + playtime_converter(casual.playtime) + "```", true);
        if (ranked) embed.addField("Ranked", "```\nWins:     " + ranked.wins + "\nLosses:   " + ranked.losses + "\nW/L:      " + ranked.wlr + "\nKills:    " + ranked.kills + "\nDeaths:   " + ranked.deaths + "\nK/D:      " + ranked.kd + "\nPlaytime: " + playtime_converter(ranked.playtime) + "```", true);
        if (seasonData[currentSeason] && seasonData[currentSeason][region]) {
          var season = seasonData[currentSeason][region];
          var rank = rank_converter(season.ranking.rank);
          embed.addField("Season", "```\nRank:     " + rank + "\nWins:     " + season.wins +"\nLosses:   " + season.losses + "\nAbandons: " + season.abandons + "\nSkill:    " + Math.round(season.ranking.mean) + " ± " + season.ranking.stdev + "```", true);
        }
        embed.setThumbnail(profile_picture_url);
        embed.setColor(parseInt(discord_bot.colours.r6stats_embed_colour));
        message.reply("Here you go:", {"embed": embed})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 10)});
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
