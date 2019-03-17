var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');
var portal = require('/lib/xp/portal');

exports.getCart = function( cartId ){
  var cart = {};
  if( cartId ){
    cart = getCartById( cartId );
    if( !cart ){
      cart = createCart();
    }
  } else {
    cart = createCart();
  }
  cart.items = getCartItems( cart.items );
  cart.itemsNum = calculateCartItems(cart.items);
  cart.itemsWeight = caclculateCartWeight(cart.items);
  cart.price = calculateCart( cart );
  return cart;
}

exports.modify = function( cartId, id, amount, itemSize, force ){
  var cart = this.getCart(cartId);
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cart._id,
    editor: editor
  });
  result = this.getCart(cartId);

  function editor( node ){
    if( node.items ){
      node.items = norseUtils.forceArray(node.items);
      for( var i = 0; i < node.items.length; i++ ){
        if( node.items[i].id == id && node.items[i].itemSize == itemSize ){
          if( force ){
            node.items[i].amount = amount;
          } else {
            node.items[i].amount = parseInt(node.items[i].amount) + parseInt(amount);
          }
          if( parseInt(amount) < 1 ){
            delete node.items[i];
          }
          return node;
        }
      }
      node.items.push({
        id: id,
        amount: amount,
        itemSize: itemSize
      });
      return node;
    } else {
      node.items = [{
        id: id,
        amount: amount,
        itemSize: itemSize
      }];
      return node;
    }
  }
  return result;
}

exports.setUserDetails = function( cartId, params ){
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });

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
    node.status = params.status ? params.status : node.status;
    node.ik_id = params.ik_id ? params.ik_id : node.ik_id;
    node.userId = params.userId ? params.userId : node.userId;
    return node;
  }
  return this.getCart(cartId);
}

exports.getNextId = function(){
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 0,
    query: "step = 'paid'"
  });
  return result.total;
}

function connectCartRepo(){
  return nodeLib.connect({
      repoId: "cart",
      branch: "master"
  });
}

function createCart(){
  var cart = null;
  contextLib.runAsAdmin(function () {
    var cartRepo = connectCartRepo();
    cart = cartRepo.create({});
  });
  return cart;
}

function getCartById( id ){
  var cartRepo = connectCartRepo();
  try{
    var cart = cartRepo.get( id );
    return cart;
  } catch ( e ){
    return createCart();
  }
}

function calculateCart( cart ){
  if( !cart || !cart.items ){
    return {
      items: 0,
      shipping: 0,
      total: 0
    }
  }
  var items = norseUtils.forceArray( cart.items );
  if( items == [] ){
    return {
      items: 0,
      shipping: 0,
      total: 0
    }
  }
  var result = 0;
  for( var i = 0; i < items.length; i++ ){
    var item = contentLib.get({ key: items[i]._id });
    if( item && item.data && item.data.price ){
      result += item.data.price * parseInt(items[i].amount);
    }
  }
  var shipping = getShippingPrice(cart);
  return { 
    items: result.toFixed(),
    shipping: shipping.toFixed(),
    total: (result + shipping).toFixed(),
  }
}

function getCartItems( items ){
  if( !items ){
    return [];
  }
  items = norseUtils.forceArray( items );
  if( items == [] ){
    return [];
  }
  var result = [];
  for( var i = 0; i < items.length; i++ ){
    var item = contentLib.get({ key: items[i].id });
    if( item && item.data ){
      result.push({
        _id: item._id,
        imageCart: norseUtils.getImage( item.data.mainImage, 'block(140, 140)' ),
        imageSummary: norseUtils.getImage( item.data.mainImage, 'block(90, 90)' ),
        displayName: item.displayName,
        price: item.data.price,
        amount: parseInt(items[i].amount).toFixed(),
        itemSize: items[i].itemSize
      });
    }
  }
  return result;
}

function calculateCartItems( items ){
  if( !items ){
    return 0;
  }
  items = norseUtils.forceArray( items );
  if( items == [] ){
    return 0;
  }
  var result = 0;
  for( var i = 0; i < items.length; i++ ){
    result += parseInt(items[i].amount);
  }
  return result.toFixed();
}

function caclculateCartWeight( items ){
  if( !items ){
    return 0;
  }
  items = norseUtils.forceArray( items );
  if( items == [] ){
    return 0;
  }
  var result = 0;
  for( var i = 0; i < items.length; i++ ){
    var item = contentLib.get({ key: items[i]._id });
    if( item && item.data && item.data.weight ){
      result += parseInt( item.data.weight ) * parseInt( items[i].amount );
    }
  }
  return result.toFixed();
}

function getShippingPrice( cart ){
  var site = portal.getSiteConfig();
  var shipping = contentLib.get({ key: site.shipping });
  for( var i = 0; i < shipping.data.shipping.length; i++ ){
      if( shipping.data.shipping[i].country == cart.country ){
        var shippingMethods = norseUtils.forceArray(shipping.data.shipping[i].methods);
        break;
      }
  }
  if( !shippingMethods ){
    return 0;
  }
  for( var i = 0; i < shippingMethods.length; i++ ){
    if( shippingMethods[i].id == cart.shipping ){
      var method = norseUtils.forceArray(shippingMethods[i].priceList);
      break;
    }
  }
  if( !method ){
    return 0;
  }
  for( var i = 0; i < method.length; i++ ){
    if( parseInt(cart.itemsWeight) < parseInt(method[i].weight) ){
      return parseInt(method[i].price);
    }
  }
  return method[method.length-1].price;
}

exports.getShippingPrice = getShippingPrice;