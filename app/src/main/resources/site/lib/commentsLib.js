var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');
var userLib = require('userLib');
var kostiUtils = require('kostiUtils');

exports.addComment = addComment;
exports.getCommentsByParent = getCommentsByParent;
exports.voteForComment = voteForComment;
exports.removeComment = removeComment;

function addComment( parent, body ){
	var commentsRepo = connectCommentsRepo();
    var user = userLib.getCurrentUser();
    if( user ){
    	user = user._id;
    } else {
    	return false;
    }
	var comment = commentsRepo.create({
	    body: body,
	    parent: parent,
	    user: user
	});
	return beautifyComment(comment);
}

function removeComment( id ){
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.modify({
	    key: id,
	    editor: editor
	});
	function editor(node) {
	    node.deleted = true;
	    return node;
	}
}

function voteForComment( id ){
	var commentsRepo = connectCommentsRepo();
    var user = userLib.getCurrentUser();
	var comment = commentsRepo.get(id);
	if( !comment || !comment._id || !user || !user.key ){
		return false;
	}
	if( !comment.votes || (comment.votes && comment.votes.indexOf(user) != -1) ){
		comment = upvote( user.key, comment._id );
	} else {
		comment = downvote( user.key, comment._id );
	}
	return {
		rate: comment.rate,
		voted: comment.votes && comment.votes.indexOf(user.key) != -1
	};
}

function upvote( user, node ){
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.modify({
	    key: node,
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
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.modify({
	    key: node,
	    editor: editor
	});
	function editor(node) {
		node.votes = norseUtils.forceArray(node.votes);
		node.votes.splice(node.votes.indexOf(user), 1);
	    node.rate = node.votes.length;
	    return node;
	}
}

function getCommentsByParent( id ){
	var commentsRepo = connectCommentsRepo();
	var temp = commentsRepo.query({
		start: 0,
		count: 9999999,
		query: "parent = '" + id + "'",
		sort: ""
	}).hits;
	var result = [];
	for( var i = 0; i < temp.length; i++ ){
		var comment = commentsRepo.get(temp[i].id);
		comment = beautifyComment(comment);
		result.push(comment);
	}
	return result;
}

function getComment( id ){
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.get(id);
}

function beautifyComment(comment){
    comment.date = kostiUtils.getTimePassedSincePostCreation(comment._timestamp.replace('Z', ''));
    comment.author = userLib.getUserDataById(comment.user);
    comment.voted = comment.votes && comment.votes.indexOf(comment.author.key) != -1;
    comment.children = getCommentsByParent(comment._id);
    return comment;
}

function connectCommentsRepo(){
  return nodeLib.connect({
      repoId: "comments",
      branch: "master"
  });
}