variables = {

  //client variables
  bot_name: "",
  bot_user_id: "",

  blocked: false,
  spamBlocked: false,
  blacklisted: false,
  generated_response: false,

  isReady: false,

  //You can retrieve channel/server/user id values using !channelid, !serverid or !userid commands.

  voiceChannelBlacklist: [
  ],

  userBlacklist: [
    {server: "", user: ""}
  ],

  managerRolesList: [
  ],

  adminRolesList: [
  ],


  requestDictionary: {},

  lastResponse: null,

}

module.exports = variables;
