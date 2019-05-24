var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');
var userLib = require('userLib');

exports.vote = function(user, content){
	return doVote(user, content);
}

exports.countUpvotes = function( id ){
	var node = getNode( id );
	if( node && node.votes ){
		return norseUtils.forceArray(node.votes).length;
	}
	return "0";
}

exports.countUserUpvotes = function( id ){
	var votesRepo = getVotesRepo();
	var result = votesRepo.query({
	    start: 0,
	    count: 2,
	    query: "votes = '" + id + "'",
	});
	return result.total;
}

function doVote( user, content ){
	var node = getNode( content );
	if( !checkIfVoteExist( user, node ) && node && user ){
		return upvote( user, node );
	} else if(checkIfVoteExist( user, node ) && node && user) {
		return downvote( user, node );
	} else if( !node && user ){
		return createVote( user, content );
	} else {
		return false;
	}
}

function checkIfVoted( content ){
    var user = userLib.getCurrentUser();
	var node = getNode( content );
	if( user && user.key && content && node ){
		return checkIfVoteExist( user.key, node );
	}
	return false;
}

exports.checkIfVoted = checkIfVoted;

function checkIfVoteExist( user, node ){
	if( node ){
		node.votes = norseUtils.forceArray(node.votes);
		if( node.votes && node.votes.indexOf(user) != -1 ){
			return true;
		}
	}
	return false;
}

function createVote( user, content ){
	var votesRepo = getVotesRepo();
	return votesRepo.create({
	    id: content,
	    votes: [user]
	});
}

function upvote( user, node ){
	var votesRepo = getVotesRepo();
	return votesRepo.modify({
	    key: node._id,
	    editor: editor
	});
	function editor(node) {
		if(!node.votes){
			node.votes = [];
		}
		var temp = norseUtils.forceArray(node.votes);
		temp.push( user );
	    node.votes = temp;
	    return node;
	}
}

function downvote( user, node ){
	var votesRepo = getVotesRepo();
	return votesRepo.modify({
	    key: node._id,
	    editor: editor
	});
	function editor(node) {
		node.votes = norseUtils.forceArray(node.votes);
		node.votes.splice(node.votes.indexOf(user), 1);
	    return node;
	}
}

function getNode( id ){
	var votesRepo = getVotesRepo();
	var result = votesRepo.query({
	    start: 0,
	    count: 1,
	    query: "id = '" + id + "'"
	});
	if( result && result.hits && result.hits[0] ){
		return votesRepo.get(result.hits[0].id);
	}
	return false;
}

function getVotesRepo(){
    return nodeLib.connect({
        repoId: 'votes',
        branch: 'master',
        principals: ["role:system.admin"]
    });
}