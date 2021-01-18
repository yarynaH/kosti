var portal = require("/lib/xp/portal");

var libLocation = "/site/lib/";
var userLib = require(libLocation + "userLib");

exports.get = function (req) {
  userLib.discordRegister(req.params.code);
  return {
    status: 301,
    headers: {
      Location: req.params.redirect
        ? "/" + req.params.redirect
        : portal.pageUrl({ path: portal.getSite()._path })
    }
  };
};
