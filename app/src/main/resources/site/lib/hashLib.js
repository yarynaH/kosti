var authLib = require("/lib/xp/auth");
var textEncoding = require("/lib/text-encoding");
var norseUtils = require("norseUtils");

exports.activateUserHash = activateUserHash;
exports.saveHashForUser = saveHashForUser;
exports.getUserByHash = getUserByHash;
exports.generateHash = generateHash;
exports.generateLiqpayData = generateLiqpayData;
exports.generateLiqpaySignature = generateLiqpaySignature;
exports.createNiceNumericHash = createNiceNumericHash;

function createNiceNumericHash(str) {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(parseInt(hash));
}

function generateLiqpayData(data) {
  return textEncoding.base64Encode(JSON.stringify(data));
}

function generateLiqpaySignature(data) {
  var bean = __.newBean("com.myurchenko.lib.textencoding.HashFunctionHandler");
  bean.stream =
    app.config.liqpayPrivateKey + data + app.config.liqpayPrivateKey;
  return bean.sha1AsHex();
}

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
