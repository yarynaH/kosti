let portal = require("/lib/xp/portal");
let thymeleaf = require("/lib/thymeleaf");
let contentLib = require("/lib/xp/content");
let libLocation = "../../lib/";
let storeLib = require(libLocation + "storeLib");
let norseUtils = require(libLocation + "norseUtils");

exports.get = function(req) {
  let component = portal.getComponent();
  let ticketsSold = storeLib.getSoldTicketsAmount(component.config.products);
  let progress = Math.min(
    (ticketsSold / component.config.milestone) * 100,
    100
  );
  let view = resolve("ticketsBar.html");
  let model = { progress: progress.toFixed() };
  let body = thymeleaf.render(view, model);
  return {
    body: body,
    contentType: "text/html"
  };
};
