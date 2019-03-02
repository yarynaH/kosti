var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');

exports.getCart = function( cartId ){
  var cart = {};
  if( cartId ){
    cart = getCartById( cartId );
    if( cart ){
      cart.price = calculateCart( cart );
      cart.items = getCartItems( cart.items );
      cart.itemsNum = calculateCartItems(cart.items);
    } else {
      cart = createCart();
      cart.price = calculateCart( cart );
      cart.items = getCartItems( cart.items );
      cart.itemsNum = calculateCartItems(cart.items);
    }
  } else {
    cart = createCart();
    cart.price = calculateCart( cart );
    cart.items = getCartItems( cart.items );
    cart.itemsNum = calculateCartItems(cart.items);
  }
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

exports.setOrder = function( cartId, orderId ){
  var cart = this.getCart(cartId);
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cart._id,
    editor: editor
  });
  result = this.getCart(cartId);

  function editor( node ){
    node.orderId = orderId;
    return node;
  }
  return result;
}

exports.setShipping = function( cartId, shipping ){
  var cart = this.getCart(cartId);
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cart._id,
    editor: editor
  });
  result = this.getCart(cartId);

  function editor( node ){
    node.shipping = shipping;
    return node;
  }
  return result;
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
  cart.total = calculateCart( cart );
  cart.items = getCartItems( cart.items );
  cart.itemsNum = calculateCartItems(cart.items);
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
    var item = contentLib.get({ key: items[i].id });
    if( item && item.data && item.data.price ){
      result += item.data.price * parseInt(items[i].amount);
    }
  }
  var shipping = 0;
  if( cart.shipping && cart.shipping.price ){
    shipping = parseInt(cart.shipping.price);
  }
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