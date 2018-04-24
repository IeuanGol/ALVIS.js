# **ALVIS.js**
**Discord bot, by [PacketCloud™](https://packetcloud.com)**  
*Version: 0.7.8*  
## Description
**ALVIS** (**A**synchronous **L**earning **V**irtual **I**ntelligence **S**ystem) is a server management and utility bot built for the voice and text chat service, *[Discord](https://discordapp.com)*. It utilizes Google's [DialogFlow](https://dialogflow.com) servers to introduce natural language request processing to the bot. Allowing for communication in plain English - not just commands. We are constantly expanding ALVIS' modules, features and knowledge base. We also have plans to add voice support in the future.  

## Setting Up The Bot
Before the bot will run, you must first set up a few values in the config files:
### Requirements:
You must have a Discord bot token and Google API.AI key for an agent with proper Intents and Entities.
Please [contact us](https://packetcloud.com/about) if you need further information about the API.AI agent.  
You will also need a Wolfram API key, though in the future this will be changed to be *optional*; adding support for Wolfram knowledgebase lookup in chat bot functionality. There will also be more modules like this to come; which will also be optional.

### Tokens:
Enter your Discord bot token, API.AI agent key, and Wolfram API key into the config JSON file (*./config/config.json*).

### User Permissions:
In the permissions JSON file (*./config/permissions.json*), add the names of the roles on your Discord server(s) that you want associated to bot permissions.
People with *manager_role* will be allowed to use all bot commands, *admin_role* grants administrative commands.  
The *default_role* is the name of the role you want the bot to assign all new users. This one is optional.

## Bot Commands
### Public Commands
**About**  
Displays bot information.  
`!about`   

**Help**  
Displays list of available commands.  
`!help`  

**Pause**  
Pauses audio playback.  
`!pause`  

**Play**  
Plays audio from the provided YouTube video URL or searches Google Play Music for query and starts playback of best track result. Resumes paused playback if no arguments are provided.  
`!play [YouTube_URL|search_query...]`  

**Play Music**  
Plays specific or random song matching provided search criteria.  
*'?' lists songs matching search criteria.*  
`!playmusic [song_name|[-|&]tag [...]|? [[-|&]tag [...]]]`  

**Play Sound**  
Plays specific or random sound matching provided search criteria.  
*'?' lists sounds matching search criteria.*  
`!playsound [sound_name|[-|&]tag [...]|? [[-|&]tag [...]]`   

**Resume**  
Resumes paused audio playback.  
`!resume`  

**Song Info**  
Displays information about a song. Admins can edit the tags and artists.  
`!songinfo <song_name> [edits ...]`  

**Sound Info**  
Displays information about a sound. Admins can edit the tags and artists.  
 `!soundinfo <sound_name> [edits ...]`  

**Stop**  
Stops audio playback on voice channel.  
 `!stop`  
 
 **YouTube Download**  
 Provides download links for the YouTube video at the URL provided.  
 `!ytdl <YouTube_URL>`  

### Admin Commands
**Add Song**  
Adds any attached audio files to the local music library.  
*Adding 'force' argument will overwrite existing songs with same name.*  
`!addsong [force] [info ...]`  

**Add Sound**  
Adds any attached audio files to the local sounds library.  
*Adding 'force' argument will overwrite existing sounds with same name.*  
`!addsound [force] [info ...]`  

**Console**  
Executes command in colsole.  
`!console <command> [parameters ...]`  

**Remove Song**  
Deletes a song from the local library.  
`!removesong <song_name>`  

**Remove Sound**  
Deletes a sound from the local library.  
`!removesound <sound_name>`  

**Show User Sounds**  
Lists users with their user sounds.  
`!showusersounds`  

### Manager Commands
**Purge Music**  
Removes all songs from the local library.  
`!purgemusic <confirmation>`  

**Purge Sounds**  
Removes all sounds from the local library.  
`!purgesounds <confirmation>`  

**Set Bot Activity**  
Sets the bot's currently displayed activity.  
`!setbotactivity [activity_name] [activity_type] [twitch_stream_url]`  

**Set Bot Avatar**  
Sets the bot's avatar to 'avatar.png' in the assets folder.   
`!setbotavatar`  

**Set Bot Status**  
Sets the bot's status.  
`!setbotstatus [online|idle|invisibile|dnd]`  

**Update Music**  
Attempts to add all files in *./music* folder to the local library under their filenames. Removes any songs not found on disk from the library.  
*Does not overwrite.*  
`!updatemusic`  

**Update Sounds**  
Attempts to add all files in *./sounds* folder to the local library under their filenames. Removes any sounds not found on disk from the library.  
*Does not overwrite.*  
`!updatesounds`  

*Note:
To run commands, enter them into any text channel the bot has access to. Certain commands also work in Direct Messages with the bot.*

## Changing Settings
You can change bot settings manually in the configuration files within the 'config' folder.
Please do not mess with other files unless you know what you are doing.

## Adding Sounds
You can add music and sounds simply by adding audio files to the 'music' and 'sounds' directories. They must be in a format supported by Discord; we recommend MP3 or WAV.
New audio must then be added to the sound or music library with `!addsound` or `!addmusic` commands.
Alternatively, you can add all audio in the respective folders to the library with `!addallsounds` or `!addallmusic`, but then the audio file names will be used (instead of custom ones).
`!purgesounds` or `!purgemusic` can be used to clear the database.

## Project Details
**Organization:**  
[PacketCloud](https://packetcloud.com)  

**Authors:**  
Adrian Schuldhaus  
Lucas Ciula  
Cody Mendoza  

**Repository:**  
[GitHub](https://github.com/packetcloud/alvis)  

**License:**  
Type: MIT  
(see [LICENSE file](https://github.com/PacketCloud/ALVIS/blob/master/LICENSE))  

**Credited Dependencies:**  
Discord.js:  
  We use the [Discord Node.js API](https://discord.js.org) for interfacing with Discord's servers.  

DialogFlow:  
  We make use of [Google's DialogFlow](https://dialogflow.com) servers using the [apiai](https://www.npmjs.com/package/apiai) Node.js package. This is used to interface with Google's servers to handle and classify bot chat queries.  

r6stats.com:  
  We send web requests to [api.r6stats.com](https://r6stats.com) to retrieve player stats for [Rainbow Six Siege](https://rainbow6.ubisoft.com).  

playsound:  
  [playsound](https://www.npmjs.com/package/playmusic) Node.js package is used to send search requests to [Google Play Music](https://play.google.com/music/listen) for song lookup and stream URL retrieval, allowing for music playback.  

**Other Dependencies:**  
bufferutil: ^3.0.1  
libsodium: ^0.5.1  
libsodium-wrappers: ^0.5.1  
lowdb: ^0.14.0  
node-opus: ^0.2.2  
opusscript: 0.0.3  
uws: ^0.14.5  
ytdl-core: ^0.14.2  
