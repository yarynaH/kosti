var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var votesLib = require('votesLib');
var contextLib = require('/lib/contextLib');

exports.post = function(req){
    var params = req.params;
    var result = {};
    contextLib.runAsAdmin(function () {
        result = votesLib.vote( params.user, params.content );
    });
    return {
        body: result,
        contentType: 'application/json'
    }
}