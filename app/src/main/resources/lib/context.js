var contextLib = require('/lib/xp/context');

exports.runAsAdmin = function (callback) {
    return contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, callback);
};