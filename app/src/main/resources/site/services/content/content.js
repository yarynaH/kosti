var libs = {
    content: require('/lib/xp/content'),
    context: require('/lib/xp/context')
};
var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var userLib = require('user');

exports.get = function( req ) {
    var result = false;
    if ( req['params']['type'] == 'upvote' ) {
        result = prepareUpvote(req['params']);
    } else if( req['params']['type'] == 'downvote' ) {
        result = prepareDownvote(req['params']);
    }
    return {
        body: result,
        contentType: 'text/html'
    }
};

function prepareUpvote( params ){
    var result = false;
    if( params['path'] ){
        var voted = userLib.checkVoted( params['id'] );
        if(voted.upvoted){
            return 'already voted';
        } else if( voted.downvoted ){
            //result = removeDownvote(params['path'], params['id']);
        } else {
            result = upvote(params['path'], params['id']);
        }
        //syncRatingBranches(params['path'], result);
    }
    return result;
}

function prepareDownvote( params ){
    var result = false;
    if( params['path'] ){
        var voted = userLib.checkVoted( params['id'] );
        if(voted.downvoted){
            return 'already voted';
        } else if( voted.voted ){
            //result = removeUpvote(params['path'], params['id']);
        } else {
            result = downvote(params['path'], params['id']);
        }
        //syncRatingBranches(params['path'], result);
    }
    return result;
}

function upvote( path, id ) {
    var content = false;
    var user = userLib.getCurrUserObj();
    if( !user ){
        return false;
    }
    var result = libs.context.run({
        user: {
            login: 'su'
        },
        principals: ["role:system.admin"]
    }, function() {
        contentLib.modify({
            key: user._path,
            editor: function(c) {
                if( c.data.votedFor ){
                    c.data.votedFor = norseUtils.forceArray( c.data.votedFor ).push( id );
                } else {
                    c.data.votedFor = id;
                }
                return c;
            }
        });
        /*content = contentLib.modify({
            key: path,
            editor: function(c) {
                c.data.rating = c.data.rating + 1;
                return c;
            }
        });*/
    });
    return true;
}

function downvote( path, id ) {
    var content = false;
    var user = userLib.getCurrUserObj();
    if( !user ){
        return false;
    }
    var result = libs.context.run({
        user: {
            login: 'su'
        },
        principals: ["role:system.admin"]
    }, function() {
        contentLib.modify({
            key: user._path,
            editor: function(c) {
                if( c.data.downvoteFor ){
                    c.data.downvoteFor = norseUtils.forceArray( c.data.downvoteFor ).push( id );
                } else {
                    c.data.downvoteFor = id;
                }
                return c;
            }
        });
        /*content = contentLib.modify({
            key: path,
            editor: function(c) {
                c.data.rating = c.data.rating + 1;
                return c;
            }
        });*/
    });
    return true;
}

function syncRatingBranches( path, rating ){
    var content = false;
    var result = libs.context.run({
        user: {
            login: 'su'
        },
        principals: ["role:system.admin"]
    }, function() {
        content = contentLib.modify({
            key: path,
            branch: "draft",
            editor: function(c){
                c.data.rating = rating;
                return c;
            }
        });
    });
    return content.data.rating;
}