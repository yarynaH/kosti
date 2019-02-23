var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');

exports.getOrder = function( orderId ){
  var ordersRepo = connectOrdersRepo();
  try{
    var order = ordersRepo.get( orderId );
    return order;
  } catch ( e ){
    return null;
  }
}

exports.createOrder = function( params ){
  var ordersRepo = connectOrdersRepo();
  params.step = 'new';
  params.ik_id = params.surname.toLowerCase() + '_' + new Date().getTime();
  return ordersRepo.create( params );
}

exports.modifyOrder = function( orderId, params ){
  var order = this.getOrder(orderId);
  var ordersRepo = connectOrdersRepo();
  var result = ordersRepo.modify({
    key: order._id,
    editor: editor
  });
  result = this.getOrder(orderId);

  function editor( node ){
    node.country = params.country ? params.country : node.country;
    node.address = params.address ? params.address : node.address;
    node.city = params.city ? params.city : node.city;
    node.phone = params.phone ? params.phone : node.phone;
    node.surname = params.surname ? params.surname : node.surname;
    node.name = params.name ? params.name : node.name;
    node.shipping = params.shipping ? params.shipping : node.shipping;
    node.email = params.email ? params.email : node.email;
    node.cartId = params.cartId ? params.cartId : node.cartId;
    node.step = params.step ? params.step : node.step;
    return node;
  }
  return result;
}

function connectOrdersRepo(){
  return nodeLib.connect({
    repoId: "orders",
    branch: "master"
  });
}