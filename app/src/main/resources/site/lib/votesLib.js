var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');

exports.vote = function(uid, cid, type){
	if( type == 'upvote' ){
		upvote(uid, cid);
	} else if( type == 'downvote' ){
		downvote(uid, cid);
	}
}

function upvote( uid, cid ){
	var votesRepo = this.getVotesRepo();
	var content = checkIfVoteObjectExists(cid);
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
	}
}

function downvote( uid, cid ){
	var votesRepo = this.getVotesRepo();
	var content = checkIfVoteObjectExists(cid);
	if( content && content.downvotes && content.downvotes.indexOf(uid) != -1 ){
	    content = usersRepo.modify({
	        key: user._id,
	        editor: function( content ){
	        	if( content.downvotes ){
	        		var temp = content.downvotes;
	        		temp.push(uid);
	        		content.downvotes = temp;
	        	} else {
	        		content.downvotes = [uid];
	        	}
		        return content;
	        }
	    });
	} else {
		return false;
	}
}

function checkIfVoteObjectExists( cid ){
	var votesRepo = this.getVotesRepo();
	if( cid ){
		var content = votesRepo.query({
			start: 0,
			count: 1,
			query: "cid = '" + cid + "'",
		}).hits[0].id;
		if(content){
			return usersRepo.get(content);
		} else {
			return votesRepo.create({
				cid: cid
			});
		}
	}
	return false;
}


exports.getVotesRepo = function(){
    return nodeLib.connect({
        repoId: 'votes',
        branch: 'master',
        principals: ["role:system.admin"]
    });
}