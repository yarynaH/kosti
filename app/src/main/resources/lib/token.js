var authLib = require('/lib/xp/auth');
var portalLib = require('/lib/xp/portal');
var contextLib = require('/lib/context');

exports.isTokenValid = function (token) {
    var user = findUserByToken(token);
    if (user) {
        var timestamp = user.profile.userpwd.resetTimestamp;
        if ((timestamp - Date.now()) < 86400000) {
            return true;
        } else {
            exports.removeToken(user.key);
        }
    }
    return false;
};

exports.findUserByToken = function (token) {
    return findUserByToken(token);
};

exports.generateToken = function (userKey) {
    var token = doGenerateToken();

    contextLib.runAsAdmin(function () {
        return authLib.modifyProfile({
            key: userKey,
            scope: "userpwd",
            editor: function (p) {
                if (!p) {
                    p = {};
                }
                p.resetToken = token;
                p.resetTimestamp = Date.now();
                return p;
            }
        });
    });

    return token;
};

exports.removeToken = function (userKey) {
    authLib.modifyProfile({
        key: userKey,
        scope: "userpwd",
        editor: function (p) {
            p.resetToken = null;
            p.resetTimestamp = null;
            return p;
        }
    });
}

function findUserByToken(token) {
    return contextLib.runAsAdmin(function () {
        return authLib.findUsers({
            count: 1,
            query: "userstorekey = '" + portalLib.getUserStoreKey() + "' AND profile.userpwd.resetToken = '" + token + "'",
            includeProfile: true
        }).hits[0];
    });
}

function doGenerateToken() {
    var bean = __.newBean('com.enonic.app.simpleidprovider.TokenGeneratorService');
    return bean.generateToken();
}