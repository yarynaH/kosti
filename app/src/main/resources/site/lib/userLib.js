const contentLib = require("/lib/xp/content");
const portal = require("/lib/xp/portal");
const norseUtils = require("norseUtils");
const hashLib = require("hashLib");
const mailsLib = require("mailsLib");
const authLib = require("/lib/xp/auth");
const contextLib = require("contextLib");
const common = require("/lib/xp/common");
const i18nLib = require("/lib/xp/i18n");
const thymeleaf = require("/lib/thymeleaf");
const textEncoding = require("/lib/text-encoding");
const httpClientLib = require("/lib/http-client");
const permissions = require("permissions");

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
exports.discordRegister = discordRegister;
exports.fbRegister = fbRegister;
exports.vkRegister = vkRegister;
exports.addRole = addRole;
exports.getDiscordData = getDiscordData;

function addRole(roleId, userKey) {
  contextLib.runAsAdmin(function () {
    authLib.addMembers("role:" + roleId, [userKey]);
  });
}

function getCurrentUser() {
  var user = authLib.getUser();
  var userObj = false;
  if (user && user.email && user.displayName) {
    userObj = contentLib.query({
      query: "data.email = '" + user.email + "'",
      contentTypes: [app.name + ":user"]
    });
    if (userObj.hits && userObj.hits[0]) {
      userObj = userObj.hits[0];
    } else {
      userObj = contextLib.runAsAdminAsUser(user, function () {
        return createUserContentType(
          user.displayName,
          null,
          user.email,
          user.key
        );
      });
    }
    return beautifyUser(userObj, user);
  }
  return userObj;
}

function beautifyUser(userObj, user) {
  var notificationLib = require("notificationLib");
  userObj.url = portal.pageUrl({ id: userObj._id });
  userObj.image = norseUtils.getImage(
    userObj.data && userObj.data.userImage ? userObj.data.userImage : null,
    "block(32,32)",
    1
  );
  userObj.key = user.key;
  userObj.login = user.login;
  contextLib.runAsAdmin(function () {
    userObj.roles = {
      moderator: checkRole(["role:moderator", "role:system.admin"]),
      gameMaster: checkRole(["role:gameMaster", "role:system.admin"])
    };
  });
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
  var currUser = getCurrentUser();
  if (currUser._id != data.id) {
    return false;
  }
  var user = contentLib.modify({
    key: currUser._id,
    editor: userEditor
  });
  var publishResult = contextLib.runAsAdminAsUser(currUser, function () {
    return contentLib.publish({
      keys: [user._id],
      sourceBranch: "master",
      targetBranch: "draft",
      includeDependencies: false
    });
  });
  function userEditor(node) {
    node.displayName = data.displayName ? data.displayName : node.displayName;
    node.data.firstName = data.firstName ? data.firstName : node.data.firstName;
    node.data.lastName = data.lastName ? data.lastName : node.data.lastName;
    node.data.city = data.city ? data.city : node.data.city;
    node.data.phone = data.phone ? data.phone : node.data.phone;
    return node;
  }
  return true;
}

function checkRole(roles) {
  roles = norseUtils.forceArray(roles);
  for (var i = 0; i < roles.length; i++) {
    if (authLib.hasRole(roles[i])) {
      return true;
    }
  }
  return false;
}

function getSystemUser(name, keyOnly) {
  var user = contextLib.runAsAdmin(function () {
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

function vkRegister(code) {
  var site = portal.getSite();
  var url =
    "https://oauth.vk.com/access_token?" +
    "client_id=7018935&client_secret=5qh6sNny1XFW73sPEQXw&" +
    "code=" +
    code +
    "&" +
    "redirect_uri=" +
    portal.pageUrl({ _path: site._path, type: "absolute" }) +
    "user/auth/vk";
  var emailRequest = JSON.parse(
    httpClientLib.request({
      url: url,
      method: "GET",
      connectionTimeout: 2000000,
      readTimeout: 500000
    }).body
  );
  var newUrl =
    "https://api.vk.com/method/users.get?v=5.102&uid=" +
    emailRequest.user_id +
    "&fields=photo_max_orig" +
    "&access_token=" +
    emailRequest.access_token;
  var profileRequest = JSON.parse(
    httpClientLib.request({
      url: newUrl,
      method: "GET",
      connectionTimeout: 2000000,
      readTimeout: 500000
    }).body
  ).response[0];
  if (
    emailRequest &&
    profileRequest &&
    emailRequest.email &&
    (profileRequest.first_name || profileRequest.last_name)
  ) {
    return register(
      profileRequest.first_name + " " + profileRequest.last_name,
      emailRequest.email,
      null,
      true,
      profileRequest.photo_max_orig
    );
  }
}

function discordRegister(code, redirect) {
  var site = portal.getSite();
  var data =
    "&redirect_uri=" +
    portal.pageUrl({ _path: site._path, type: "absolute" }) +
    (redirect ? redirect : "user/auth/discord");
  data += "&grant_type=authorization_code";
  data += "&scope=identify%20email";
  data += "&code=" + code;
  var request = httpClientLib.request({
    url: "https://discordapp.com/api/oauth2/token",
    method: "POST",
    body: data,
    connectionTimeout: 2000000,
    readTimeout: 500000,
    contentType: "application/x-www-form-urlencoded",
    auth: {
      user: "605493268326776853",
      password: "wS6tHC4ygjIAo5gZNskzEpeetVOk0N62"
    }
  });
  var response = JSON.parse(request.body);
  request = httpClientLib.request({
    url: "https://discordapp.com/api/users/@me",
    method: "GET",
    connectionTimeout: 2000000,
    readTimeout: 500000,
    contentType: "application/x-www-form-urlencoded",
    headers: {
      Authorization: response.token_type + " " + response.access_token
    }
  });
  response = JSON.parse(request.body);
  if (response && response.email && response.username) {
    return register(
      response.username,
      response.email,
      null,
      true,
      response.avatar
        ? "https://cdn.discordapp.com/avatars/" +
            response.id +
            "/" +
            response.avatar
        : null,
      response.id ? { discord: response.id } : null
    );
  }
  return false;
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
function fbRegister(token, userId) {
  var response = JSON.parse(
    httpClientLib.request({
      url:
        "https://graph.facebook.com/" +
        userId +
        "/?fields=email,name&access_token=" +
        token,
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
      "https://graph.facebook.com/" + userId + "/picture?width=1900&height=1900"
    );
  }
  return false;
}

function register(name, mail, pass, tokenRegister, image, otherData) {
  var site = portal.getSite();
  var displayName = name;
  var exist = contextLib.runAsAdmin(function () {
    return checkUserExists(name, mail);
  });
  if (exist.exist && exist.type === "mail" && tokenRegister) {
    contextLib.runAsAdmin(function () {
      if (otherData) updateUserSocial(mail, otherData);
    });
    return login(mail, pass, tokenRegister);
  } else if (exist.exist && exist.type === "name" && tokenRegister) {
    var date = new Date();
    name = name + "-" + date.getTime();
  } else if (exist.exist) {
    exist.message = i18nLib.localize({
      key: "global.user." + exist.type + "Exists",
      locale: "ru"
    });
    return exist;
  }
  var user = contextLib.runAsAdmin(function () {
    return authLib.createUser({
      idProvider: "system",
      name: common.sanitize(name),
      displayName: name,
      email: mail
    });
  });
  var userObj = contextLib.runAsAdminAsUser(user, function () {
    return createUserContentType(name, displayName, mail, user.key);
  });
  if (image) {
    var response = httpClientLib.request({
      url: image,
      method: "GET"
    });
    var responseStream = response.bodyStream;
    var userImg = contextLib.runAsAdmin(function () {
      createUserImageObj(responseStream, userObj);
    });
  }
  if (otherData) {
    contextLib.runAsAdmin(function () {
      updateUserSocial(mail, otherData);
    });
  }
  if (!tokenRegister) {
    var activationHash = contextLib.runAsAdmin(function () {
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

function createUserContentType(name, displayName, mail, userKey) {
  if (!displayName) {
    displayName = name;
  }
  var site = portal.getSiteConfig();
  var usersLocation = contentLib.get({ key: site.userLocation });
  var user = {};
  contextLib.runInDraft(function () {
    user = contentLib.create({
      parentPath: usersLocation._path,
      name: common.sanitize(name),
      displayName: displayName,
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
      permissions: permissions.default(userKey)
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
  var user = contextLib.runAsAdmin(function () {
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
      html: thymeleaf.render(
        resolve("../pages/components/header/headerUser.html"),
        {
          user: getCurrentUser()
        }
      ),
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
  var currUser = getCurrentUser();
  var user = contentLib.modify({
    key: currUser._id,
    editor: userEditor
  });
  var publishResult = contextLib.runAsAdminAsUser(currUser, function () {
    return contentLib.publish({
      keys: [user._id],
      sourceBranch: "master",
      targetBranch: "draft",
      includeDependencies: false
    });
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

exports.logout = function () {
  return authLib.logout();
};

function forgotPass(email, hash) {
  var user = contextLib.runAsAdmin(function () {
    return hashLib.getUserByHash(email, hash, "resetPassHash");
  });
  if (user && user !== true) {
    return user.key;
  }
  return false;
}

function setNewPass(password, email, hash) {
  return contextLib.runAsAdmin(function () {
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
  var userExist = contextLib.runAsAdmin(function () {
    return checkUserExists(false, email).exist;
  });
  if (!userExist) {
    return {
      status: 404,
      message: "Пользователь не найден."
    };
  }
  var hash = contextLib.runAsAdmin(function () {
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
  return contextLib.runAsAdmin(function () {
    return hashLib.activateUserHash(mail, hash, "registerHash");
  });
}

exports.uploadUserImage = function () {
  var stream = portal.getMultipartStream("userImage");
  var user = this.getCurrentUser();
  var image = createUserImageObj(stream, user);
  return norseUtils.getImage(image._id, "block(140,140)");
};

function checkUserExists(name, mail) {
  var user = false;
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
  if (name) {
    user = authLib.findUsers({
      start: 0,
      count: 1,
      query: 'login="' + name + '"'
    });
    if (user.total > 0) {
      return {
        exist: true,
        type: "login"
      };
    }
    user = authLib.findUsers({
      start: 0,
      count: 1,
      query: '_name="' + common.sanitize(name) + '"'
    });
    if (user.total > 0) {
      return {
        exist: true,
        type: "name"
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
  var image = contentLib.createMedia({
    name: hashLib.generateHash(user.displayName),
    parentPath: user._path,
    data: stream
  });
  user = contentLib.modify({
    key: user._path,
    editor: userImageEditor
  });
  contextLib.runAsAdminAsUser(user, function () {
    contentLib.publish({
      keys: [image._id, user._id],
      sourceBranch: "master",
      targetBranch: "draft",
      includeDependencies: false
    });
  });
  return image;
  function userImageEditor(user) {
    user.data.userImage = image._id;
    return user;
  }
}

function updateUserSocial(email, data) {
  if (!email || !data) return null;
  let user = contentLib.query({
    query: "data.email = '" + email + "'",
    contentTypes: [app.name + ":user"]
  });
  if (user.total !== 1) return null;
  user = user.hits[0];
  if (
    data.discord ||
    !user.data ||
    !user.data.discord ||
    user.discord.data !== data.discord
  ) {
    let userData = user.data;
    userData.discord = data.discord;
    user = contentLib.modify({
      key: user._id,
      editor: socialEditor
    });
    let publishResult = contentLib.publish({
      keys: [user._id],
      sourceBranch: "master",
      targetBranch: "draft",
      includeDependencies: false
    });
    function socialEditor(node) {
      node.data = userData;
      return node;
    }
  }
}

function getDiscordData(id) {
  let user = contentLib.get({ key: id });
  if (user && user.data && user.data.discord) {
    let response = httpClientLib.request({
      url: "https://discordapp.com/api/users/" + user.data.discord,
      method: "GET",
      connectionTimeout: 2000000,
      readTimeout: 500000,
      headers: {
        Authorization: "Bot " + app.config.discordbottoken
      }
    });
    if (response.status === 200) {
      response = JSON.parse(response.body);
      if (response.id && response.username) return response;
    }
  }
  return null;
}
