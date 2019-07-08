var contextLib = require("/lib/xp/context");

exports.runAsAdmin = function(callback) {
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
};
exports.runInDraft = function(callback) {
  return contextLib.run(
    {
      branch: "draft"
    },
    callback
  );
};

exports.runInDraftAsAdmin = function(callback) {
  return contextLib.run(
    {
      branch: "draft",
      user: {
        login: "mvy",
        userStore: "system"
      },
      principals: ["role:system.admin"]
    },
    callback
  );
};
