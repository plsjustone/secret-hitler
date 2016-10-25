const {sendInProgressGameUpdate} = require('../util.js'),
	_ = require('lodash');

module.exports.startElection = game => {
	game.trackState.electionTrackerCount = 0;
	game.gameState.presidentIndex = (() => {
		const findNext = index => index > game.seatedPlayers.length ? 0 : index,
			ineligableIndexes = game.publicPlayersState.filter(player => player.isDead).map((player, i) => {
				let index;

				game.publicPlayersState.find((play, index) => play.userName === player.userName))
			}).concat(game.gameState.previousElectedGovernment);

		let index = game.gameState.presidentIndex + 1,
			notDeadPresident = false;
		console.log('hi2u');
		while (!notDeadPresident) {
		console.log('loop?');
			if (!game.private.seatedPlayers[index].isDead) {
				notDeadPresident = true;
			} else {
				index = findNext(index);
			}
		}
		console.log(index);
		return index;
	})();

	const {seatedPlayers} = game.private,
		{presidentIndex, previousElectedGovernment} = game.gameState,
		pendingPresidentPlayer = game.private.seatedPlayers[presidentIndex];

	if (game.general.livingPlayerCount < 6 && previousElectedGovernment.length) {
		game.gameState.previousElectedGovernment = [previousElectedGovernment[0]];
	}

	game.general.electionCount++;
	game.general.status = `Election #${game.general.electionCount}: president to select chancellor.`;
	pendingPresidentPlayer.gameChats.push({
		gameChat: true,
		timestamp: new Date(),
		chat: [{
			text: 'You are president and must select a chancellor.'
		}]
	});

	pendingPresidentPlayer.playersState.filter((player, index) => index !== presidentIndex && !game.gameState.previousElectedGovernment.includes(index)).forEach(player => {
		player.notificationStatus = 'notification'; // todo-alpha does not account for dead players.
	});

	game.publicPlayersState.forEach(player => {
		player.cardStatus.cardDisplayed = false;
		player.governmentStatus = '';
	});

	game.publicPlayersState[presidentIndex].governmentStatus = 'isPendingPresident';
	game.publicPlayersState[presidentIndex].isLoader = true;
	game.gameState.phase = 'selectingChancellor';
	game.gameState.clickActionInfo = [pendingPresidentPlayer.userName, _.without(_.range(0, seatedPlayers.length), presidentIndex, ...game.gameState.previousElectedGovernment)]; // todo-alpha does not account for dead players.
	sendInProgressGameUpdate(game);
};

module.exports.shufflePolicies = (remainingPolicies = []) => {
	const count = _.countBy(remainingPolicies);

	return remainingPolicies.concat(_.shuffle((_.range(1, 12 - (count.fascist || 0)).map(num => 'fascist').concat(_.range(1, 7 - (count.liberal || 0)).map(num => 'liberal')))));
};