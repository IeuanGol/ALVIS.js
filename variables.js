variables = {

  //client variables
  bot_name: "",
  bot_user_id: "",

  blocked: false,
  spamBlocked: false,
  blacklisted: false,

  isReady: false,

  //You can retrieve channel/server/user id values using !channelid, !serverid or !userid commands.

  voiceChannelBlacklist: [
  ],

  userBlacklist: [
    {server: "", user: ""}
  ],

  managerRolesList: [
  	{server: "226460261513560065", role: "279448976070279168"}
  ],

  adminRolesList: [
  	{server: "226460261513560065", role: "228312334878113792"}
  ],


  requestDictionary: {},

  log_channel: null,

}

module.exports = variables;
