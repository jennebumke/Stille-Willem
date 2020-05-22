const Discord = require('discord.js');
const authCode = require('./requirements/auth.json');
const MessageHandler = require('./messageHandler.js');
const VoiceHandler = require('./voiceHandler.js');

const client = new Discord.Client();

function getRandomBool(percentage)
{
    return getRandomInt(0,100) <= percentage || message.member.hasPermission('MANAGE_ROLES');
}

client.on("debug", function(info){});
client.on("error", function(error){});
client.on("warn", function(info){});

client.on('ready', () => {
	
});

client.on("disconnect", function(event){
	
});

client.on('guildMemberAdd', (member) => {
	
});

client.on('guildMemberRemove', (member) => {
	
});

client.on("guildMembersChunk", function(members, guild){
	
});

client.on("channelCreate", function(channel){});
client.on("channelDelete", function(channel){});
client.on("channelPinsUpdate", function(channel, time){});
client.on("channelUpdate", function(oldChannel, newChannel){});

client.on("clientUserGuildSettingsUpdate", function(clientUserGuildSettings){});
client.on("clientUserSettingsUpdate", function(clientUserSettings){});

client.on("emojiCreate", function(emoji){});
client.on("emojiDelete", function(emoji){});
client.on("emojiUpdate", function(oldEmoji, newEmoji){});

client.on("guildBanAdd", function(guild, user){});
client.on("guildBanRemove", function(guild, user){});

client.on("guildCreate", function(guild){});
client.on("guildDelete", function(guild){});

client.on("guildMemberAvailable", function(member){});
client.on("guildMemberSpeaking", function(member, speaking){});

client.on("guildUnavailable", function(guild){});
client.on("guildUpdate", function(oldGuild, newGuild){});

client.on("messageDeleteBulk", function(messages){});
client.on("messageReactionRemoveAll", function(message){});

client.on("guildMemberUpdate", function(oldMember, newMember){
	
});

client.on("messageDelete", function(message){
	
});


client.on("messageReactionAdd", function(messageReaction, user){
	
});

client.on("messageReactionRemove", function(messageReaction, user){
	
});


client.on("presenceUpdate", function(oldMember, newMember){
	
});

client.on("reconnecting", function(){});
client.on("resume", function(replayed){});

client.on("roleCreate", function(role){});

client.on("roleDelete", function(role){});
client.on("roleUpdate", function(oldRole, newRole){});

client.on("typingStart", function(channel, user){});
client.on("typingStop", function(channel, user){});

client.on("userNoteUpdate", function(user, oldNote, newNote){});
client.on("userUpdate", function(oldUser, newUser){

});

client.on("voiceStateUpdate", function(oldState, newState){
	VoiceHandler.parseVoiceUpdate(oldState, newState);
});

client.on("messageUpdate", function(oldMessage, newMessage){
	if(oldMessage.content == newMessage.content || newMessage.author.bot) return;
	log(`${FgCyan}(#${newMessage.channel.name}) ${FgYellow}<${newMessage.author.tag}> ${Reset}"`+oldMessage.content+`" ${FgRed}->${Reset} "`+newMessage.content+`"`);
	MessageHandler.isEditGhostPing(oldMessage,newMessage);    
	MessageHandler.parseMessage(newMessage);
});

client.on('message', (message) => {
	if(message.author.bot) return;
	
	MessageHandler.parseMessage(message);
});

client.login(authCode.token);
