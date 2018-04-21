const Discord = require('discord.js');

class WeatherUndergound {
  constructor(bot) {
    this.bot = bot;
    this.iconMap = {
      "chancerain": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a91893fc0db6465f5b0/1501305489938/chance+of+rain.png",
      "chancesnow": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a91ff7c503b746ea989/1501305489922/chance+of+snow.png",
      "flurries": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a91ff7c503b746ea989/1501305489922/chance+of+snow.png",
      "chanceflurries": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a91ff7c503b746ea989/1501305489922/chance+of+snow.png",
      "chancestorms": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a91cd0f6846bffc75c3/1501305490076/chance+of+storm.png",
      "cloudy": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a916b8f5bb6b4dee714/1501305490068/cloudy.png",
      "fog": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a916a4963f14f5fa0a2/1501305490136/fog.png",
      "hazy": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a91ebbd1ad69437cc98/1501305490114/haze.png",
      "mostlycloudy": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a927131a5fd5f532d0c/1501305490460/mostly+cloudy.png",
      "mostlysunny": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92f14aa1fbe7871c99/1501305490393/mostly+sunny.png",
      "partlycloudy": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a921b631b24fd765ba0/1501305490511/partly+cloudy.png",
      "partlysunny": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92b3db2bde61cf9b19/1501305490481/partly+sunny.png",
      "rain": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92bebafb1713f2efc6/1501305492571/rain.png",
      "sleet": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92bebafb1713f2efc6/1501305492571/rain.png",
      "chancesleet": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92bebafb1713f2efc6/1501305492571/rain.png",
      "snow": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92893fc0db6465f5b3/1501305491330/snow.png",
      "sunny": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92579fb3656e1354a1/1501305490605/sunny.png",
      "clear": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92579fb3656e1354a1/1501305490605/sunny.png",
      "tstorms": "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/597c1a89b3db2bde61cf9adc/597c1a92be6594cef69ae84f/1501305491491/thunderstorm.png"
    };
  }

  sendConditions(message, custom_content, region1, region2) {
    var iconMap = this.iconMap;
    var server_location = false;
    if (!region1 || !message){
      region1 = "Edmonton";
      region2 = "Alberta";
      server_location = true;
    }
    var conditions_url = "https://api.wunderground.com/api/" + this.bot.config.weather_underground_key + "/conditions/q/";
    var forecast_url = "http://api.wunderground.com/api/" + this.bot.config.weather_underground_key + "/forecast/q/";
    var satellite_url = "http://api.wunderground.com/api/0e1ca3949683c281/animatedradar/animatedsatellite/q/"; ".gif?num=6&delay=50&interval=30";
    region1 = region1.replace(/ /g, "_");
    if (region2){
      region2 = region2.replace(/ /g, "_");
      conditions_url = conditions_url + region2 + "/" + region1 + ".json";
      forecast_url = forecast_url + region2 + "/" + region1 + ".json";
      satellite_url = satellite_url + region2 + "/" + region1 + ".gif";
    }else{
      conditions_url = conditions_url + region1 + ".json";
      forecast_url = forecast_url + region1 + ".json";
      satellite_url = satellite_url + region1 + ".gif";
    }
    var request = require('request');
    var discord_bot = this.bot;
    request(conditions_url, function (error1, response1, body1) {
      var weatherData = JSON.parse(body1);
      if (typeof weatherData === "undefined" || !weatherData.response || weatherData.response.error){
          message.reply("I could not find specific weather results for your query.")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          return;
      }
      if (!weatherData.current_observation){
          message.reply("I found multiple cities matching your query. Can you be more specific?")
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
          return;
      }
      request(forecast_url, function (error2, response2, body2) {
        var forecastData = JSON.parse(body2);
        var today = forecastData.forecast.simpleforecast.forecastday[0];
        var tomorrow = forecastData.forecast.simpleforecast.forecastday[1];
        var embed = new Discord.RichEmbed();
        embed.setTitle("__**" + weatherData.current_observation.display_location.full + "**__");
        embed.addField("Current", weatherData.current_observation.weather + "\n**" + weatherData.current_observation.temp_c + "** °C\nHumidity: " + weatherData.current_observation.relative_humidity + "\nWind: " + weatherData.current_observation.wind_kph + " km/h " + weatherData.current_observation.wind_dir);
        embed.setThumbnail(iconMap[weatherData.current_observation.icon.replace("nt_", "")]);
        embed.addField("Today - " + today.date.weekday_short, today.conditions + "\n**" + today.high.celsius + "** °C | *" + today.low.celsius + "* °C\nPrecipitation: " + today.pop + "%\nHumidity: " + today.avehumidity + "%\nWind: " + today.avewind.kph + " km/h " + today.avewind.dir, true);
        embed.addField("Tomorrow - " + tomorrow.date.weekday_short, tomorrow.conditions + "\n**" + tomorrow.high.celsius + "** °C | *" + tomorrow.low.celsius + "* °C\nPrecipitation: " + tomorrow.pop + "%\nHumidity: " + tomorrow.avehumidity + "%\nWind: " + tomorrow.avewind.kph + " km/h " + tomorrow.avewind.dir, true);
        embed.setColor(parseInt(discord_bot.colours.weather_underground_embed_colour));
        embed.setFooter("Results courtesy of Weather Underground | ©2018 The Weather Company LLC | " + weatherData.current_observation.observation_time, weatherData.current_observation.image.url);
        embed.setURL(weatherData.current_observation.ob_url);
        embed.setImage(satellite_url);
        if (custom_content){
          var message_heading = custom_content;
        }else{
          if (server_location){
            var message_heading = "Currently, where I am hosted it is " + weatherData.current_observation.weather.toLowerCase() + " and " + weatherData.current_observation.temp_c + " °C. With a forecast high today of " + today.high.celsius + " °C and low of " + today.low.celsius + " °C.";
          } else{
            var message_heading = "Currently in " + weatherData.current_observation.display_location.city + " it is " + weatherData.current_observation.weather.toLowerCase() + " and " + weatherData.current_observation.temp_c + " °C. With a forecast high today of " + today.high.celsius + " °C and low of " + today.low.celsius + " °C.";
          }
        }
        message.reply(message_heading, {"embed": embed})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 10)});
      });
    });
  }
}

module.exports = WeatherUndergound;
