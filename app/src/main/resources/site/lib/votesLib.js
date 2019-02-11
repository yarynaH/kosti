var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');

exports.vote = function(user, content){
	//if( type == 'upvote' ){
	return upvote(user, content);
	/*} else if( type == 'downvote' ){
		downvote(uid, cid);
	}*/
}

exports.countUpvotes = function( id ){
	var node = getNode( id );
	if( node && node.votes ){
		return norseUtils.forceArray(node.votes).length;
	}
	return "0";
}

function upvote( user, content ){
	var node = getNode( content );
	if( !checkIfVoteExist( user, node ) && node ){
		return editNode( user, node );
	} else if( !node ){
		return createVote( user, content );
	} else {
		return false;
	}

	/*var content = checkIfVoteObjectExists(cid);
	if( content && content.upvotes && content.upvotes.indexOf(uid) != -1 ){
	    content = usersRepo.modify({
	        key: user._id,
	        editor: function( content ){
	        	if( content.upvotes ){
	        		var temp = content.upvotes;
	        		temp.push(uid);
	        		content.upvotes = temp;
	        	} else {
	        		content.upvotes = [uid];
	        	}
		        return content;
	        }
	    });
	} else {
		return false;
	}*/
}

function checkIfVoteExist( user, node ){
	if( node && node.votes && node.votes.indexOf(user) == -1 ){
		return false;
	} else {
		return true;
	}
}

function createVote( user, content ){
	var votesRepo = getVotesRepo();
	return votesRepo.create({
	    id: content,
	    votes: [user]
	});
}

function editNode( user, node ){
	var votesRepo = getVotesRepo();
	return votesRepo.modify({
	    key: node._id,
	    editor: editor
	});
	function editor(node) {
		var temp = node.votes;
		temp.push( user );
	    node.votes = temp;
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