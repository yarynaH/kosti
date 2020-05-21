var thymeleaf = require("/lib/thymeleaf");
var contentLib = require("/lib/xp/content");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var promosLib = require(libLocation + "promosLib");
var cartLib = require(libLocation + "cartLib");
var sharedLib = require(libLocation + "sharedLib");
var contextLib = require(libLocation + "contextLib");

exports.post = function (req) {
  var codes = [];
  for (var i = 0; i < parseInt(req.params.amount); i++) {
    codes.push(randomString(8, "#A"));
  }
  var result = contextLib.runInDraft(function () {
    return contentLib.modify({
      key: req.params.cid,
      editor: function (c) {
        var tempCodes = [];
        for (var i = 0; i < codes.length; i++) {
          tempCodes.push({ code: codes[i], used: false });
        }
        c.data.codeType = {
          _selected: "unique",
          unique: {
            unique: tempCodes
          }
        };
        return c;
      }
    });
  });
  contentLib.publish({
    keys: [result._id],
    sourceBranch: "draft",
    targetBranch: "master",
    includeDependencies: false
  });
  return result;
};

function randomString(length, chars) {
  var mask = "";
  if (chars.indexOf("a") > -1) mask += "abcdefghijklmnopqrstuvwxyz";
  if (chars.indexOf("A") > -1) mask += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (chars.indexOf("#") > -1) mask += "0123456789";
  if (chars.indexOf("!") > -1) mask += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
  var result = "";
  for (var i = length; i > 0; --i)
    result += mask[Math.floor(Math.random() * mask.length)];
  return result;
}

function hasDuplicates(array) {
  var valuesSoFar = Object.create(null);
  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (value in valuesSoFar) {
      return true;
    }
    valuesSoFar[value] = true;
  }
  return false;
}
