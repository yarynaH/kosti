let contentLib = require("/lib/xp/content");
let portal = require("/lib/xp/portal");
let norseUtils = require("norseUtils");
let sharedLib = require("sharedLib");

exports.getSoldTicketsAmount = getSoldTicketsAmount;

function getSoldTicketsAmount(ids) {
  if (!ids) return false;
  let cartRepo = sharedLib.connectRepo("cart");
  ids = norseUtils.forceArray(ids);
  let orders = cartRepo.query({
    start: 0,
    count: -1,
    query: "items.id in ('" + ids.join("','") + "') and status = 'paid'"
  });
  let result = 0;
  for (let i = 0; i < orders.hits.length; i++) {
    result += countTickets(orders.hits[i].id, ids);
  }
  return result;
}

function countTickets(orderId, itemIds) {
  let cartRepo = sharedLib.connectRepo("cart");
  let order = cartRepo.get(orderId);
  let result = 0;
  order.items = norseUtils.forceArray(order.items);
  for (let i = 0; i < order.items.length; i++) {
    if (itemIds.indexOf(order.items[i].id) !== -1 && order.items[i].itemsIds) {
      order.items[i].itemsIds = norseUtils.forceArray(order.items[i].itemsIds);
      result += order.items[i].itemsIds.length;
    }
  }
  return result;
}
