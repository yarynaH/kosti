var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');

exports.getCart = function( cartId ){
  if( cartId ){
    return getCartById( cartId );
  } else {
    return createCart();
  }
}

exports.modify = function( cartId, id, amount ){
  var cart = this.getCart(cartId);
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cart._id,
    editor: editor
  });

  function editor( node ){
    if( node.items ){
      node.items = norseUtils.forceArray(node.items);
      for( var i = 0; i < node.items.length; i++ ){
        if( node.items[i].id == id ){
          node.items[i].amount = amount;
          return node;
        }
      }
      node.items.push({
        id: id,
        amount: amount
      });
      return node;
    } else {
      node.items = [{
        id: id,
        amount: amount
      }];
      return node;
    }
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
    var cartRepo = connectCartRepo();
    return cartRepo.create({});
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