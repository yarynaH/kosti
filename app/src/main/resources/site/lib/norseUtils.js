var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var i18n = require("/lib/xp/i18n");
var moment = require("moment");

// Returns the full month name from a Date object.

exports.getImage = getImage;
exports.getPlaceholder = getPlaceholder;
exports.getMonthName = getMonthName;
exports.getFormattedDate = getFormattedDate;
exports.getGravatar = getGravatar;
exports.getDayName = getDayName;
exports.getTime = getTime;
exports.validateEmail = validateEmail;
exports.uniqueArray = uniqueArray;

function validateEmail(email) {
  if (/(.+)@(.+){1,}\.(.+){2,}/.test(email)) {
    return true;
  }
  return false;
}

function uniqueArray(array) {
  var unique = array.filter(function (elem, index, self) {
    return index === self.indexOf(elem);
  });
  return unique;
}

function getMonthName(date) {
  var month = date.getMonth();
  var monthName;

  switch (month) {
    case 0:
      monthName = i18n.localize({
        key: "months.jan.date"
      });
      break;
    case 1:
      monthName = i18n.localize({
        key: "months.feb.date"
      });
      break;
    case 2:
      monthName = i18n.localize({
        key: "months.mar.date"
      });
      break;
    case 3:
      monthName = i18n.localize({
        key: "months.apr.date"
      });
      break;
    case 4:
      monthName = i18n.localize({
        key: "months.may.date"
      });
      break;
    case 5:
      monthName = i18n.localize({
        key: "months.jun.date"
      });
      break;
    case 6:
      monthName = i18n.localize({
        key: "months.jul.date"
      });
      break;
    case 7:
      monthName = i18n.localize({
        key: "months.aug.date"
      });
      break;
    case 8:
      monthName = i18n.localize({
        key: "months.sep.date"
      });
      break;
    case 9:
      monthName = i18n.localize({
        key: "months.oct.date"
      });
      break;
    case 10:
      monthName = i18n.localize({
        key: "months.nov.date"
      });
      break;
    case 11:
      monthName = i18n.localize({
        key: "months.dec.date"
      });
      break;
  }

  return monthName;
}

function getDayName(date) {
  var day = date.getDay();
  return i18n.localize({
    key: "days.name." + day
  });
}

function getTime(date) {
  return moment(date).format("HH:mm");
}

function getFormattedDate(date) {
  if (typeof date == "string") {
    date = new Date(date);
  }
  var dateString = "";
  dateString += " " + date.getDate();
  dateString += ". " + exports.getMonthName(date);
  dateString += " " + (date.getFullYear() - 2000);
  return dateString;
}
// MD5 (Message-Digest Algorithm) by WebToolkit http://www.deluxeblogtips.com/2010/04/get-gravatar-using-only-javascript.html
function getGravatar(email, size) {
  var MD5 = function (s) {
    function L(k, d) {
      return (k << d) | (k >>> (32 - d));
    }
    function K(G, k) {
      var I, d, F, H, x;
      F = G & 2147483648;
      H = k & 2147483648;
      I = G & 1073741824;
      d = k & 1073741824;
      x = (G & 1073741823) + (k & 1073741823);
      if (I & d) {
        return x ^ 2147483648 ^ F ^ H;
      }
      if (I | d) {
        if (x & 1073741824) {
          return x ^ 3221225472 ^ F ^ H;
        } else {
          return x ^ 1073741824 ^ F ^ H;
        }
      } else {
        return x ^ F ^ H;
      }
    }
    function r(d, F, k) {
      return (d & F) | (~d & k);
    }
    function q(d, F, k) {
      return (d & k) | (F & ~k);
    }
    function p(d, F, k) {
      return d ^ F ^ k;
    }
    function n(d, F, k) {
      return F ^ (d | ~k);
    }
    function u(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(r(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function f(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(q(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function D(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(p(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function t(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(n(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function e(G) {
      var Z;
      var F = G.length;
      var x = F + 8;
      var k = (x - (x % 64)) / 64;
      var I = (k + 1) * 16;
      var aa = Array(I - 1);
      var d = 0;
      var H = 0;
      while (H < F) {
        Z = (H - (H % 4)) / 4;
        d = (H % 4) * 8;
        aa[Z] = aa[Z] | (G.charCodeAt(H) << d);
        H++;
      }
      Z = (H - (H % 4)) / 4;
      d = (H % 4) * 8;
      aa[Z] = aa[Z] | (128 << d);
      aa[I - 2] = F << 3;
      aa[I - 1] = F >>> 29;
      return aa;
    }
    function B(x) {
      var k = "",
        F = "",
        G,
        d;
      for (d = 0; d <= 3; d++) {
        G = (x >>> (d * 8)) & 255;
        F = "0" + G.toString(16);
        k = k + F.substr(F.length - 2, 2);
      }
      return k;
    }
    function J(k) {
      k = k.replace(/rn/g, "n");
      var d = "";
      for (var F = 0; F < k.length; F++) {
        var x = k.charCodeAt(F);
        if (x < 128) {
          d += String.fromCharCode(x);
        } else {
          if (x > 127 && x < 2048) {
            d += String.fromCharCode((x >> 6) | 192);
            d += String.fromCharCode((x & 63) | 128);
          } else {
            d += String.fromCharCode((x >> 12) | 224);
            d += String.fromCharCode(((x >> 6) & 63) | 128);
            d += String.fromCharCode((x & 63) | 128);
          }
        }
      }
      return d;
    }
    var C = Array();
    var P, h, E, v, g, Y, X, W, V;
    var S = 7,
      Q = 12,
      N = 17,
      M = 22;
    var A = 5,
      z = 9,
      y = 14,
      w = 20;
    var o = 4,
      m = 11,
      l = 16,
      j = 23;
    var U = 6,
      T = 10,
      R = 15,
      O = 21;
    s = J(s);
    C = e(s);
    Y = 1732584193;
    X = 4023233417;
    W = 2562383102;
    V = 271733878;
    for (P = 0; P < C.length; P += 16) {
      h = Y;
      E = X;
      v = W;
      g = V;
      Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
      V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
      W = u(W, V, Y, X, C[P + 2], N, 606105819);
      X = u(X, W, V, Y, C[P + 3], M, 3250441966);
      Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
      V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
      W = u(W, V, Y, X, C[P + 6], N, 2821735955);
      X = u(X, W, V, Y, C[P + 7], M, 4249261313);
      Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
      V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
      W = u(W, V, Y, X, C[P + 10], N, 4294925233);
      X = u(X, W, V, Y, C[P + 11], M, 2304563134);
      Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
      V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
      W = u(W, V, Y, X, C[P + 14], N, 2792965006);
      X = u(X, W, V, Y, C[P + 15], M, 1236535329);
      Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
      V = f(V, Y, X, W, C[P + 6], z, 3225465664);
      W = f(W, V, Y, X, C[P + 11], y, 643717713);
      X = f(X, W, V, Y, C[P + 0], w, 3921069994);
      Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
      V = f(V, Y, X, W, C[P + 10], z, 38016083);
      W = f(W, V, Y, X, C[P + 15], y, 3634488961);
      X = f(X, W, V, Y, C[P + 4], w, 3889429448);
      Y = f(Y, X, W, V, C[P + 9], A, 568446438);
      V = f(V, Y, X, W, C[P + 14], z, 3275163606);
      W = f(W, V, Y, X, C[P + 3], y, 4107603335);
      X = f(X, W, V, Y, C[P + 8], w, 1163531501);
      Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
      V = f(V, Y, X, W, C[P + 2], z, 4243563512);
      W = f(W, V, Y, X, C[P + 7], y, 1735328473);
      X = f(X, W, V, Y, C[P + 12], w, 2368359562);
      Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
      V = D(V, Y, X, W, C[P + 8], m, 2272392833);
      W = D(W, V, Y, X, C[P + 11], l, 1839030562);
      X = D(X, W, V, Y, C[P + 14], j, 4259657740);
      Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
      V = D(V, Y, X, W, C[P + 4], m, 1272893353);
      W = D(W, V, Y, X, C[P + 7], l, 4139469664);
      X = D(X, W, V, Y, C[P + 10], j, 3200236656);
      Y = D(Y, X, W, V, C[P + 13], o, 681279174);
      V = D(V, Y, X, W, C[P + 0], m, 3936430074);
      W = D(W, V, Y, X, C[P + 3], l, 3572445317);
      X = D(X, W, V, Y, C[P + 6], j, 76029189);
      Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
      V = D(V, Y, X, W, C[P + 12], m, 3873151461);
      W = D(W, V, Y, X, C[P + 15], l, 530742520);
      X = D(X, W, V, Y, C[P + 2], j, 3299628645);
      Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
      V = t(V, Y, X, W, C[P + 7], T, 1126891415);
      W = t(W, V, Y, X, C[P + 14], R, 2878612391);
      X = t(X, W, V, Y, C[P + 5], O, 4237533241);
      Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
      V = t(V, Y, X, W, C[P + 3], T, 2399980690);
      W = t(W, V, Y, X, C[P + 10], R, 4293915773);
      X = t(X, W, V, Y, C[P + 1], O, 2240044497);
      Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
      V = t(V, Y, X, W, C[P + 15], T, 4264355552);
      W = t(W, V, Y, X, C[P + 6], R, 2734768916);
      X = t(X, W, V, Y, C[P + 13], O, 1309151649);
      Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
      V = t(V, Y, X, W, C[P + 11], T, 3174756917);
      W = t(W, V, Y, X, C[P + 2], R, 718787259);
      X = t(X, W, V, Y, C[P + 9], O, 3951481745);
      Y = K(Y, h);
      X = K(X, E);
      W = K(W, v);
      V = K(V, g);
    }
    var i = B(Y) + B(X) + B(W) + B(V);
    return i.toLowerCase();
  };

  var size = size || 80;

  return "http://www.gravatar.com/avatar/" + MD5(email) + ".jpg?s=" + size;
}

exports.getSearchPage = function () {
  var site = portal.getSite();
  var siteConfig = portal.getSiteConfig();
  var searchPageKey = siteConfig.searchPage;
  if (searchPageKey) {
    var searchContent = contentLib.get({ key: searchPageKey });
    if (searchContent) {
      return searchContent._path;
    }
  }
  return site._path + "/search";
};

exports.log = function (data, location) {
  if (location) {
    log.info(
      "Utilities log at %s: %s",
      location,
      JSON.stringify(data, null, 4)
    );
  } else {
    log.info("Utilities log %s", JSON.stringify(data, null, 4));
  }
};

exports.isInt = function (x) {
  return Math.round(x) === x;
};

exports.getContent = function (key) {
  var content;
  if (typeof key == "undefined") {
    content = portal.getContent();
  } else {
    content = contentLib.get({
      key: key
    });
  }
  return content;
};

exports.forceArray = function (data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data;
};

/**
 * Delete all properties with empty string from an object
 * @param {Object} The object to be processed.
 * @param {Boolean} Flag true to delete properties in nested objects.
 * @return {Boolean} Returns true if the value is an integer or can be cast to an integer.
 */
exports.deleteEmptyProperties = function (obj, recursive) {
  for (var i in obj) {
    if (obj[i] === "") {
      delete obj[i];
    } else if (recursive && typeof obj[i] === "object") {
      exports.data.deleteEmptyProperties(obj[i], recursive);
    }
  }
};

exports.getTranslation = function () {
  var params = parseParams(arguments);

  var result = params["defaultText"];

  if (params.key && params.key != "") {
    var query = 'data.translation.key = "' + params.key + '"';
    var content = portal.getContent();
    var contentLanguage = content.language;

    if (contentLanguage) {
      query += ' AND language = "' + contentLanguage + '"';
    }
    if (params.context) {
      query += ' AND data.context = "' + params.context + '"';
    }

    var translations = contentLib.query({
      start: 0,
      count: 1,
      query: query,
      contentTypes: [app.name + ":translation"]
    });

    if (translations && translations.count == 1) {
      // get first hit
      var translationLines = translations.hits[0].data.translation;
      translationLines = exports.forceArray(translationLines);
      if (translationLines.length && translationLines.length > 0) {
        translationLines.forEach(function (translation) {
          if (translation.key == params.key) {
            result = translation.text;
            if (params.arguments.length > 0) {
              result = replaceValues(result, params.arguments);
            }
            return result;
          }
        });
      }
    }
  }

  return result;

  function parseParams(params) {
    var parameters = {
      arguments: [],
      defaultText: "",
      key: "",
      context: false
    };
    for (var i = 0; i < params.length; i++) {
      switch (i) {
        case 0:
          parameters["key"] = params[i];
          break;
        case 1:
          parameters["context"] = params[i];
          break;
        case 2:
          parameters["defaultText"] = params[i];
          break;
        default:
          parameters["arguments"].push(params[i]);
          break;
      }
    }

    return parameters;
  }

  function replaceValues(str, args) {
    for (var i = 0; i < args.length; i++) {
      var reg = new RegExp("\\{" + i + "\\}", "gm");
      str = str.replace(reg, args[i]);
    }
    return str;
  }
};

function getImage(id, size, placeholderType, urlType, quality) {
  var result = false;
  if (!size || size == "") {
    size = "max(1366)";
  }
  if (typeof urlType == "undefined") {
    urlType = "server";
  }
  if (typeof quality == "undefined") {
    quality = "75";
  }
  if (id && id !== "") {
    var image = contentLib.get({ key: id });
    if (image) {
      if (image.data.artist) {
        image.data.artist = this.forceArray(image.data.artist);
      } else {
        image.data.artist = false;
      }
      if (
        image.x &&
        image.x.media &&
        image.x.media.imageInfo &&
        image.x.media.imageInfo.contentType === "image/gif"
      ) {
        var url = portal.attachmentUrl({
          path: image._path,
          name: image._name,
          type: urlType
        });
        var urlAbsolute = portal.attachmentUrl({
          path: image._path,
          name: image._name,
          type: "absolute"
        });
      } else {
        var url = portal.imageUrl({
          id: id,
          scale: size,
          type: urlType,
          quality: quality
        });
        var urlAbsolute = portal.imageUrl({
          id: id,
          scale: size,
          type: "absolute"
        });
      }
      result = {
        url: url,
        urlAbsolute: urlAbsolute,
        alt: image.data.altText ? image.data.altText : "",
        caption: image.data.caption ? image.data.caption : "",
        artist: image.data.artist,
        _id: image._id
      };
    } else {
      result = this.getPlaceholder(placeholderType, size);
    }
  } else {
    result = this.getPlaceholder(placeholderType, size);
  }
  return result;
}

function getPlaceholder(placeholderType, size) {
  var result = {};
  switch (placeholderType) {
    case 1: {
      result = {
        url: portal.assetUrl({
          path: "images/default_avatar.png"
        }),
        alt: "City image",
        caption: "",
        placeholder: true
      };
      break;
    }
    case 2: {
      result = {
        url: portal.assetUrl({
          path: "images/townPlaceholder.jpg"
        }),
        alt: "City icon",
        caption: "",
        placeholder: true
      };
      break;
    }
    default: {
      result = {
        url: portal.assetUrl({
          path: "images/townPlaceholder.jpg"
        }),
        alt: "placeholder",
        caption: "",
        placeholder: true
      };
      break;
    }
  }
  return result;
}
