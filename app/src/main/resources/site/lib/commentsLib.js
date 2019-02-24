var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');

function addComment( contentId, comment ){
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.create({
	    comment: comment,
	    contentId: contentId
	});
}

function getComment( ids ){
	var commentsRepo = connectCommentsRepo();
	return commentsRepo.get(ids);
}

function connectCommentsRepo(){
  return nodeLib.connect({
      repoId: "comments",
      branch: "master"
  });
}