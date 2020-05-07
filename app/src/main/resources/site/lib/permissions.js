exports.full = function (user) {
  return [
    {
      principal: user,
      allow: [
        "READ",
        "CREATE",
        "MODIFY",
        "PUBLISH",
        "READ_PERMISSIONS",
        "WRITE_PERMISSIONS",
        "DELETE"
      ]
    },
    {
      principal: "role:system.everyone",
      allow: ["READ"],
      deny: []
    }
  ];
};
exports.default = function (user) {
  return [
    {
      principal: user,
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
  ];
};
exports.notification = function () {
  return [
    {
      principal: "role:system.authenticated",
      allow: ["READ", "MODIFY", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
      deny: []
    }
  ];
};
exports.comment = function () {
  return [
    {
      principal: "role:system.authenticated",
      allow: ["READ", "MODIFY", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
      deny: []
    },
    {
      principal: "role:system.everyone",
      allow: ["READ"],
      deny: []
    }
  ];
};
