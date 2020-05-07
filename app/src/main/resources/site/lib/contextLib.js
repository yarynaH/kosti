var contextLib = require("/lib/xp/context");
exports.runInDefault = runInDefault;
exports.runAsAdmin = runAsAdmin;
exports.runInDraft = runInDraft;
exports.runInDraftAsAdmin = runInDraftAsAdmin;
exports.runAsAdminAsUser = runAsAdminAsUser;
exports.runInDraftAsAdminAsUser = runInDraftAsAdminAsUser;

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

function runInDraftAsAdminAsUser(user, callback) {
  return contextLib.run(
    {
      repository: "com.enonic.cms.default",
      branch: "draft",
      user: {
        login: user.login,
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
