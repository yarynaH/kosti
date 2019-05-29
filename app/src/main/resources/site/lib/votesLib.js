var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');
var userLib = require('userLib');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/contextLib');

exports.createBlankVote = createBlankVote;
exports.vote = vote;
exports.countUpvotes = countUpvotes;
exports.countUserUpvotes = countUserUpvotes;
exports.checkIfVoted = checkIfVoted;
exports.getHotIds = getHotIds;
exports.checkIfVoteExist = checkIfVoteExist;

function vote(content){
	var user = userLib.getCurrentUser();
	if( !user || !user.key ){
		return false;
	}
    var result = contextLib.runAsAdmin(function () {
		return doVote(user.key, content);
    });

	return result;
}

function countUpvotes( id ){
	var node = getNode( id );
	if( node && node.votes ){
		return norseUtils.forceArray(node.votes).length;
	}
	return "0";
}

function countUserUpvotes( id ){
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

function checkIfVoteExist( user, node ){
	if( node ){
		node.votes = norseUtils.forceArray(node.votes);
		if( node.votes && node.votes.indexOf(user) != -1 ){
			return true;
		}
	}
	return false;
}

function createBlankVote( node ){
	var votesRepo = getVotesRepo();
	return votesRepo.create({
	    id: node,
	    votes: [],
	    rate: 0
	});
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
	    node.rate = node.votes.length;
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
	    node.rate = node.votes.length;
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

function getHotIds( page ){
    var pageSize = 10;
	var votesRepo = getVotesRepo();
	var date = new Date();
	date = new Date(date.getTime() - (3 * 24 * 60 * 60 * 1000));
	var hits = votesRepo.query({
        start: page * pageSize,
        count: pageSize,
	    sort: '_timestamp DESC, rate DESC'
	}).hits;
	var result = [];
	for( var i = 0; i < hits.length; i++ ){
		var temp = votesRepo.get(hits[i].id);
		if( temp && temp._id){
			result.push(temp.id);
		}
	}
	return result;

}

function getVotesRepo(){
    return nodeLib.connect({
        repoId: 'votes',
        branch: 'master',
        principals: ["role:system.admin"]
    });
}