const Discord = require('discord.js');

class Wolfram {
  constructor(bot) {
    this.bot = bot;
    this.wolfram_client = require('wolfram').createClient(this.bot.config.wolfram_key);
  }

  sendWolframResponse(message, response, header, colour, show_thumbnail, credit_wolfram, code_box, graph, enlarged_thumbnail) {
    var wolfram_logo = "http://i1.wp.com/seanshadmand.com/wp-content/uploads/2015/02/Wolfram-Alpha-icon.png";
    var wolfram_logo_small = "https://1.f.ix.de/scale/geometry/743x453/q85/download/media/wolfram-alpha-fuer-android-und-ios-93624/wolfram-alpha-fuer-android-und-ios-_1-1-20.png";
    if (!colour) colour = parseInt(this.bot.colours.wolfram_embed_default_colour);
    var embed = new Discord.RichEmbed();
    if (response.result.fulfillment.speech) message.reply(response.result.fulfillment.speech)
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) this.bot.messageCleanupQueue.add(msg, 0.5, true)});
    var discord_bot = this.bot;
    this.wolfram_client.query(response.result.resolvedQuery, function(err, result) {
      if (err){
        console.log(err);
        return;
      }
      if (result.length > 0){
        var thumbnail = "";
        var image = "";
        var image_set = false;
        var thumbnail_set = false;
        for (var i = 0; i < result.length; i++){
          var a = result[i];
          var first = true;
          var has_value = false;
          var section_content = "";
          for (var j = 0; j < a.subpods.length; j++){
            var b = a.subpods[j];
            var title = a.title.toLowerCase();
            if ((a.title == "Image" || a.title == "Images") && show_thumbnail && !thumbnail_set && first){
              if (b.image != ""){
                if (enlarged_thumbnail){
                  first = false;
                  image = b.image;
                  image_set = true;
                }else{
                  first = false;
                  thumbnail = b.image;
                  thumbnail_set = true;
                }
              }
            }else if (a.title == "Result" && show_thumbnail && !thumbnail_set && first){
              if (b.image != ""){
                if (enlarged_thumbnail){
                  first = false;
                  image = b.image;
                  image_set = true;
                }else{
                  first = false;
                  thumbnail = b.image;
                  thumbnail_set = true;
                }
              }
            }else if ((title == "plot" || title.includes("plots") || title.includes("3d plot") || title.includes("visual representation")) && graph && !image_set && first){
              if (b.image != ""){
                first = false;
                image = b.image;
                image_set = true;
              }
            }
            if (b.value != "" && section_content.length + b.value.length < 1024 - 10){
              if (first){
                if (code_box) section_content = "```\n";
                first = false;
              }
              has_value = true;
              section_content = (section_content + b.value + "\n").replace(/~~/g, "~");
            }
          }
          if (has_value == true){
            if (code_box) section_content += "```";
            embed.addField(a.title, section_content);
          }
        }
        if (show_thumbnail && thumbnail_set){
          embed.setThumbnail(thumbnail)
        }else if (credit_wolfram){
          embed.setThumbnail(wolfram_logo);
        }
        if (image_set){
          embed.setImage(image);
        }
        embed.setColor(colour);
        embed.setFooter("Results courtesy of Wolfram Alpha | ©2017 Wolfram Alpha LLC", wolfram_logo_small);
        message.reply(header, {"embed": embed, "split": true})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 10)});
      }else{
        message.reply("I could not secure any concrete knowledgebase about the subject.");
      }
    });
  }
}

module.exports = Wolfram;
