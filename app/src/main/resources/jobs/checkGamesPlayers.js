const norseUtils = require("../site/lib/norseUtils");
const formPlayerLib = require("../site/lib/games/formPlayerLib");

exports.run = function () {
  formPlayerLib.checkPlayersCartsBooking();
};
