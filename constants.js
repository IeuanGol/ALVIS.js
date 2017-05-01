constants = {

  //settings
  client_token: "<YOUR_DISCORD_TOKEN_HERE>", //Discord bot token
  bot_key: "<YOUR_CLEVERBOT_KEY_HERE>", //cleverbot key
  allowSpam: false, //Controls if spam filter is active
  muteTime: 900000, //Mute command duration (ms)
  command_prefix: '!', //prefix that must preceed a command

  client_game: "by PacketCloud™",

  //paths
  sound_path: './sounds',
  music_path: './music',

  //stream options
  streamOptions: {seek: 0, volume: 1},

  //command list
  cmdList: "  `!about` *Displays bot information.*\n\
  `!channelid` *Returns unique channel identifier.*\n\
  `!displaylogs` *Bot begins logging to target text channel.*\n\
  `!flip` *Flips a coin.*\n\
  `!help` *Lists available commands.*\n\
  `!mute` *Blocks sound commands on a voice channel for 15 minutes.*\n\
  `!playmusic [?|song_name]` *Plays requested or random song. '?' lists available songs.*\n\
  `!playsound [?|sound_name]` *Plays requested or random sound. '?' lists available sounds.*\n\
  `!playstream <Youtube_URL>` *Plays audio from requested youtube video.*\n\
  `!restart` *Reconnects the bot.*\n\
  `!roll` *Rolls a die.*\n\
  `!serverid` *Returns unique server identifier.*\n\
  `!stop` *Stops sound playback on voice channel.*\n\
  `!stopdisplaylogs` *Stops bot from logging to text channels.*\n\
  `!unmute` *Stops 15 minute sound block by !mute command.*\n\n\
  Alternatively you can **@mention** or **DM** me, and we can converse.",

  //bot identity
  about_response: 'Greetings! I am ALVIS (Always Listening Virtual Intelligence System).\n\n\
  I am currently still under development by **PacketCloud** [http://www.packetcloud.com].\n\
  My code is availabe at [https://github.com/packetcloud]\n\
  Please put up with my bugs, as I am still in my early builds.\n\n\
  Type **!help** for commands, or you can **@mention** or **DM** me to converse.\n\nv1.5.4',

  //responses
  spamResponses: {
    1:"Please stop spamming me!",
    2:"Why are you spamming me?",
    3:"Sit in the corner and wait. Bug me again in a few minutes!",
    4:"I'm feeling overused. Please wait a few minutes before using me again.",
    5:"Stop it!",
    6:"Calm down there. Nobody wants to see spam in their chat!",
    7:"Bug me again in a bit!",
    8:"Nobody likes spam.",
    9:"Hey. Stop it with the spam!",
    10:"Cool down. How can you even type that fast?!?!",
    'length':10
  },

  rFunnyResponses: {
    1:"Hahaha! That is hilarious!",
    2:"Lol",
    3:"Haha",
    4:"That is hilarious.",
    5:"That's funny",
    6:"That's great",
    7:"r/funny never fails to entertain",
    8:"spending time on r/funny I see",
    'length':8
  },

  imgurResponses: {
    1:"What is that? What are those? I wish I had eyes.",
    2:"Damn, look at those sexy pixels.... I assume; I don't have eyes.",
    3:"I love imgur.",
    4:"Can someone tell me what it is you're looking at? I don't have eyes.",
    'length':4
  },

  youtubeResponses: {
    1:"Seen it. /s",
    2:"Great video!",
    3:"Wish I could spend my time watching youtube videos! XD",
    4:"If I were human, I'd watch these videos too.",
    'length':4
  },

  //time values
  Sec1: 1000,
  Min1: 60000,
  Min5: 300000,


}

module.exports = constants;
