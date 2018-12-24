var authLib = require('/lib/xp/auth');
var portalLib = require('/lib/xp/portal');
var contextLib = require('/lib/context');

exports.findUserByEmail = function (email) {
    return contextLib.runAsAdmin(function () {
        return authLib.findUsers({
            count: 1,
            query: "userstorekey = '" + portalLib.getUserStoreKey() + "' AND email = '" + email + "'",
            includeProfile: true
        }).hits[0];
    });
};

