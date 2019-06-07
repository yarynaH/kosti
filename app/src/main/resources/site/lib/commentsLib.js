var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('contextLib');
var userLib = require('userLib');
var kostiUtils = require('kostiUtils');

exports.addComment = addComment;
exports.getCommentsByParent = getCommentsByParent;
exports.voteForComment = voteForComment;
exports.removeComment = removeComment;
exports.getCommentsByUser = getCommentsByUser;
exports.countComments = countComments;

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
	    user: user,
	    _permissions:[{
            "principal": "role:system.authenticated",
            "allow": [
                "READ",
                "MODIFY",
                "READ_PERMISSIONS",
                "WRITE_PERMISSIONS"
            ],
            "deny": []
        }]
	});
	return beautifyComment(comment, false);
}

function getCommentsByUser( id ){
	var commentsRepo = connectCommentsRepo();
	var temp = commentsRepo.query({
		start: 0,
		count: -1,
		query: "user = '" + id + "'",
		sort: "deleted DESC, rate ASC, _ts ASC"
	}).hits;
	var result = [];
	for( var i = 0; i < temp.length; i++ ){
		var comment = commentsRepo.get(temp[i].id);
		comment = beautifyComment(comment, false);
		result.push(comment);
	}
	return result;
}

function removeComment( id, reason ){
	var user = userLib.getCurrentUser();
	if( !user.moderator ){
		return false;
	}
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.modify({
	    key: id,
	    editor: editor
	});
	function editor(node) {
	    node.deleted = 1;
	    node.reason = reason;
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
	if( !comment.votes || (comment.votes && comment.votes.indexOf(user.key) == -1) ){
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

function getCommentsByParent( id, counter){
	var commentsRepo = connectCommentsRepo();
	var temp = commentsRepo.query({
		start: 0,
		count: -1,
		query: "parent = '" + id + "'",
		sort: "rate ASC, _ts ASC"
	}).hits;
	var result = [];
	for( var i = 0; i < temp.length; i++ ){
		var comment = commentsRepo.get(temp[i].id);
		comment = beautifyComment(comment, counter);
		result.push(comment);
	}
	return result;
}

function getComment( id ){
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.get(id);
}

function beautifyComment(comment, counter){
	if(!counter)
    {
    	comment.date = kostiUtils.getTimePassedSincePostCreation(comment._ts.replace('Z', ''));
    	comment.author = userLib.getUserDataById(comment.user);
    	comment.voted = comment.votes && comment.votes.indexOf(comment.author.key) != -1;
	}
    comment.children = getCommentsByParent(comment._id, counter);
    return comment;
}

function connectCommentsRepo(){
  return nodeLib.connect({
      repoId: "comments",
      branch: "master"
  });
}

function countComments(id){
	var comments = getCommentsByParent(id, true);
	var commentsCounter = comments.length;
	for(var i = 0; i < comments.length; i++)
		commentsCounter += countComments(comments[i]._id);	
	return commentsCounter;
}