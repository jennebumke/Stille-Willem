let prefix = '-';

let wat = (/^[W|w]{1}[A|a]{1}[T|t]{1}[?]*$/);
let ikbenboos = (/^(ik (ga|ben) )?boos$/i);
let belg = (/(belg$|belg[i| ])/i);
let kanker = (/([\S]?k+[^a-z]?[a|e]+[^a-z]?n+[\S]?k+[^a-z]?e+[^a-z]?r+[a-z]+|[\S]k+[^a-z]?[a|e]+[^a-z]?n+[\S]?k+[^a-z]?e+[^a-z]?r+|^k+[a|e]+[^a-z]?n+[\S]?k+[^a-z]?e+[^a-z]?r+$|k[^a-z]?[a|e][^a-z]?n[^a-z]?k[^a-z]?e[^a-z]+r)/i);
let heeftkanker = (/([h|m]e+f?t)|aan/i);
let ripf = (/^f$/i);
let zeg = (/^zeg$/i);
let lap = (/^lap$/i);
let stillewillem = (/^stille willem$/i);

function isEditGhostPing(oldMessage, newMessage) {
    
}

function parseMessage(message) {
    if (message.content.charAt(0) == prefix && (
    message.member.hasPermission('MANAGE_ROLES') ||
    message.member.user.tag == 'tree#0001' ||
    message.member.user.tag == 'Darkie#0001' ||
    message.member.user.tag == 'Letterlijk Massa#1461')) {
        const args = message.content.slice(prefix.length).split(/ +/);

	validCommand = handleCommands(message, args);

	if(validCommand) {
            message.delete().catch((err) => {
                console.error(`Could not delete message with ID ${message.id}: `, err);
            });
        }
	return;
    }
    
    reactions(message);
}

function reactions(message) {
    let messageContent = removeDiacritics(message.content);
    
    if (ikbenboos.test(messageContent)) {
        if(getRandomBool(25)) {
            message.react('538782395688550402');
        }
    }
    else if (wat.test(messageContent)) {
        if(getRandomBool(30)) {
            message.react('🍟');
        }
    }
    else if(belg.test(messageContent) &&
    getRandomBool(10) &&
    message.channel.id != englishChannelId) {
	if(getRandomBool(50)) {
	    sendMessage(message.channel, `Makker, het is Zuid Nederlands!`);
	}
	else {
	    message.react('🇧🇪');
	}
    }
    else if(kanker.test(messageContent)) {
        if(!heeftkanker.test(messageContent) &&
	   getRandomBool(80) &&
	   message.channel.id != englishChannelId)
	{
	    if(getRandomBool(50))
	    {
		message.react('378555121283629076');
	    }
	    else
	    {
            	message.react('♋');
	    }
	}
    }
    else if(ripf.test(messageContent)) {
	if(getRandomBool(20))
	{
	    sendMessage(message.channel, `Rip`);
	}
	else {
	    message.react('🇫');
	}
    }
    else if(zeg.test(messageContent)) {
	if(getRandomInt(1, chance) === chance) {
	    sendMessage(message.channel, `Makker`);
        }
    }
    else if(lap.test(messageContent)) {
	if(getRandomBool(60)) {
            message.react('🇸')
                .then(() => message.react('🇪'))
                .then(() => message.react('🇬'))
                .then(() => message.react('🥔'))
                .catch(() => console.error('One of the emojis failed to react.'));
        }
    }
    else if(stillewillem.test(messageContent)) {
        if(getRandomBool(30)) {
            sendMessage(message.channel, `Dat is weliswaar een geuzennaam.`);
        }
    }
}
