function parseVoiceUpdate(oldState, newState) {
	var oldMember = oldState.member;
    var newMember = newState.member;

    if(oldMember.user == undefined || newMember.user == undefined) {
		log(`undefined member`);
		return;
    }
    if(newState.channel != undefined && oldState.channel == undefined) {
		addRole(newMember,babbelaarRole);
        log(`${FgBlue}(${newState.channel.name}) ${FgYellow}<${newMember.user.tag}> ${FgGreen}joined${Reset}`);
    }
    else if(newState.channel == undefined && oldState.channel != undefined) {
		removeRole(newMember,babbelaarRole);
        log(`${FgBlue}(${oldState.channel.name}) ${FgYellow}<${newMember.user.tag}> ${FgRed}left${Reset}`);
    }
}
