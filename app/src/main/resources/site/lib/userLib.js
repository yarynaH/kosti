var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var norseUtils = require("norseUtils");
var hashLib = require("hashLib");
var mailsLib = require("mailsLib");
var authLib = require("/lib/xp/auth");
var contextLib = require("contextLib");
var common = require("/lib/xp/common");
var i18nLib = require("/lib/xp/i18n");
var thymeleaf = require("/lib/thymeleaf");
var textEncoding = require("/lib/text-encoding");
var httpClientLib = require("/lib/http-client");

exports.findUser = findUser;
exports.activateUser = activateUser;
exports.getCurrentUser = getCurrentUser;
exports.addBookmark = addBookmark;
exports.checkIfBookmarked = checkIfBookmarked;
exports.getUserDataById = getUserDataById;
exports.checkRole = checkRole;
exports.getSystemUser = getSystemUser;
exports.editUser = editUser;
exports.jwtRegister = jwtRegister;
exports.forgotPass = forgotPass;
exports.register = register;
exports.createUserContentType = createUserContentType;
exports.login = login;

function getCurrentUser() {
  var user = authLib.getUser();
  var userObj = false;
  if (user && user.email && user.displayName) {
    userObj = contentLib.query({
      query:
        "data.email = '" +
        user.email +
        "' AND displayName = '" +
        user.displayName +
        "'",
      contentTypes: [app.name + ":user"]
    });
    if (userObj.hits && userObj.hits[0]) {
      userObj = userObj.hits[0];
    } else {
      userObj = contextLib.runAsAdmin(function() {
        return createUserContentType(user.displayName, user.email, user.key);
      });
    }
    return beautifyUser(userObj, user.key);
  }
  return userObj;
}

function beautifyUser(userObj, key) {
  var notificationLib = require("notificationLib");
  userObj.url = portal.pageUrl({ id: userObj._id });
  userObj.image = norseUtils.getImage(
    userObj.data && userObj.data.userImage ? userObj.data.userImage : null,
    "block(32,32)",
    1
  );
  userObj.key = key;
  userObj.moderator = checkRole(["role:moderator", "role:system.admin"]);
  userObj.notificationsCounter = notificationLib.getNotificationsForUser(
    userObj._id,
    null,
    null,
    true,
    true
  );
  return userObj;
}

function editUser(data) {
  var user = getCurrentUser();
  if (user._id != data.id) {
    return false;
  }
  user = contentLib.modify({
    key: user._id,
    editor: userEditor
  });
  var publishResult = contentLib.publish({
    keys: [user._id],
    sourceBranch: "master",
    targetBranch: "draft"
  });
  function userEditor(node) {
    node.data.firstName = data.firstName ? data.firstName : node.data.firstName;
    node.data.lastName = data.lastName ? data.lastName : node.data.lastName;
    node.data.city = data.city ? data.city : node.data.city;
    node.data.phone = data.phone ? data.phone : node.data.phone;
    return node;
  }
  return true;
}

function checkRole(roles) {
  for (var i = 0; i < roles.length; i++) {
    if (authLib.hasRole(roles[i])) {
      return true;
    }
  }
  return false;
}

function getSystemUser(name, keyOnly) {
  var user = contextLib.runAsAdmin(function() {
    return findUser(name);
  });
  if (!user) {
    return false;
  }
  if (keyOnly) {
    return user.key;
  }
  return user;
}

function getUserDataById(id) {
  if (!id) {
    return {
      displayName: "Пользователь удален",
      url: null,
      image: norseUtils.getImage(null, "block(32,32)", 1),
      _id: null,
      key: null
    };
  }
  var user = contentLib.get({ key: id });
  if (!user || !user.data) {
    return {
      displayName: "Пользователь удален",
      url: null,
      image: norseUtils.getImage(null, "block(32,32)", 1),
      _id: null,
      key: null
    };
  }
  return {
    displayName: user.displayName,
    url: portal.pageUrl({ id: user._id }),
    image: norseUtils.getImage(user.data.userImage, "block(32,32)", 1),
    _id: user._id,
    key: getSystemUser(user.data.email, true)
  };
}

function jwtRegister(token) {
  var response = JSON.parse(
    httpClientLib.request({
      url: "https://oauth2.googleapis.com/tokeninfo?id_token=" + token,
      method: "GET",
      headers: {
        "X-Custom-Header": "header-value"
      },
      connectionTimeout: 2000000,
      readTimeout: 500000,
      contentType: "application/json"
    }).body
  );
  if (response && response.email && response.name) {
    return register(
      response.name,
      response.email,
      null,
      true,
      response.picture
    );
  }
  return false;
}

function register(name, mail, pass, tokenRegister, image) {
  var site = portal.getSite();
  var exist = contextLib.runAsAdmin(function() {
    return checkUserExists(name, mail);
  });
  if (exist.exist && tokenRegister) {
    return login(mail, pass, tokenRegister);
  } else if (exist.exist) {
    exist.message = i18nLib.localize({
      key: "global.user." + exist.type + "Exists",
      locale: "ru"
    });
    return exist;
  }
  var user = contextLib.runAsAdmin(function() {
    return authLib.createUser({
      idProvider: "system",
      name: common.sanitize(name),
      displayName: name,
      email: mail
    });
  });
  var userObj = contextLib.runAsAdmin(function() {
    return createUserContentType(name, mail, user.key);
  });
  if (image) {
    var response = httpClientLib.request({
      url: image,
      method: "GET"
    });
    var responseStream = response.bodyStream;
    var userImg = contextLib.runAsAdmin(function() {
      createUserImageObj(responseStream, userObj);
    });
  }
  if (!tokenRegister) {
    var activationHash = contextLib.runAsAdmin(function() {
      authLib.changePassword({
        userKey: user.key,
        password: pass
      });
      return hashLib.saveHashForUser(mail, "registerHash");
    });
    var sent = mailsLib.sendMail("userActivation", mail, {
      activationHash: activationHash
    });
  }
  if (tokenRegister) {
    return login(mail, pass, tokenRegister);
  } else if (userObj) {
    return login(mail, pass);
  } else {
    return false;
  }
}

function createUserContentType(name, mail, userkey) {
  var site = portal.getSiteConfig();
  var usersLocation = contentLib.get({ key: site.userLocation });
  var user = {};
  contextLib.runInDraft(function() {
    user = contentLib.create({
      parentPath: usersLocation._path,
      name: common.sanitize(name),
      displayName: name,
      contentType: app.name + ":user",
      language: "ru",
      data: {
        email: mail
      }
    });
    contentLib.setPermissions({
      key: user._id,
      inheritPermissions: false,
      overwriteChildPermissions: true,
      permissions: [
        {
          principal: userkey,
          allow: [
            "READ",
            "CREATE",
            "MODIFY",
            "PUBLISH",
            "READ_PERMISSIONS",
            "WRITE_PERMISSIONS"
          ],
          deny: ["DELETE"]
        },
        {
          principal: "role:system.everyone",
          allow: ["READ"],
          deny: []
        }
      ]
    });
  });

  var result = contentLib.publish({
    keys: [user._id],
    sourceBranch: "draft",
    targetBranch: "master"
  });
  return user;
}

function login(name, pass, token) {
  if (!token) {
    var token = false;
  }
  var user = contextLib.runAsAdmin(function() {
    return findUser(name);
  });
  if (!user) {
    return {
      exist: false,
      message: i18nLib.localize({
        key: "global.user.userNotExists",
        locale: "ru"
      })
    };
  }
  var loginResult = authLib.login({
    user: user.login,
    password: pass,
    userStore: "system",
    skipAuth: token
  });
  if (loginResult.authenticated === true) {
    return {
      html: thymeleaf.render(resolve("../pages/components/headerUser.html"), {
        user: getCurrentUser()
      }),
      exist: true,
      authenticated: true
    };
  } else {
    return {
      exist: false,
      message: i18nLib.localize({
        key: "global.user.incorrectPass",
        locale: "ru"
      })
    };
  }
}

function addBookmark(contentId) {
  var user = getCurrentUser();
  user = contentLib.modify({
    key: user._id,
    editor: userEditor
  });
  var publishResult = contentLib.publish({
    keys: [user._id],
    sourceBranch: "master",
    targetBranch: "draft"
  });
  function userEditor(user) {
    var temp = norseUtils.forceArray(user.data.bookmarks);
    if (!temp) {
      temp = [];
    }
    if (temp.indexOf(contentId) == -1) {
      temp.push(contentId);
    } else {
      temp.splice(temp.indexOf(contentId), 1);
    }
    user.data.bookmarks = temp;
    return user;
  }
  return checkIfBookmarked(contentId);
}

function checkIfBookmarked(contentId) {
  var user = getCurrentUser();
  if (
    user &&
    user.data &&
    user.data.bookmarks &&
    user.data.bookmarks.indexOf(contentId) != -1
  ) {
    return true;
  }
  return false;
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

exports.logout = function() {
  return authLib.logout();
};

function forgotPass(email, hash) {
  var user = contextLib.runAsAdmin(function() {
    return hashLib.getUserByHash(email, hash, "resetPassHash");
  });
  if (user && user !== true) {
    return user.key;
  }
  return false;
}

function setNewPass(password, email, hash) {
  return contextLib.runAsAdmin(function() {
    var user = forgotPass(email, hash);
    if (user) {
      authLib.changePassword({
        userKey: user,
        password: password
      });
      hashLib.activateUserHash(email, hash, "resetPassHash");
      return true;
    }
    return false;
  });
}

exports.setNewPass = setNewPass;

function resetPass(email) {
  if (!email || email == "") {
    return {
      status: 404,
      message: "Пользователь не найден."
    };
  }
  var userExist = contextLib.runAsAdmin(function() {
    return checkUserExists(false, email).exist;
  });
  if (!userExist) {
    return {
      status: 404,
      message: "Пользователь не найден."
    };
  }
  var hash = contextLib.runAsAdmin(function() {
    return hashLib.saveHashForUser(email, "resetPassHash");
  });
  mailsLib.sendMail("forgotPass", email, { forgotPassHash: hash });
  return {
    status: 200,
    message: "Инструкции отправленны вам на почту."
  };
}

exports.resetPass = resetPass;

function activateUser(mail, hash) {
  return contextLib.runAsAdmin(function() {
    return hashLib.activateUserHash(mail, hash, "registerHash");
  });
}

exports.uploadUserImage = function() {
  var stream = portal.getMultipartStream("userImage");
  var user = this.getCurrentUser();
  var image = createUserImageObj(stream, user);
  return norseUtils.getImage(image._id, "block(140,140)");
};

function checkUserExists(name, mail) {
  var user = false;
  if (name) {
    user = authLib.findUsers({
      start: 0,
      count: 1,
      query: 'login="' + name + '"'
    });
    if (user.total > 0) {
      return {
        exist: true,
        type: "name"
      };
    }
  }
  if (mail) {
    user = authLib.findUsers({
      start: 0,
      count: 1,
      query: 'email="' + mail + '"'
    });
    if (user.total > 0) {
      return {
        exist: true,
        type: "mail"
      };
    }
  }
  return {
    exist: false
  };
}

function sendConfirmationMail(mail) {
  var hash = hashLib.saveHashForUser(mail, "registerHash");
}

function createUserImageObj(stream, user) {
  var image = {};
  contextLib.runInDraft(function() {
    image = contentLib.createMedia({
      name: hashLib.generateHash(user.displayName),
      parentPath: user._path,
      data: stream
    });
    user = contentLib.modify({
      key: user._path,
      editor: userImageEditor
    });
  });
  var publishResult = contentLib.publish({
    keys: [image._id, user._id],
    sourceBranch: "draft",
    targetBranch: "master"
  });
  return image;
  function userImageEditor(user) {
    user.data.userImage = image._id;
    return user;
  }
}
