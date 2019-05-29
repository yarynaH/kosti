var norseUtils = require('norseUtils');
var event = require('/lib/xp/event');
var content = require('/lib/xp/content');
var votesLib = require('votesLib');
var contextLib = require('/lib/contextLib');

// catch events
event.listener({
    type: 'node.created',
    localOnly: false,
    callback: function (e) {
        if ( e.data && e.data.nodes ) {
            var nodes = parseNodes( e.data.nodes ),
                affectedSubjectNodes = [];
            for( var i = 0; i < nodes.length; i++ ){
                var node = content.get({key: nodes[0].id});
                if( node && node.type && node.type == app.name + ':article' ){
                    contextLib.runAsAdmin(function () {
                        votesLib.createBlankVote(node._id);
                    });
                }
            }
        }
        return true;
    }
});

function parseNodes( nodes ) {
    if ( typeof nodes != 'string' ) {
        return nodes;
    }
    var regexp = new RegExp('{([^}]+)}','g');
    var nodes = nodes.match( regexp );
    var nodesArray = [];

    for( var i=0; i<nodes.length; i++ ) {
        var node = nodes[i].replace('{','').replace('}','');  
        var attributes = node.split(',');
        var obj = {};
        for( var j=0; j<attributes.length; j++ ) {
            var attr = attributes[j].trim().split('=');
            obj[ ''+attr[0] ] = attr[1];
        }
        nodesArray.push( obj );
    }

    return nodesArray;
}