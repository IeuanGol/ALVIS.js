variables = {

  //client variables
  bot_name: "",
  bot_user_id: "",

  blocked: false,
  spamBlocked: false,
  blacklisted: false,

  //You can retrieve server/role/user id using built-in Discord syntax, or context menus while in developer mode.

  voiceChannelBlacklist: [
  ],

  userBlacklist: [
    {server: "", user: ""}
  ],

  managerRolesList: [
  	{server: "", role: ""}
  ],

  adminRolesList: [
  	{server: "", role: ""}
  ],

  requestDictionary: {},

  log_message: null,

}

module.exports = variables;
