var contextLib = require("/lib/xp/context");
exports.runInDefault = runInDefault;
exports.runAsAdmin = runAsAdmin;
exports.runInDraft = runInDraft;
exports.runInDraftAsAdmin = runInDraftAsAdmin;
exports.runAsAdminAsUser = runAsAdminAsUser;
exports.getBranch = getBranch;
exports.runAsAdminInDefault = runAsAdminInDefault;

function runAsAdmin(callback) {
  return contextLib.run(
    {
      user: {
        login: "mvy",
        userStore: "system"
      },
      principals: ["role:system.admin"]
    },
    callback
  );
}

function runAsAdminInDefault(callback) {
  return contextLib.run(
    {
      repository: "com.enonic.cms.default",
      branch: "master",
      principals: ["role:system.admin"]
    },
    callback
  );
}

function runAsAdminAsUser(user, callback) {
  return contextLib.run(
    {
      user: {
        login: user.login,
        userStore: "system"
      },
      principals: ["role:system.admin"]
    },
    callback
  );
}

function runInDraft(callback) {
  return contextLib.run(
    {
      branch: "draft"
    },
    callback
  );
}

function runInDraftAsAdmin(callback) {
  return contextLib.run(
    {
      repository: "com.enonic.cms.default",
      branch: "draft",
      user: {
        login: "mvy",
        userStore: "system"
      },
      principals: ["role:system.admin"]
    },
    callback
  );
}

function runInDefault(callback) {
  return contextLib.run(
    {
      repository: "com.enonic.cms.default",
      branch: "master"
    },
    callback
  );
}

function getBranch() {
  return contextLib.get().branch;
}
