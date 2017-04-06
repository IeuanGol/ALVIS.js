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
  {server:"123456789012345678", channel:"Voice Channel 1", noExpire:true},//example
  {server:"123456789012345678", channel:"Awesome Voice Channel", noExpire:true}//example
  ],

  userBlacklist: [
  	{server: "123456789012345678", user: "987654321098765432"},//example
  	{server: "123456789012345678", user: "987654321098765432"}//example
  ],

  topClearanceList: [
  	{server: "123456789012345678", user: "987654321098765432"},//example
  	{server: "123456789012345678", user: "987654321098765432"}//example
  ],

  mediumClearanceList: [
  	{server: "123456789012345678", user: "987654321098765432"},//example
  	{server: "123456789012345678", user: "987654321098765432"}//example
  ],


  requestDictionary: {},

  lastResponse: null,

}

module.exports = variables;
