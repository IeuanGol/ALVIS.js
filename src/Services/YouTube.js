const Discord = require('discord.js');
const fs = require('fs');
const http = require('http');
const ytdl = require('ytdl-core');
const request = require('request');


class YouTube {
  constructor(bot) {
    this.bot = bot;
    var config = this.bot.config;
  }

  startStreamWithEmbed(message, voiceChannel, url, options) {
    var youtube_logo = "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/5a7924f9ec212d6f77b8cefa/5a792553ec212d6f77b8e356/1517888926673/yt_icon_rgb.png?format=750w";
    var discord_bot = this.bot;
    var service = this;
    ytdl.getInfo(url, options, function(err, data) {
      if (err){
        message.author.send(err.message);
        return;
      }
      var duration = data.length_seconds;
      var duration_minutes = Math.floor(duration/60);
      var duration_seconds = ("0" + Math.floor(duration - 60*duration_minutes)).slice(-2);
      var embed = new Discord.RichEmbed()
      .setAuthor("Now playing in #" + message.member.voiceChannel.name + ":")
      .setTitle( "**" + data.title + "**")
      .setDescription("*__["+data.author.name+"]("+data.author.channel_url+")__*\n`" + duration_minutes + ":" + duration_seconds + "`")
      .setThumbnail(data.thumbnail_url)
      .setURL(data.video_url)
      .setColor(parseInt(discord_bot.colours.youtube_embed_colour))
      .setFooter("Playing from YouTube | ©2018 YouTube", youtube_logo);
      message.channel.send("", {"embed": embed}).then((msg) => {
        if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, duration/60, true, ["currentlyplaying" + msg.guild.id]);
        discord_bot.util.attachMediaControlReactions(msg);
      });
      service.startStream(voiceChannel, url, options);
    });
  }

  startStream(voiceChannel, url, options) {
    var discord_bot = this.bot;
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (voiceChannel == null || url == null) return;
    var dispatchers = this.bot.basic.dispatchers;
    if (voiceChannel.guild.voiceConnection) return;
    voiceChannel.join().then((connection) => {
  		var stream = ytdl(url, {filter: 'audioonly'});
  		dispatchers[voiceChannel.guild.id] = connection.playStream(stream, stream_options);
      connection.on('error', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        dispatchers[voiceChannel.guild.id].end();
      });
  		dispatchers[voiceChannel.guild.id].on('end', () => {
        connection.disconnect();
      });
  	}).catch((error) => {
      this.logger("An error occured in stream playback:");
      console.log(error.message);
      voiceChannel.leave();
    });
  }

  getVideoInfo(url, options, callback) {
    ytdl.getInfo(url, options, callback);
  }

  validateURL(url) {
    return ytdl.validateURL(url);
  }

  getVideoMP3DownloadURL(message, url) {
    var discord_bot = this.bot;
    var youtube_logo = "https://static1.squarespace.com/static/590a3b36893fc0d31893235d/5a7924f9ec212d6f77b8cefa/5a792553ec212d6f77b8e356/1517888926673/yt_icon_rgb.png?format=750w";
    var RESOLUTIONS = ["1080p", "720p", "480p", "360p", "144p"];
    var VIDEO_CONTAINER = "mp4";
    var AUDIO_CONTAINER = "m4a";
    ytdl.getInfo(url, null, function(err, data) {
      if (err){
        message.author.send(err.message);
        return;
      }
      var duration = data.length_seconds;
      var duration_minutes = Math.floor(duration/60);
      var duration_seconds = ("0" + Math.floor(duration - 60*duration_minutes)).slice(-2);
      var formats = data.formats;
      var videoResolution = null;
      var videoDL = null;
      var audioDL = null;
      var audioFound = false;
      var videoFound = false;
      for (var a = 0; a < RESOLUTIONS.length; a++){
        var res = RESOLUTIONS[a];
        for (var i = 0; i < formats.length; i++){
          var format = formats[i];
          if (format.resolution == res && format.container == VIDEO_CONTAINER){
            videoFound = true;
            videoResolution = format.resolution;
            videoDL = format.url;
            break;
          }
        }
        if (videoFound) break;
      }
      for (var j = 0; j < formats.length; j++){
        format = formats[j];
        if (format.container == AUDIO_CONTAINER && format.resolution == null){
          audioFound = true;
          audioDL = format.url;
          break;
        }
      }
      var embed = new Discord.RichEmbed()
      .setTitle( "**" + data.title + "**")
      .setDescription("*__["+data.author.name+"]("+data.author.channel_url+")__*\n`" + duration_minutes + ":" + duration_seconds + "`")
      .setThumbnail(data.thumbnail_url)
      .setURL(data.video_url)
      .setColor(parseInt(discord_bot.colours.youtube_embed_colour))
      .setFooter("Hosted on YouTube | ©2018 YouTube", youtube_logo);
      if (audioFound && videoFound){
        embed.addField("Download Link:", "[VIDEO ("+ videoResolution + ", " + VIDEO_CONTAINER + ")](" + videoDL + ")");
        embed.addField("\u200B", "[AUDIO (" + AUDIO_CONTAINER + ")](" + audioDL + ")");
      }else if (audioFound){
        embed.addField("Download Link:", "[AUDIO (" + AUDIO_CONTAINER + ")](" + audioDL + ")");
      }else if (videoFound){
        embed.addField("Download Link:", "[VIDEO ("+ videoResolution + ", " + VIDEO_CONTAINER+")](" + videoDL + ")");
      }else{
        embed.addField("Download Link:", "*None found*");
      }
      message.reply("", {"embed": embed}).then((msg) => {
        if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 3, true);
      });
    });
  }

}

module.exports = YouTube;
