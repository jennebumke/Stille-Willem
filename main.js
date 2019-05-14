/*
 * Stille Willem discord bot.
 * By Anne Douwe and ZekerMarco and Jenne van den Boom
 */

/**
 * Include necessary files.
 */
const Discord = require('discord.js');
const authCode = require('./auth.json');
const cfg = require('./cfg.json');
const commands = require('./commands.json');
const commandHelp = require('./commandshelp.json');
const fs = require('fs');

const client = new Discord.Client();
const version = '3.2.0';
const prefix = cfg.prefix;
const chance = 2;
/**
 * Get IDs from the config file.
 */
const guildId = cfg.guild;
const kokosnootId = cfg.roles.kokosnoot;
const gekoloniseerdId = cfg.roles.gekoloniseerd;
const inhetzonnetjeId = cfg.roles.inhetzonnetje;
const stamkroegverbodId = cfg.roles.stamkroegverbod;
const emoteloosId = cfg.roles.emoteloos;
const makkersId = cfg.roles.makkers;
const internationalId = cfg.roles.international;
const schandpaalId = cfg.channels.schandpaal;
const moderatieId = cfg.channels.moderatiezaken;
const logChannelId = cfg.channels.log;
const englishChannelId = cfg.channels.english;
const Reset = "\x1b[0m"
const Bright = "\x1b[1m"
const Dim = "\x1b[2m"
const Underscore = "\x1b[4m"
const Blink = "\x1b[5m"
const Reverse = "\x1b[7m"
const Hidden = "\x1b[8m"

const FgBlack = "\x1b[30m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"
const FgMagenta = "\x1b[35m"
const FgCyan = "\x1b[36m"
const FgWhite = "\x1b[37m"

const BgBlack = "\x1b[40m"
const BgRed = "\x1b[41m"
const BgGreen = "\x1b[42m"
const BgYellow = "\x1b[43m"
const BgBlue = "\x1b[44m"
const BgMagenta = "\x1b[45m"
const BgCyan = "\x1b[46m"
const BgWhite = "\x1b[47m"

/**
 * Get default durations from config file.
 */
const kokosnootDuration = cfg.defaultduration.kokosnoot;
const gekoloniseerdDuration = cfg.defaultduration.gekoloniseerd;
const inhetzonnetjeDuration = cfg.defaultduration.inhetzonnetje;
const stamkroegverbodDuration = cfg.defaultduration.stamkroegverbod;
const emoteloosDuration = cfg.defaultduration.emoteloos;

/**
 * Initialize variables.
 */
let guild;
let botId;
let kokosnootRole, gekoloniseerdRole, inhetzonnetjeRole, stamkroegverbodRole, emoteloosRole, makkersRole, internationalRole;
let schandpaalChannel, moderatieChannel, logChannel;

/**
 * Define rolesDb array and assign roles.json to it.
 */
let rolesDb = [];
if (fs.existsSync('./roles.json')) {
    rolesDb = JSON.parse(fs.readFileSync('./roles.json'));
}

/**
 * Used to write to the roles.json file.
 */
['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((m) => {
    rolesDb[m] = function () {
        Array.prototype[m].apply(rolesDb, arguments);
        fs.writeFileSync('./roles.json', JSON.stringify(rolesDb));
    }
});


/**
 * Adds an entry to the role database
 *
 * @param {Role} role Role to add to the databse
 * @param {GuildMember} member Member who got the role
 * @param {String} reason Reason for the role
 * @param {Date} startTime Start time for the role
 * @param {Date} endTime Expiration time for the role
 * @param {GuildMember} punisher Member who gave the role
 * @param {Boolean} isInternational If the member is international or not
 * @param {String} announcement Announcement message ID
 */
function addToRolesDb(role, member, reason, startTime, endTime, punisher, isInternational, announcement) {
    rolesDb.push({
        role: role.id,
        member: member.id,
        reason: reason,
        startTime: startTime,
        endTime: endTime,
        punisher: punisher.id,
        isInternational: isInternational,
        announcement: announcement
    });
}

/**
 * Function used to format the date. Adds a 0 in front. if the parameter < 10.
 *
 * @param {Number} n Number to format
 * @returns Formatted number or string
 */
function path(n) {
    return n < 10 ? '0' + n : n;
}

/**
 * Formats the date.
 *
 * @param {Date} date Date to format.
 * @returns String that contains the formatted date.
 */
function formatDate(date) {
    return `${path(date.getHours())}:${path(date.getMinutes())} op ${path(date.getDate())}-${path(date.getMonth() + 1)}-${path(date.getFullYear())}`;
};

/**
 * Creates a discord rich embed for announcing the role
 *
 * @param {User} user User who gave the role
 * @param {GuildMember} member Member who received the role
 * @param {String} text Text to display as subtitle
 * @param {Date} time Expiration time for the role
 * @param {Color} color Color of the announcement
 * @param {String} reason Reason for giving the role
 *
 * @returns Discord rich embed representing the announcement for the role
 */
function getAnnouncement(user, member, text, time, color, reason) {
    const announcement = new Discord.RichEmbed();
    announcement.setTimestamp();
    announcement.setTitle('Zeg Makker');
    announcement.setThumbnail(member.user.avatarURL);
    announcement.setColor(color);
    announcement.setAuthor(user.username, user.displayAvatarURL);
    announcement.setDescription(text);

    if (time === 'inf') {
        announcement.addField('Tot', 'Onbepaalde eindtijd');
    }
    else {
        announcement.addField('Tot', formatDate(time));
    }

    if (reason) {
        announcement.addField('Reden', reason);
    }

    return announcement;
}

/**
 * Creates and returns a discord rich embed used for command logging
 *
 * @param {User} user User that used the command
 * @param {String} command Command that was used
 * @param {GuildChannel} channel Channel that the command was used in
 *
 * @returns Discord rich embed representing a command log
 */
function getCommandLog(user, command, channel) {
    const logMessage = new Discord.RichEmbed();
    logMessage.setTimestamp();
    logMessage.setDescription(`${user} heeft een commando gebruikt in ${channel}`);
    logMessage.addField('Commando', command);
    logMessage.setAuthor(user.tag, user.displayAvatarURL);
    logMessage.setColor([225, 225, 0]);

    return logMessage;
}

/**
 * Creates and returns a discord rich embed for logging when a user takes a role
 * from a guild member.
 *
 * @param {User} user User that took the role
 * @param {GuildMember} member Member that the role was taken from
 * @param {Role} role Role that was taken
 *
 * @returns Discord rich embed
 */
function getFreeLog(user, member, role) {
    const freeMessage = new Discord.RichEmbed();
    freeMessage.setTimestamp();
    freeMessage.setDescription(`${user} heeft de ${role} rol van ${member.user} afgenomen.`);
    freeMessage.setAuthor(user.tag, user.displayAvatarURL);
    freeMessage.setColor('GREEN');

    return freeMessage;
}

/**
 * Creates and returns a discord rich embed for logging potential errors.
 *
 * @param {User} user User that used the command that threw an error
 * @param {String} command Command that threw an error
 * @param {String} error Error that was thrown
 *
 * @returns Discord rich embed
 */
function getErrorLog(user, command, error) {
    const errorMessge = new Discord.RichEmbed();
    errorMessge.setTimestamp();
    errorMessge.setDescription(`Error bij het uitvoeren van een commando door ${user}`);
    errorMessge.addField('Commando', command);
    errorMessge.addField('Error', error);
    errorMessge.setAuthor(user.tag, user.displayAvatarURL);
    errorMessge.setColor([225, 0, 0]);

    return errorMessge;
}

/**
 * Sends a message to a channel.
 *
 * @param {GuildChannel} channel Channel to send the message to
 * @param {String} message Message to send
 */
function sendMessage(channel, message) {
    channel.send(message).catch((err) => {
        console.error(`Error sending message to ${channel.name}: `, err);
    });
}

/**
 * Sends an error message to a channel. Error messages are deleted after 10
 * seconds.
 *
 * @param {GuildChannel} channel Channel to send the message to
 * @param {String} message Message to send
 */
function sendErrorMessage(channel, message) {
    channel.send(message).then((msg) => {
        setTimeout(() => {
            msg.delete().catch((err) => {
                console.error(`Could not delete message with ID ${msg.id}: `, err);
            });
        }, 10 * 1000);
    }).catch((err) => {
        console.error(`Error sending message to ${channel.name}: `, err);
    });
}

/**
 * Searches for a role with the specified role ID.
 *
 * @param {Guild} guild Guild to find the role from
 * @param {String} roleId Role ID to find the role from
 *
 * @returns The role with specified role ID
 */
function getRole(guild, roleId) {
    newRole = guild.roles.find((role) => {
        if (roleId === role.id) {
            return role;
        }
    });

    if (!newRole) {
        log(`Error: could not find role with ID ${roleId}`);
    }

    return newRole;
}

/**
 * Searches for a role with the specified name.
 * CURRENTLY UNUSED
 *
 * @param {Guild} guild Guild to find the role from
 * @param {String} roleName Role name to search for
 *
 * @returns Role with specified name
 */
function getRoleFromName(guild, roleName) {
    newRole = guild.roles.find((role) => {
        if (roleName === role.name) {
            return role;
        }
    });

    if (!newRole) {
        log(`Error: could not find role with neme ${roleName}`);
    }

    return newRole;
}

/**
 * Finds a channel with specified channel ID.
 *
 * @param {Guild} guild Guild to search channel from
 * @param {String} channelId Channel ID to search for
 *
 * @returns Channel with specified ID
 */
function getChannel(guild, channelId) {
    newChannel = guild.channels.find((channel) => {
        if (channelId === channel.id) {
            return channel;
        }
    });

    if (!newChannel) {
        log(`Error: could not find channel with ID ${channelId}`);
    }

    return newChannel;
}

/**
 * Searches for a member by tag.
 *
 * @param {Guild} guild Guild to search tag from
 * @param {String} memberTag Tag to search for
 *
 * @returns Member with specified tag
 */
function getMemberFromTag(guild, memberTag) {
    newMember = guild.members.find((member) => {
        if (memberTag === member.user.tag) {
            return member;
        }
    });

    if (!newMember) {
        log(`Error: could not find member with tag ${memberTag}`);
    }

    return newMember;
}

/**
 * Searches for a member by ID.
 *
 * @param {Guild} guild Guild to search ID from
 * @param {String} memberId ID to search for
 *
 * @returns Member with specified ID
 */
function getMemberFromId(guild, memberId) {
    newMember = guild.members.find((member) => {
        if (memberId === member.id) {
            return member;
        }
    });

    if (!newMember) {
        log(`Error: could not find member with ID ${memberId}`);
    }

    return newMember;
}

/**
 * Checks if a member has a certain role.
 *
 * @param {GuildMember} member Member to check role for
 * @param {String} roleId Role to check for
 *
 * @returns {Boolean} Whether the member has the role
 */
function hasRole(member, roleId) {
    return member.roles.filter((role) => {
        return roleId === role.id;
    }).first();
}

/**
 * Adds a role to a member.
 *
 * @param {GuildMember} member Member to give role to
 * @param {Role} role Role to give
 */
function addRole(member, role) {
    member.addRole(role).then(() => {
        log(`Added ${role.name} for member ${member.user.tag} with ID ${member.id}`);
    }).catch((err) => {
        console.error(`Error adding ${role.name} for member ${member.user.tag} with ID ${member.id}`, err);
    });
}

/**
 * Removes a role from a member.
 *
 * @param {GuildMember} member Member to take role from
 * @param {Role} role Role to take
 */
function removeRole(member, role) {
    member.removeRole(role).then(() => {
        log(`Removed ${role.name} for member ${member.user.tag} with ID ${member.id}`);
    }).catch((err) => {
        console.error(`Error removing ${role.name} for member ${member.user.tag} with ID ${member.id}`, err);
    });
}

/**
 * Returns the default duration for the specified role in hours. If the role is a
 * string and therefore a timestamp, it calculates the default duration from the
 * timestamp.
 *
 * @param {Role} role Role to get the default duration from
 *
 * @returns The default duration of a role in hours.
 */
function getDefaultDuration(role) {
    const roleId = role.id;
    let duration;

    switch (roleId) {
        case kokosnootId:
            duration = kokosnootDuration;
            break;
        case gekoloniseerdId:
            duration = gekoloniseerdDuration;
            break;
        case inhetzonnetjeId:
            duration = inhetzonnetjeDuration;
            break;
        case stamkroegverbodId:
            duration = stamkroegverbodDuration;
            break;
        case emoteloosId:
            duration = emoteloosDuration;
            break;
    }

    if (typeof duration === 'string') {
        return calculateDurationFromTimestamp(duration);
    }
    else {
        return duration;
    }
}

/**
 * Genarates and returns a random integer between the specified numbers. Both
 * numbers are inclusive.
 *
 * @param {Number} min Minimum number (inclusive)
 * @param {Number} max Maximum number (inclusive)
 *
 * @returns Random number between min and max (inclusive)
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Every 10 seconds, checks for all members in the roles database if the role
 * has expired. If it has, removes the role and adds back Makkers or International.
 * If the role is Kokosnoot, Gekoloniseerd or Stamkroegverbod, the freedom
 * is announced in the announcement channel.
 * The announcement for giving the role is then removed and the entry is
 * removed from the roles database.
 * Finally, sends a log message to the log channel.
 */
setInterval(() => {
    rolesDb.forEach((item, index, all) => {
	//log((new Date(item.endTime)).getTime()-2400);
	//log((new Date()).getTime());
        if ((new Date(item.endTime)).getTime()-2400 <= (new Date()).getTime()) {
	    if (item.reason == "spam")
	    {
		client.channels.get(item.role).setRateLimitPerUser(0);
		found = true;
            	all.splice(index, 1);
		return;
	    }
            const member = getMemberFromId(guild, item.member);
            const isInternational = item.isInternational;
            let announceFreedom = false;
            let giveBackRole = false;
            let role;

            switch (item.role) {
                case kokosnootId:
                    removeRole(member, kokosnootRole);
                    role = kokosnootRole;
                    announceFreedom = true;
                    giveBackRole = true;
                    break;
                case gekoloniseerdId:
                    removeRole(member, gekoloniseerdRole);
                    role = gekoloniseerdRole;
                    announceFreedom = true;
                    giveBackRole = true;
                    break;
                case stamkroegverbodId:
                    removeRole(member, stamkroegverbodRole);
                    role = stamkroegverbodRole;
                    announceFreedom = true;
                    break;
                case inhetzonnetjeId:
                    removeRole(member, inhetzonnetjeRole);
                    role = inhetzonnetjeRole;
                    break;
                case emoteloosId:
                    removeRole(member, emoteloosRole);
                    role = emoteloosRole;
                    break;
		default:
		    log('tried to remove Unkonw Role ID');
		    break;
            }

            if (giveBackRole) {
                if (isInternational) {
                    addRole(member, internationalRole);
                }
                else {
                    addRole(member, makkersRole);
                }
            }

            if (announceFreedom) {
                schandpaalChannel.send(`Zeg Makker, ${member.user} is weer onafhankelijk verklaard!`).then((message) => {
                    setTimeout(() => {
                        message.delete().catch((err) => {
                            console.error(`Could not delete message with ID ${message.id}: `, err);
                        });;
                    }, 60 * 1000);
                }).catch((err) => {
                    console.error("Error posting message to announcement channel: ", err);
                    sendMessage(logChannel, getErrorLog(getMemberFromId(guild, botId).user, "Geen", `Het bevrijdingsbericht kon niet in de schandpaal gestuurd worden.`));
                });
            }

            schandpaalChannel.fetchMessage(item.announcement).then((message) => {
                message.delete().catch((err) => {
                    console.error(`Could not delete message with ID ${message.id}: `, err);
                });;
            }).catch((err) => {
                console.error("Error deleting announcement: ", err);
                sendMessage(logChannel, getErrorLog(getMemberFromId(guild, botId).user, "Geen", `De announcement kon niet verwijderd worden.`));
            });

            all.splice(index, 1);
            sendMessage(logChannel, getFreeLog(getMemberFromId(guild, botId).user, member, role));
        }
    });
}, 10 * 1000);

/**
 * Ready event, triggers when the bot is loaded and logged in.
 * Defines guild, role and channel variables.
 */
client.on('ready', () => {
    guild = client.guilds.find((guild) => {
        return guild.id === guildId;
    });

    botId = client.user.id;

    kokosnootRole = getRole(guild, kokosnootId);
    gekoloniseerdRole = getRole(guild, gekoloniseerdId);
    inhetzonnetjeRole = getRole(guild, inhetzonnetjeId);
    stamkroegverbodRole = getRole(guild, stamkroegverbodId);
    emoteloosRole = getRole(guild, emoteloosId);
    makkersRole = getRole(guild, makkersId);
    internationalRole = getRole(guild, internationalId);

    schandpaalChannel = getChannel(guild, schandpaalId);
    moderatieChannel = getChannel(guild, moderatieId);
    logChannel = getChannel(guild, logChannelId);

    log(`Logged in as ${client.user.tag}`);
});

/**
 * Triggers when a member is added to the guild.
 * Gives back the role they had if they are still in the roles database.
 * Removes Makkers and International if applicable.
 */
client.on('guildMemberAdd', (member) => {
    rolesDb.forEach((item, index, all) => {
        if (member.id == item.member) {
            const role = getRole(guild, item.role);

            addRole(member, role);
            if (role == kokosnootRole || role == gekoloniseerdRole) {
                removeRole(member, makkersRole);
                removeRole(member, internationalRole);
            }
        }
    });
});

/**
 * Triggers when a member is removed from the guild.
 * Posts a message in the mod channel indicating that the user has left with
 * a punishment role.
 */
client.on('guildMemberRemove', (member) => {
    rolesDb.forEach((item, index, all) => {
        if (member.id == item.member && (item.role == kokosnootId || item.role == gekoloniseerdId)) {
            sendMessage(moderatieChannel, `${member} heeft de server met een strafrol verlaten! De rol was ${getRole(guild, item.role).name}.`);
        }
    });
});

// guildMembersChunk
/* Emitted whenever a chunk of guild members is received (all members come from the same guild).
PARAMETER      TYPE                      DESCRIPTION
members        Array<GuildMember>        The members in the chunk
guild          Guild                     The guild related to the member chunk    */
client.on("guildMembersChunk", function(members, guild){
    console.error(`a chunk of guild members is received`);
});

// channelCreate
/* Emitted whenever a channel is created.
PARAMETER    TYPE        DESCRIPTION
channel      Channel     The channel that was created    */
client.on("channelCreate", function(channel){
    log(`channelCreate: ${channel}`);
});

// channelDelete
/* Emitted whenever a channel is deleted.
PARAMETER   TYPE      DESCRIPTION
channel     Channel   The channel that was deleted    */
client.on("channelDelete", function(channel){
    log(`channelDelete: ${channel}`);
});

// channelPinsUpdate
/* Emitted whenever the pins of a channel are updated. Due to the nature of the WebSocket event, not much information can be provided easily here - you need to manually check the pins yourself.
PARAMETER    TYPE         DESCRIPTION
channel      Channel      The channel that the pins update occurred in
time         Date         The time of the pins update    */
client.on("channelPinsUpdate", function(channel, time){
    log(`channelPinsUpdate: ${channel}:${time}`);
});
    
// channelUpdate
/* Emitted whenever a channel is updated - e.g. name change, topic change.
PARAMETER        TYPE        DESCRIPTION
oldChannel       Channel     The channel before the update
newChannel       Channel     The channel after the update    */
client.on("channelUpdate", function(oldChannel, newChannel){
    log(`channelUpdate -> a channel is updated - e.g. name change, topic change`);
});

// clientUserGuildSettingsUpdate
/* Emitted whenever the client user's settings update.
PARAMETER                  TYPE                       DESCRIPTION
clientUserGuildSettings    ClientUserGuildSettings    The new client user guild settings    */
client.on("clientUserGuildSettingsUpdate", function(clientUserGuildSettings){
    log(`clientUserGuildSettingsUpdate -> client user's settings update`);
});

// clientUserSettingsUpdate
/* Emitted when the client user's settings update.
PARAMETER             TYPE                  DESCRIPTION
clientUserSettings    ClientUserSettings    The new client user settings    */
client.on("clientUserSettingsUpdate", function(clientUserSettings){
    log(`clientUserSettingsUpdate -> client user's settings update`);
});

// debug
/* Emitted for general debugging information.
PARAMETER    TYPE         DESCRIPTION
info         string       The debug information    */
client.on("debug", function(info){
    //log(`debug -> ${info}`);
});

// disconnect
/* Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect.
PARAMETER    TYPE              DESCRIPTION
Event        CloseEvent        The WebSocket close event    */
client.on("disconnect", function(event){
    log(`The WebSocket has closed and will no longer attempt to reconnect`);
});

// emojiCreate
/* Emitted whenever a custom emoji is created in a guild.
PARAMETER    TYPE          DESCRIPTION
emoji        Emoji         The emoji that was created    */
client.on("emojiCreate", function(emoji){
    log(`a custom emoji is created in a guild`);
});

// emojiDelete
/* Emitted whenever a custom guild emoji is deleted.
PARAMETER    TYPE         DESCRIPTION
emoji        Emoji        The emoji that was deleted    */
client.on("emojiDelete", function(emoji){
    log(`a custom guild emoji is deleted`);
});

// emojiUpdate
/* Emitted whenever a custom guild emoji is updated.
PARAMETER    TYPE       DESCRIPTION
oldEmoji     Emoji      The old emoji
newEmoji     Emoji      The new emoji    */
client.on("emojiUpdate", function(oldEmoji, newEmoji){
    log(`a custom guild emoji is updated`);
});

// error
/* Emitted whenever the client's WebSocket encounters a connection error.
PARAMETER    TYPE     DESCRIPTION
error        Error    The encountered error    */
client.on("error", function(error){
    log(`client's WebSocket encountered a connection error: ${error}`);
});

// guildBanAdd
/* Emitted whenever a member is banned from a guild.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that the ban occurred in
user         User          The user that was banned    */
client.on("guildBanAdd", function(guild, user){
    log(`a member is banned from a guild`);
});

// guildBanRemove
/* Emitted whenever a member is unbanned from a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that the unban occurred in
user         User         The user that was unbanned    */
client.on("guildBanRemove", function(guild, user){
    log(`a member is unbanned from a guild`);
});

// guildCreate
/* Emitted whenever the client joins a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The created guild    */
client.on("guildCreate", function(guild){
    log(`the client joins a guild`);
});

// guildDelete
/* Emitted whenever a guild is deleted/left.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that was deleted    */
client.on("guildDelete", function(guild){
    log(`the client deleted/left a guild`);
});

// guildMemberAvailable
/* Emitted whenever a member becomes available in a large guild.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that became available    */
client.on("guildMemberAvailable", function(member){
    log(`member becomes available in a large guild: ${member.tag}`);
});

// guildMemberSpeaking
/* Emitted once a guild member starts/stops speaking.
PARAMETER     TYPE                DESCRIPTION
member        GuildMember         The member that started/stopped speaking
speaking      boolean             Whether or not the member is speaking    */
client.on("guildMemberSpeaking", function(member, speaking){
    log(`a guild member starts/stops speaking: ${member.tag}`);
});
// guildMemberUpdate
/* Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the update
newMember    GuildMember        The member after the update    */
client.on("guildMemberUpdate", function(oldMember, newMember){
    if(oldMember.nickname != newMember.nickname)
    {
	log(`${FgYellow}<${oldMember.user.tag}> ${FgCyan} formerly known as "${oldMember.nickname}" changed their nickname to "${newMember.nickname}"`);
    }
    else
    {
        //log(`a guild member changes - i.e. new role, removed role, nickname.`);
    }
});

// guildUnavailable
/* Emitted whenever a guild becomes unavailable, likely due to a server outage.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that has become unavailable    */
client.on("guildUnavailable", function(guild){
    console.error(`a guild becomes unavailable, likely due to a server outage: ${guild}`);
});

// guildUpdate
/* Emitted whenever a guild is updated - e.g. name change.
PARAMETER     TYPE      DESCRIPTION
oldGuild      Guild     The guild before the update
newGuild      Guild     The guild after the update    */
client.on("guildUpdate", function(oldGuild, newGuild){
    console.error(`a guild is updated`);
});


// messageDelete
/* Emitted whenever a message is deleted.
PARAMETER      TYPE           DESCRIPTION
message        Message        The deleted message    */
client.on("messageDelete", function(message){
    if(message.channel.id != logChannelId && message.author.tag != client.user.tag)
    {
	log(`${FgRed}(#${message.channel.name}) <${message.author.tag}> deleted: ${message.content}${Reset}`);
    }
});

// messageDeleteBulk
/* Emitted whenever messages are deleted in bulk.
PARAMETER    TYPE                              DESCRIPTION
messages     Collection<Snowflake, Message>    The deleted messages, mapped by their ID    */
client.on("messageDeleteBulk", function(messages){
    log(`messages are deleted -> ${messages}`);
});

// messageReactionAdd
/* Emitted whenever a reaction is added to a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that applied the emoji or reaction emoji     */
client.on("messageReactionAdd", function(messageReaction, user){
    log(`${FgCyan}(${messageReaction.message.channel.name}) ${FgYellow}${user.tag} added a reaction to "${messageReaction.message.content}"${Reset}`);
});

// messageReactionRemove
/* Emitted whenever a reaction is removed from a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that removed the emoji or reaction emoji     */
client.on("messageReactionRemove", function(messageReaction, user){
    log(`${FgCyan}(${messageReaction.message.channel.name}) ${FgRed}${user.tag} removed a reaction from ${FgYellow}"${messageReaction.message.content}"${Reset}`);
});

// messageReactionRemoveAll
/* Emitted whenever all reactions are removed from a message.
PARAMETER          TYPE           DESCRIPTION
message            Message        The message the reactions were removed from    */
client.on("messageReactionRemoveAll", function(message){
    console.error(`all reactions are removed from "${message}"`);
});

// presenceUpdate
/* Emitted whenever a guild member's presence changes, or they change one of their details.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the presence update
newMember    GuildMember        The member after the presence update    */
client.on("presenceUpdate", function(oldMember, newMember){
    //log(`a guild member's presence changes`);
});

// reconnecting
/* Emitted whenever the client tries to reconnect to the WebSocket.    */
client.on("reconnecting", function(){
    //log(`client tries to reconnect to the WebSocket`);
});

// resume
/* Emitted whenever a WebSocket resumes.
PARAMETER    TYPE          DESCRIPTION
replayed     number        The number of events that were replayed    */
client.on("resume", function(replayed){
    //log(`whenever a WebSocket resumes, ${replayed} replays`);
});

// roleCreate
/* Emitted whenever a role is created.
PARAMETER    TYPE        DESCRIPTION
role         Role        The role that was created    */
client.on("roleCreate", function(role){
    log(`a role is created`);
});

// roleDelete
/* Emitted whenever a guild role is deleted.
PARAMETER    TYPE        DESCRIPTION
role         Role        The role that was deleted    */
client.on("roleDelete", function(role){
    log(`a guild role is deleted`);
});

// roleUpdate
/* Emitted whenever a guild role is updated.
PARAMETER      TYPE        DESCRIPTION
oldRole        Role        The role before the update
newRole        Role        The role after the update    */
client.on("roleUpdate", function(oldRole, newRole){
    log(`a guild role is updated`);
});

// typingStart
/* Emitted whenever a user starts typing in a channel.
PARAMETER      TYPE            DESCRIPTION
channel        Channel         The channel the user started typing in
user           User            The user that started typing    */
client.on("typingStart", function(channel, user){
    //log(`${user.tag} has started typing`);
});

// typingStop
/* Emitted whenever a user stops typing in a channel.
PARAMETER       TYPE           DESCRIPTION
channel         Channel        The channel the user stopped typing in
user            User           The user that stopped typing    */
client.on("typingStop", function(channel, user){
    //log(`${user.tag} has stopped typing`);
});

// userNoteUpdate
/* Emitted whenever a note is updated.
PARAMETER      TYPE          DESCRIPTION
user           User          The user the note belongs to
oldNote        String        The note content before the update
newNote        String        The note content after the update    */
client.on("userNoteUpdate", function(user, oldNote, newNote){
    log(`a member's note is updated`);
});

// userUpdate
/* Emitted whenever a user's details (e.g. username) are changed.
PARAMETER      TYPE        DESCRIPTION
oldUser        User        The user before the update
newUser        User        The user after the update    */
client.on("userUpdate", function(oldUser, newUser){
    if(oldUser.username != newUser.username)
    {
	log(`${FgYellow}<${oldUser.tag}> ${FgCyan} formerly known as "${oldUser.tag}" changed their nickname to "${newUser.tag}"`);
    }
    else
    {
        //log(`user's details (e.g. username) are changed`);
    }
});

// voiceStateUpdate
/* Emitted whenever a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
PARAMETER    TYPE             DESCRIPTION
oldMember    GuildMember      The member before the voice state update
newMember    GuildMember      The member after the voice state update    */
client.on("voiceStateUpdate", function(oldMember, newMember){
    if(newMember.voiceChannelID != undefined && oldMember.voiceChannelID != newMember.voiceChannelID)
    {
        log(`${FgBlue}(${newMember.voiceChannel}) ${FgYellow}<${newMember.user.tag}> ${FgGreen}joined${Reset}`);
    }
    else if(oldMember.voiceChannelID != newMember.voiceChannelID)
    {
        log(`${FgBlue}(${newMember.voiceChannel}) ${FgYellow}<${newMember.user.tag}> ${FgRed}left${Reset}`);
    }
    else if(oldMember.serverMute != newMember.serverMute)
    {
        if(newMember.serverMute)
	{
	    log(`${FgBlue}(${newMember.voiceChannel}) ${FgYellow}<${newMember.user.tag}> ${FgRed}is server muted${Reset}`);
	}
	else
	{
	    log(`${FgBlue}(${newMember.voiceChannel}) ${FgYellow}<${newMember.user.tag}> ${FgGreen}is no longer server muted${Reset}`);
	}
    }
    else if(oldMember.selfMute != newMember.selfMute)
    {
        if(newMember.selfMute)
	{
	    log(`${FgBlue}(${newMember.voiceChannel}) ${FgYellow}<${newMember.user.tag}> ${FgRed}muted${Reset}`);
	}
	else
	{
	    log(`${FgBlue}(${newMember.voiceChannel}) ${FgYellow}<${newMember.user.tag}> ${FgGreen}unmuted${Reset}`);
	}
    }
});

// warn
/* Emitted for general warnings. 
PARAMETER    TYPE       DESCRIPTION
info         string     The warning   */
client.on("warn", function(info){
    log(`warn: ${info}`);
});

// messageUpdate
/* Emitted whenever a message is updated - e.g. embed or content change.
PARAMETER     TYPE           DESCRIPTION
oldMessage    Message        The message before the update
newMessage    Message        The message after the update    */
client.on("messageUpdate", function(oldMessage, newMessage){
    if(newMessage.author.bot) return;
    if(newMessage.channel.id != logChannelId && newMessage.author.tag != client.user.tag)
    {
	log(`${FgCyan}(#${newMessage.channel.name}) ${FgYellow}<${newMessage.author.tag}> ${Reset}"`+oldMessage.content+`" ${FgRed}->${Reset} "`+newMessage.content+`"`);
    }
    parseMessage(newMessage);

});

let spamCount = 1;
let lastMsg = "";
let msgTimestamp = (new Date()).getTime();


/**
 * Triggers when a message is sent in any channel where the bot has
 * Read Message permissions.
 * If a message starts with the prefix and the message author has the
 * Manage Roles permission, split the message into arguments, delete it and pass
 * it to handleCommands.
 */
client.on('message', (msg) => {
    if(msg.author.bot) return;
    if(msg.content != "" && msg.content == lastMsg.content && (new Date()).getTime() <= msgTimestamp+4000)
    {
	log(`Spam count: ${spamCount}`);
        spamCount += 1;
	if(spamCount > 3)
	{
	    spamCount = 1;
	    msg.channel.setRateLimitPerUser(5);
            sendMessage(msg.channel, `Zeg makker, doe eens even rustig aan!`);
	    addToRolesDb(msg.channel,msg.author,"spam",(new Date()).getTime(),(new Date()).getTime()+30000,client,false,false);
	}
    }
    else if(msg.content != "" && msg.author.id == msg.author.id && (new Date()).getTime() <= msgTimestamp+1000)
    {
	log(`Spam count: ${spamCount}`);
        spamCount += 1;
	if(spamCount > 6)
	{
	    spamCount = 1;
	    msg.channel.setRateLimitPerUser(5);
            sendMessage(msg.channel, `Zeg makker, doe eens even rustig aan!`);
	    addToRolesDb(msg.channel,msg.author,"spam",(new Date()).getTime(),(new Date()).getTime()+30000,client,false,false);
	}
    }
    else
    {
	spamCount = 1;
    }
    
    if(msg.channel.id != logChannelId && msg.author.tag != client.user.tag)
    {
	if(msg.content != "")
	{
	    log(`${FgCyan}(#${msg.channel.name}) ${FgYellow}<${msg.author.tag}> ${Reset}`+msg.content);
	}
	else
	{
	    var urls = "";
	    msg.attachments.forEach((attachment) => {urls += `${attachment.url} `});
	    log(`${FgCyan}(#${msg.channel.name}) ${FgYellow}<${msg.author.tag}> ${Reset}${urls}`);
	}
    }

    parseMessage(msg);
    msgTimestamp = (new Date()).getTime();
    lastMsg = msg;
});

function parseMessage(msg) {
    if (msg.content.charAt(0) == prefix && (msg.member.hasPermission('MANAGE_ROLES'))) {
        const args = msg.content.slice(prefix.length).split(/ +/);

	validCommand = handleCommands(msg, args);

	if(validCommand) {
            msg.delete().catch((err) => {
                console.error(`Could not delete message with ID ${msg.id}: `, err);
            });
        }
    }
    else if ((/^[W|w]{1}[A|a]{1}[T|t]{1}[?]*$/).test(removeDiacritics(msg.content))) {
        if(getRandomInt(1, chance+2) === chance) {
            msg.react('🍟');
        }
    }
    else if((/([B|b]{1}[E|e]{1}[L|l]{1}[G|g]{1}$|[B|b]{1}[E|e]{1}[L|l]{1}[G|g]{1}[I|i]{1})/).test(removeDiacritics(msg.content))) {
	if(getRandomInt(1, chance) === chance && msg.channel.id != englishChannelId) {
	    if(getRandomInt(1, chance) === chance)
	    {
        	sendMessage(msg.channel, `Makker, het is Zuid Nederlands!`);
	    }
	    else
	    {
            	msg.react('🇧🇪');
	    }
        }
    }
    else if((/([\S]?[K|k]+[^a-zA-Z]?[A|a|E|e]+[^a-zA-Z]?[N|n]+[\S]?[K|k]+[^a-zA-Z]?[E|e]+[^a-zA-Z]?[R|r]+[a-zA-Z]+|[\S][K|k]+[^a-zA-Z]?[A|a|E|e]+[^a-zA-Z]?[N|n]+[\S]?[K|k]+[^a-zA-Z]?[E|e]+[^a-zA-Z]?[R|r]+|^[K|k]+[A|a|E|e]+[^a-zA-Z]?[N|n]+[\S]?[K|k]+[^a-zA-Z]?[E|e]+[^a-zA-Z]?[R|r]+$|[K|k]{1}[^a-zA-Z]?[A|a|E|e]{1}[^a-zA-Z]?[N|n]{1}[^a-zA-Z]?[K|k]{1}[^a-zA-Z]?[E|e]{1}[^a-zA-Z]+[R|r]{1})/).test(removeDiacritics(msg.content))) {
        if(getRandomInt(1, chance) === chance && msg.channel.id != englishChannelId) {
	    if(getRandomInt(1, chance) === chance)
	    {
		msg.react('378555121283629076');
	    }
	    else
	    {
            	msg.react('♋');
	    }
	}
    }
    else if((/^[F|f]{1}$/).test(msg.content)) {
	if(getRandomInt(1, chance) === chance) {
	    if(getRandomInt(1, chance) === chance)
	    {
		sendMessage(msg.channel, `Rip`);
	    }
	    else
	    {
        	msg.react('🇫');
	    }
        }
    }
    else if((/^[Z|z]{1}[E|e]{1}[G|g]{1}$/).test(removeDiacritics(msg.content))) {
	if(getRandomInt(1, chance) === chance) {
	    if(getRandomInt(1, chance+100) === chance)
	    {
		sendMessage(msg.channel, `<@&563463164092612648>`);
	    }
	    else
	    {
        	sendMessage(msg.channel, `Makker`);
	    }
        }
    }
    else if((/^[L|l]{1}[A|a]{1}[P|p]$/).test(removeDiacritics(msg.content))) {
	if(getRandomInt(1, chance) === chance) {
            msg.react('🇸')
                .then(() => msg.react('🇪'))
                .then(() => msg.react('🇬'))
                .then(() => msg.react('🥔'))
                .catch(() => console.error('One of the emojis failed to react.'));
        }
    }
    else if((/^[S|s]{1}[T|t]{1}[I|i]{1}[L|l]{1}[L|l]{1}[E|e]{1}[ ]{1}[W|w]{1}[I|i]{1}[L|l]{1}[L|l]{1}[E|e]{1}[M|m]{1}$/).test(removeDiacritics(msg.content))) {
        if(getRandomInt(1, chance) === chance) {
            sendMessage(msg.channel, `Dat is weliswaar een geuzennaam.`);
        }
    }
}

/**
 * Handles the commands.
 *
 * @param {*} msg The message that was detected.
 * @param {*} args The arguments the message conists of.
 */
function handleCommands(msg, args) {
    sendMessage(logChannel, getCommandLog(msg.author, msg.content, msg.channel));
    validCommand = true;

    switch (args[0]) {
        case 'zeg':
            getZegMessage(msg, args);
            break;
        case 'help':
            if (args.length == 1) {
                displayHelpDialog(msg);
            }
            else {
                displayHelp(msg, args[1]);
            }
            break;

        case 'versie':
            sendMessage(msg.channel, `Versie ${version}`);
            break;
        case 'watwillemweet':
        case 'dbcontents':
            getDbContent(msg, args);
            break;
        case 'maakschoon':
        case 'dbcleanup':
            dbCleanup(msg);
            break;

        case 'kokosnoot':
            giveRole(msg, args, kokosnootRole, true);
            break;
        case 'ontkokosnoot':
            takeRole(msg, args, kokosnootRole, true, true);
            break;
        case 'koloniseer':
            giveRole(msg, args, gekoloniseerdRole, true);
            break;
        case 'ontkoloniseer':
            takeRole(msg, args, gekoloniseerdRole, true, true);
            break;
        case 'stamkroegverbod':
            giveRole(msg, args, stamkroegverbodRole, true);
            break;
        case 'stamkroegtoelating':
            takeRole(msg, args, stamkroegverbodRole, true, true);
            break;
        case 'inhetzonnetje':
            giveRole(msg, args, inhetzonnetjeRole, false);
            break;
        case 'uithetzonnetje':
            takeRole(msg, args, inhetzonnetjeRole, false, false);
            break;
        case 'emoteloos':
            giveRole(msg, args, emoteloosRole, false);
            break;
        case 'emoterijk':
            takeRole(msg, args, emoteloosRole, false, false);
            break;

        case 'tijd':
            sendMessage(msg.channel, `Het commando -tijd wordt niet meer ondersteund. Je kunt nu de tijd veranderen door het commando dat de rol geeft te gebruiken:\nAls Gebruiker#0001 de Kokosnoot rol heeft, dan kan de tijd worden veranderd door \`-kokosnoot @Gebruiker#0001 3u\` te gebruiken.`)
            break;

        default:
	    validCommand = false;
            sendErrorMessage(msg.channel, `Kan commando \`${prefix}${args[0]}\` niet herkennen. Typ \`-help\` voor een lijst met commando's.`);
            sendMessage(logChannel, getErrorLog(msg.author, msg.content, `Commando bestaat niet.`));
    }

    return validCommand;
}

/**
 * Handles the '-zeg' command.
 * First, the optional channel argument is detected and then processed: the ID
 * of the destination channel is set.
 * Then, the message is composed and sent to the desired channel.
 * If no message was given, but the channel argument is present, returns early.
 * If the destination channel doesn't exist in the guild, returns early.
 *
 * @param {*} msg The message that was detected.
 * @param {*} args The arguments the message is composed of.
 */
function getZegMessage(msg, args) {
    let sendToChannel = false;
    let destinationChannelId;
    let destinationChannel;

    if (args.length - 2 > 1 && args[args.length - 2] == '>') {
        sendToChannel = true;
    }
    else if (args.length - 2 == 1 && args[args.length - 2] == '>') {
        sendErrorMessage(msg.channel, `Er is geen bericht meegegeven!`);
        return;
    }
    else if (args[1] == '-zeg') {
        sendErrorMessage(msg.channel, `Geneste -zeg commando's zijn niet toegestaan.`);
        return;
    }

    if (sendToChannel) {
        destinationChannelId = args[args.length - 1].substring(2, args[args.length - 1].length - 1);

        if (msg.guild.channels.has(destinationChannelId)) {
            destinationChannel = getChannel(guild, destinationChannelId);

            if (destinationChannel.id == logChannel.id) {
                sendErrorMessage(msg.channel, `Je kunt geen bericht in het logkanaal plaatsen.`);
                return;
            }
        }
        else {
            sendErrorMessage(msg.channel, `Kan kanaal \`${args[args.length - 1]}\` niet vinden!`);
            return;
        }
    }
    else {
        destinationChannel = msg.channel;
    }

    sendZegMessage(msg, args, destinationChannel, sendToChannel);
}

/**
 * Composes and sends the message to the desired channel.
 *
 * @param {*} msg The message that was detected.
 * @param {*} args The arguments the message is composed of.
 * @param {*} dest The destinationchannel of the message.
 * @param {boolean} toChannel If the channel argument is present or not.
 */
function sendZegMessage(msg, args, dest, toChannel) {
    let output = '';

    for (let i = 1; i < args.length; i++) {
        const el = args[i];

        if (toChannel && i == args.length - 3) {
            output += el;
            break;
        }
        else if (!toChannel && i == args.length - 1) {
            output += el;
            break;
        }
        else {
            output += el + ' ';
        }
    }

    dest.send(output).catch((err) => {
        sendErrorMessage(msg.channel, `Ik heb geen rechten om in ${dest} te praten :(`);
        console.error(`Error sending message: `, err);
        sendMessage(logChannel, getErrorLog(msg.author, msg.content, `De bot heeft geen rechten om in ${dest} te praten.`));
    });
}

/**
 * Shows a help dialog for all commands.
 *
 * @param {*} msg The message that was detected.
 */
function displayHelpDialog(msg) {
    const message =
        `Lijst van commando's:
\`\`\`
-help [commando]
${commands.misc.help}

-zeg <bericht> [> #kanaal]
${commands.misc.zeg}

-versie
${commands.misc.versie}

-kokosnoot <gebruikers> [reden] [tijd|tijdstip]
${commands.rolecommands.kokosnoot}

-ontkokosnoot <gebruikers>
${commands.rolecommands.ontkokosnoot}

-koloniseer <gebruikers> [reden] [tijd|tijdstip]
${commands.rolecommands.koloniseer}

-ontkoloniseer <gebruikers>
${commands.rolecommands.ontkoloniseer}

-stamkroegverbod <gebruikers> [reden] [tijd|tijdstip]
${commands.rolecommands.stamkroegverbod}

-stamkroegtoelating <gebruikers>
${commands.rolecommands.stamkroegtoelating}

-emoteloos <gebruikers> [reden] [tijd|tijdstip]
${commands.rolecommands.emoteloos}

-emoterijk <gebruikers>
${commands.rolecommands.emoterijk}

-inhetzonnetje <gebruikers> [reden] [tijd|tijdstip]
${commands.rolecommands.inhetzonnetje}

-uithetzonnetje <gebruikers>
${commands.rolecommands.uithetzonnetje}

-tijd <gebruikers> <rolnaam> <tijd|tijdstip>
${commands.misc.tijd}

-watwillemweet (alias: -dbcontents)
${commands.databasecommands.dbcontents}

-maakschoon (alias: -dbcleanup)
${commands.databasecommands.dbcleanup}
\`\`\``

    sendMessage(msg.channel, message);
}

/**
 * Shows a help dialog for a specific command.
 *
 * @param {*} msg The message that was detected.
 * @param {*} command The command to show help for.
 */
function displayHelp(msg, command) {
    let foundCommand = false;

    commandHelp.forEach((element) => {
        if (element.command == command) {
            let examples = "";

            element.examples.forEach((ex) => {
                examples += '`' + ex.example + '` - ' + ex.info + '\n';
            });

            sendMessage(msg.channel, `**Commando:** \`-${element.command}\`\n**Functie:** ${element.function}\n**Info:** ${element.info}\n**Gebruik:** \`${element.usage}\`\n**Voorbeelden:**\n${examples}`);
            foundCommand = true;
        }
    });

    if (!foundCommand) {
        sendMessage(msg.channel, `Het commando \`${command}\` bestaat niet. Typ \`-help\` voor een lijst met commando's.`);
    }
}

//******************GIVING A ROLE******************//

/**
 * @param {*} msg
 * @param {*} args
 * @param {*} role
 */
function giveRole(msg, args, role, takeMakkersRole) {
    let members = getMembersFromMessage(msg, args, role, 0);
    let endTime = calculateTime(msg, args, role);
    let reason = getReason(args);
    let hasTime = true;

    if (!members) {
        log("Command was run, but nothing was done.");
        sendMessage
        sendMessage(logChannel, getErrorLog(msg.author, msg.content, `Er waren geen gebruikers om de rol aan te geven.`));
        return;
    }
    else if (!endTime) {
        log("Wrongly specified time.");
        sendMessage(logChannel, getErrorLog(msg.author, msg.content, `De tijd of het tijdstip was niet in het goede formaat.`));
        return;
    }
    else if (endTime == -1) {
        hasTime = false;
        endTime = new Date((new Date()).getTime() + (getDefaultDuration(role) * 60 * 60 * 1000));
    }
    else if (reason === "") {
        reason = false;
    }

    /*********LOGGING*********/
    log("Members:");
    for (let i = 0; i < members.length; i++) {
        const el = members[i];
        log("Tag: " + el.user.tag + " - ID: " + el.id);
    }

    log("End time: " + endTime);
    log("Reason: " + reason);
    /*************************/

    for (let i = 0; i < members.length; i++) {
        const el = members[i];
        let announcement = getAnnouncement(client.user, el, `${el} heeft nu ${role}`, endTime, role.hexColor, reason);
        let isInternational = false;

        if (hasRole(el, role.id)) {
            rolesDb.forEach((item, index, all) => {
                if (el.id == item.member && role.id == item.role) {
                    if (!reason) {
                        reason = item.reason;
                    }
                    if (!hasTime) {
                        endTime = new Date(item.endTime);
                    }

                    announcement = getAnnouncement(getMemberFromId(guild, item.punisher).user, el, `${el} heeft nu ${role}`, endTime, role.hexColor, reason);
                    schandpaalChannel.fetchMessage(item.announcement).then((message) => {
                        message.edit(message.content, announcement);
                    }).catch((err) => {
                        console.error("Error editing announcement: ", err);
                        sendMessage(logChannel, getErrorLog(getMemberFromId(guild, botId).user, "Geen", `De announcement kon niet bewerkt worden.`));
                    });

                    all.splice(index, 1);

                    addToRolesDb(getRole(guild, item.role),
                        getMemberFromId(guild, item.member),
                        reason,
                        item.startTime,
                        endTime,
                        getMemberFromId(guild, item.punisher),
                        item.isInternational,
                        item.announcement
                    );
                }
            });
        }
        else {
            if (hasRole(el, internationalId)) {
                isInternational = true;
            }
            if (role == gekoloniseerdRole && hasRole(el, kokosnootId)) {
                removeRole(el, kokosnootRole);

                rolesDb.forEach((item, index, all) => {
                    if(item.member == el.id && item.role == kokosnootId) {
                        schandpaalChannel.fetchMessage(item.announcement).then((message) => {
                            message.delete().catch((err) => {
                                console.error(`Could not delete message with ID ${message.id}: `, err);
                            });;
                        }).catch((err) => {
                            console.error("Error deleting announcement: ", err);
                            sendMessage(logChannel, getErrorLog(msg.author, msg.content, `De announcement kon niet verwijderd worden.`));
                        });

                        all.splice(index, 1);
                    }
                });
            }

            // Send announcement to channels
            if (msg.channel != schandpaalChannel) {
                sendMessage(msg.channel, announcement);
            }

            schandpaalChannel.send(announcement).then((message) => {
                addToRolesDb(role, el, reason, new Date(), endTime, msg.author, isInternational, message.id);
            }).catch((err) => {
                console.error("Error posting announcement: ", err);
                sendMessage(logChannel, getErrorLog(msg.author, msg.content, `Het announcement kon niet in de schandpaal worden gestuurd.`));
            });

            sendMessage(logChannel, announcement);

            // Add/Remove roles
            addRole(el, role);
            if (takeMakkersRole) {
                if (isInternational) {
                    removeRole(el, internationalRole);
                }
                else {
                    removeRole(el, makkersRole);
                }
            }
        }
    }
}

function getMembersFromMessage(msg, args, role, mode) {
    let tags = getTags(args);
    let members = [];

    if (tags.length == 0) {
        sendErrorMessage(msg.channel, `Er zijn geen gebruikers opgegeven!`);
        return null;
    }

    for (let i = 0; i < tags.length; i++) {
        const el = tags[i];
        // let type;
        let newMember;

        if ((/^.+#\d{4}$/).test(el)) {
            newMember = getMemberFromTag(guild, el);
            // type = 'tag';
        }
        else if ((/^\d{18}$/).test(el)) {
            newMember = getMemberFromId(guild, el);
            // type = 'id';
        }

        if (newMember) {
            if (mode == 0) {//&& !hasRole(newMember, role.id)) {
                members.push(newMember);
            }
            else if (mode == 1 && hasRole(newMember, role.id)) {
                members.push(newMember);
            }
            // else if (mode == 0) {
            //     sendErrorMessage(msg.channel, `Jij dwaas! \`${newMember.user.tag}\` heeft al ${role.name}!`);
            // }
            else if (mode == 1) {
                sendErrorMessage(msg.channel, `Jij dwaas! \`${newMember.user.tag}\` heeft geen ${role.name}!`);
            }
        }
        else {
            sendErrorMessage(msg.channel, `Kan gebruiker \`${el}\` niet vinden.`);
        }
    }

    if (members.length == 0) {
        return null;
    }

    return members;
}

function getTags(args) {
    let tags = [];

    for (let i = 1; i < args.length; i++) {
        const el = args[i];
        if ((/^.+#\d{4}$/).test(el)) {
            log("Found tag: " + el);
            tags.push(el);
        }
        else if ((/^\d{18}$/).test(el)) {
            log("Found ID: " + el);
            tags.push(el);
        }
        else if ((/^<@\d{18}>$/).test(el)) {
            const id = el.substring(2, el.length - 1);
            log("Found ID: " + id);
            tags.push(id);
        }
        else if ((/^<@!\d{18}>$/).test(el)) {
            const id = el.substring(3, el.length - 1);
            log("Found ID: " + id);
            tags.push(id);
        }
        else {
            break;
        }
    }

    return tags;
}

function calculateTime(msg, args, role) {
    let duration = getDuration(msg, args, role);
    let time;

    if (duration == null) {
        return null;
    }
    else if (duration == -1) {
        return -1;
    }
    else {
        time = new Date((new Date()).getTime() + (duration * 60 * 60 * 1000));
    }

    return time;
}

function getDuration(msg, args, role) {
    let useTime = false;
    let useTimestamp = false;
    let time;
    let duration;

    if ((/^[0-9]+[d|u|m|s]{1}$/).test(args[args.length - 1])) {
        useTime = true;
        time = args[args.length - 1];
    }
    else if ((/^[0-9]{1,2}:[0-9]{2}$/).test(args[args.length - 1])) {
        useTimestamp = true;
        time = args[args.length - 1];
    }
    else if ((/[0-9]+[d|u|m|s]{1}/).test(args[args.length - 1])) {
        sendMessage(msg.channel, `\`${args[args.length - 1]}\` is geen geldige tijd.`);
        return null;
    }
    else if ((/[0-9]{0,2}:[0-9]{0,2}$/).test(args[args.length - 1])) {
        sendMessage(msg.channel, `\`${args[args.length - 1]}\` is geen geldige tijd.`);
        return null;
    }

    if (useTime) {
        duration = calculateDuration(time);
    }
    else if (useTimestamp) {
        duration = calculateDurationFromTimestamp(time);
        if(duration == null) {
            sendMessage(msg.channel, `\`${args[args.length - 1]}\` is geen geldige tijd.`);
            return null;
        }
    }
    else {
        // duration = getDefaultDuration(role);
        return -1;
    }

    return duration;
}

function calculateDuration(time) {
    const postfix = time.substring(time.length - 1);
    let duration = time.substring(0, time.length - 1);

    switch (postfix) {
        case 'd':
            return duration * 24;
        case 'u':
            return duration;
        case 'm':
            return duration / 60;
        case 's':
            return duration / 60 / 60;
        default:
            log("Something went wrong :(");
            return 0;
    }
}

function calculateDurationFromTimestamp(timestamp) {
    let args = timestamp.split(':');
    let hours = args[0];
    let minutes = args[1];
    let time = new Date();
    let today = new Date();

    if(hours > 23 || minutes > 59) {
        return null;
    }

    if (today.getHours() == hours && today.getMinutes() >= minutes) {
        time.setDate(today.getDate() + 1);
    }
    else if (today.getHours() > hours) {
        time.setDate(today.getDate() + 1);
    }

    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0);

    return Math.abs(today - time) / 36e5;
}

function getReason(args) {
    let reason = "";
    let hasTime = false;

    if ((/^[0-9]+[d|u|m|s]{1}$/).test(args[args.length - 1]) || (/^[0-9]{1,2}:[0-9]{2}$/).test(args[args.length - 1])) {
        hasTime = true;
    }

    for (let i = 1; i < args.length; i++) {
        const el = args[i];

        if ((/^.+#\d{4}$/).test(el)) {
            continue;
        }
        else if ((/^\d{18}$/).test(el)) {
            continue;
        }
        else if ((/^<@\d{18}>$/).test(el)) {
            continue;
        }
        else if ((/^<@!\d{18}>$/).test(el)) {
            continue;
        }
        else if (hasTime && i == args.length - 1) {
            break;
        }
        else {
            reason += el + ' ';
        }
    }

    return reason.trim();
}
//*******************************//

//***********TAKE ROLE***********//
function takeRole(msg, args, role, giveBackRole, announceFreedom) {
    let members = getMembersFromMessage(msg, args, role, 1);

    if (!members) {
        log("Command was run, but nothing was done.");
        sendMessage(logChannel, getErrorLog(msg.author, msg.content, `Er waren geen gebruikers om de rol van af te nemen.`));
        return;
    }

    for (let i = 0; i < members.length; i++) {
        const el = members[i];
        let found = false;

        // if(el === msg.member) {
        //     sendMessage(msg.channel, `Zeg Makker, je mag jezelf niet bevrijden >:(`);
        //     continue;
        // }

        rolesDb.forEach((item, index, all) => {
            if (el.id == item.member && role.id == item.role) {
                // Add/Remove roles
                removeRole(el, role);

                if (giveBackRole) {
                    if (item.isInternational) {
                        addRole(el, internationalRole);
                    }
                    else {
                        addRole(el, makkersRole);
                    }
                }

                if (announceFreedom) {
                    schandpaalChannel.send(`Zeg Makker, ${el.user} is weer onafhankelijk verklaard!`).then((message) => {
                        setTimeout(() => {
                            message.delete().catch((err) => {
                                console.error(`Could not delete message with ID ${message.id}: `, err);
                            });;
                        }, 60 * 1000);
                    }).catch((err) => {
                        console.error("Error posting message to announcement channel: ", err);
                        sendMessage(logChannel, getErrorLog(msg.author, msg.content, `Het bevrijdingsbericht kon niet in de schandpaal gestuurd worden.`));
                    });
                }

                schandpaalChannel.fetchMessage(item.announcement).then((message) => {
                    message.delete().catch((err) => {
                        console.error(`Could not delete message with ID ${message.id}: `, err);
                    });;
                }).catch((err) => {
                    console.error("Error deleting announcement: ", err);
                    sendMessage(logChannel, getErrorLog(msg.author, msg.content, `De announcement kon niet verwijderd worden.`));
                });

                all.splice(index, 1);
                sendMessage(logChannel, getFreeLog(msg.author, el, role));
                found = true;
            }
        });

        if (!found) {
            sendMessage(msg.channel, `Kan data over ${el.user.tag} niet vinden!`);
        }
    }
}
//*******************************//

function removeDiacritics (str) {

  var defaultDiacriticsRemovalMap = [
    {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
    {'base':'AA','letters':/[\uA732]/g},
    {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
    {'base':'AO','letters':/[\uA734]/g},
    {'base':'AU','letters':/[\uA736]/g},
    {'base':'AV','letters':/[\uA738\uA73A]/g},
    {'base':'AY','letters':/[\uA73C]/g},
    {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
    {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
    {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
    {'base':'DZ','letters':/[\u01F1\u01C4]/g},
    {'base':'Dz','letters':/[\u01F2\u01C5]/g},
    {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
    {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
    {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
    {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
    {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
    {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
    {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
    {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
    {'base':'LJ','letters':/[\u01C7]/g},
    {'base':'Lj','letters':/[\u01C8]/g},
    {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
    {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
    {'base':'NJ','letters':/[\u01CA]/g},
    {'base':'Nj','letters':/[\u01CB]/g},
    {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
    {'base':'OI','letters':/[\u01A2]/g},
    {'base':'OO','letters':/[\uA74E]/g},
    {'base':'OU','letters':/[\u0222]/g},
    {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
    {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
    {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
    {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
    {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
    {'base':'TZ','letters':/[\uA728]/g},
    {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
    {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
    {'base':'VY','letters':/[\uA760]/g},
    {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
    {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
    {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
    {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
    {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
    {'base':'aa','letters':/[\uA733]/g},
    {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
    {'base':'ao','letters':/[\uA735]/g},
    {'base':'au','letters':/[\uA737]/g},
    {'base':'av','letters':/[\uA739\uA73B]/g},
    {'base':'ay','letters':/[\uA73D]/g},
    {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
    {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
    {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
    {'base':'dz','letters':/[\u01F3\u01C6]/g},
    {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
    {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
    {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
    {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
    {'base':'hv','letters':/[\u0195]/g},
    {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
    {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
    {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
    {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
    {'base':'lj','letters':/[\u01C9]/g},
    {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
    {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
    {'base':'nj','letters':/[\u01CC]/g},
    {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
    {'base':'oi','letters':/[\u01A3]/g},
    {'base':'ou','letters':/[\u0223]/g},
    {'base':'oo','letters':/[\uA74F]/g},
    {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
    {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
    {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
    {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
    {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
    {'base':'tz','letters':/[\uA729]/g},
    {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
    {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
    {'base':'vy','letters':/[\uA761]/g},
    {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
    {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
    {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
    {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
  ];

  for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
    str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
  }

  return str;

}


//************CONTENT************//

function getDbContent(msg, args) {
    let output = "";

    if (args.length == 1) {
        rolesDb.forEach((item, index, all) => {
            const member = getMemberFromId(guild, item.member);

            if(!member) {
                output += `Kan gebruiker met ID ${item.member} niet vinden!\n\n`;
            }
            else {
                output += `${index + 1}. Gebruiker ${member.user.tag} (ID: ${member.id}) met rol ${getRole(guild, item.role).name} van ${formatDate(new Date(item.startTime))} tot ${formatDate(new Date(item.endTime))} gegeven door ${getMemberFromId(guild, item.punisher).user.tag} met reden '${item.reason}'\n\n`;
            }
        });

        if(output === "") {
            output = "Database is leeg.";
        }

        sendMessage(msg.channel, `\`\`\`Database inhoud:\n\n${output}\`\`\``);
    }
    else {
        const members = getMembersFromMessage(msg, args, null, 0);

        if(!members) {
            sendErrorMessage(msg.channel, `Er zijn geen geldige gebruikers gespecificeerd.`);
            sendMessage(logChannel, getErrorLog(msg.author, msg.content, `Er zijn geen geldige gebruikers gespecificeerd.`));
            return;
        }

        for (let i = 0; i < members.length; i++) {
            const el = members[i];
            let found = false;

            rolesDb.forEach((item, index, all) => {
                if (el.id == item.member) {
                    output += `${index + 1}. Gebruiker ${getMemberFromId(guild, item.member).user.tag} (ID: ${item.member}) met rol ${getRole(guild, item.role).name} van ${formatDate(new Date(item.startTime))} tot ${formatDate(new Date(item.endTime))} gegeven door ${getMemberFromId(guild, item.punisher).user.tag} met reden '${item.reason}'\n\n`;
                    found = true;
                }
            });

            if (!found) {
                sendErrorMessage(msg.channel, `Kan data over ${el.user.tag} niet vinden!`);
            }
        }

        if(output === "") {
            output = "Niets gevonden.";
        }

        sendMessage(msg.channel, `\`\`\`Database inhoud:\n\n${output}\`\`\``);
    }


}

//*******************************//

//************CLEANUP************//

/**
 * 1. Member is not in the server.
 * 2. Member does not have the role.
 * 3. If member has international or makkers, remove this role
 */
function dbCleanup(msg) {
    let deletedEntries = 0;

    sendErrorMessage(msg.channel, `De grote schoonmaak is begonnen!`);

    rolesDb.forEach((item, index, all) => {
        const member = getMemberFromId(guild, item.member);

        // Removing entry if member is not in guild.
        if (!member) {
            all.splice(index, 1);
            schandpaalChannel.fetchMessage(item.announcement).then((message) => {
                message.delete().catch((err) => {
                    console.error(`Could not delete message with ID ${message.id}: `, err);
                });;
            }).catch((err) => {
                console.error("Error deleting announcement: ", err);
                sendMessage(logChannel, getErrorLog(msg.author, msg.content, `De announcement kon niet verwijderd worden.`));
            });
            deletedEntries++;
        }
        // Removing entry if member doesn't have the role.
        else if (!hasRole(member, item.role)) {
            all.splice(index, 1);
            schandpaalChannel.fetchMessage(item.announcement).then((message) => {
                message.delete().catch((err) => {
                    console.error(`Could not delete message with ID ${message.id}: `, err);
                });;
            }).catch((err) => {
                console.error("Error deleting announcement: ", err);
                sendMessage(logChannel, getErrorLog(msg.author, msg.content, `De announcement kon niet verwijderd worden.`));
            });
            deletedEntries++;
        }
    });

    const deletedStr = deletedEntries == 1 ? `is ${deletedEntries} item` : `zijn ${deletedEntries} items`;
    sendErrorMessage(msg.channel, `De grote schoonmaak is klaar. Er ${deletedStr} weggeveegd.`);
}

function log(str) {
    console.log(`[`+(new Date).toLocaleTimeString()+`] `+str);
}


//*******************************//

// Login to discord with token.
client.login(authCode.token);
