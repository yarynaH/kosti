var authLib = require("/lib/xp/auth");
var textEncoding = require("/lib/text-encoding");
var norseUtils = require("norseUtils");

exports.activateUserHash = activateUserHash;
exports.saveHashForUser = saveHashForUser;
exports.getUserByHash = getUserByHash;
exports.generateHash = generateHash;

function generateHash(name) {
  var salt = "KostiCon-2019";
  return textEncoding.md5(salt + name + new Date().getTime());
}

function saveHashForUser(email, hashType) {
  var hash = generateHash(email);
  var user = findUser(email);
  var profile = authLib.modifyProfile({
    key: user.key,
    editor: editor
  });

  return profile[hashType];

  function editor(c) {
    if (!c) {
      c = {};
    }
    c[hashType] = hash;
    return c;
  }
}

function getUserByHash(mail, hash, hashType) {
  var user = findUser(mail);
  if (!user) {
    return false;
  }
  var userProfile = authLib.getProfile({
    key: user.key
  });
  if (userProfile && userProfile[hashType] == "1") {
    return true;
  } else if (
    !userProfile ||
    (userProfile && !userProfile[hashType]) ||
    (userProfile && userProfile[hashType] && userProfile[hashType] !== hash)
  ) {
    return false;
  }
  return user;
}

function activateUserHash(mail, hash, hashType) {
  var user = getUserByHash(mail, hash, hashType);
  if (user === true) {
    return true;
  } else if (!user) {
    return false;
  }
  var profile = authLib.modifyProfile({
    key: user.key,
    editor: editor
  });

  function editor(c) {
    if (!c) {
      c = {};
    }
    c[hashType] = "1";
    return c;
  }
  return true;
}

function findUser(name) {
  var user = authLib.findUsers({
    start: 0,
    count: 1,
    query: 'email="' + name + '" OR login="' + name + '"'
  });
  if (user && user.hits && user.hits[0]) {
    return user.hits[0];
  }
  return false;
}
