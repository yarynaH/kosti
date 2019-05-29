var libLocation = '../../site/lib/';
var norseUtils = require(libLocation + 'norseUtils');
var contextLib = require(libLocation + 'contextLib');
var votesLib = require(libLocation + 'votesLib');

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