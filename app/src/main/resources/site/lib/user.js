var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var libs = {
    content: require('/lib/xp/content'),
    context: require('/lib/xp/context')
};

exports.register = function( login, mail, pass ){
  var result = true;
  var user = libs.context.run({
        user: {
            login: 'su'
        },
        principals: ["role:system.admin"]
    }, function() { user = authLib.createUser({
        userStore: 'system',
        name: login,
        displayName: login,
        email: mail
    });
    var changePass = authLib.changePassword({
      userKey: user.key,
      password: pass
    });
    if( !user || !changePass ){
      result = false;
    }
    createUserContentType(login);
  });
	return result;
}

exports.login = function( login, pass){
  var user = authLib.login({
    user: login,
    password: pass,
    userStore: 'system'
  });
  return user;
}

exports.logout = function(){
  authLib.logout();
  return true;
}

exports.getCurrUser = function(){
  return authLib.getUser();
}

exports.getCurrUserObj = function(){
  var user = authLib.getUser();
  if( user.displayName ){
    var userObj = contentLib.query({
      start: 0,
      count: 1,
      query: "displayName = '" + user.displayName + "'",
      branch: "master",
      contentTypes: [
          app.name + ":user"
      ]
    }).hits;
    if( !userObj[0] ){
      return false;
    } else {
      return userObj[0];
    }
  }
  return false;
}

function createUserContentType( login ){
  var siteConfig = portal.getSiteConfig();
  var usersLocation = contentLib.get({ key: siteConfig.contentLocation.usersLocation });
  var user = contentLib.create({
      parentPath: usersLocation._path,
      displayName: login,
      branch: 'draft',
      contentType: 'com.myurchenko.dndTools:user',
      data: {}
  });
  var user = contentLib.publish({
    keys: [user._id],
    sourceBranch: 'draft',
    targetBranch: 'master'
  });
}

exports.checkVoted = function( id ){
  var userObj = this.getCurrUserObj();
  if( !userObj ){
    return false;
  }
  var result = {};
  if(userObj.data && userObj.data.votedFor && userObj.data.votedFor.indexOf(id) != -1){
    result.upvoted = true;
  }
  //if(userObj.data.downVotedFor.indexOf(id) != -1){
  //  result.downvoted = true;
  //}
  return result;
}