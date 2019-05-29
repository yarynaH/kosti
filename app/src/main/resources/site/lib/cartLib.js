var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('contextLib');
var portal = require('/lib/xp/portal');
var textEncoding = require('/lib/text-encoding');

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
  cart.stock = checkCartStock( cart.items );
  return cart;
}

exports.getCartByQr = function( qr ){
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 1,
    query: "fulltext('items.itemsIds.id', '\"" + qr + "\"', 'OR') or ngram('items.itemsIds.id', '\"" + qr + "\"', 'OR')"
  });
  if( result.total > 0 ){
    var cart = this.getCart( result.hits[0].id );
    cart.currentQrId = qr;
    for( var i = 0; i < cart.items.length; i++ ){
      cart.items = norseUtils.forceArray(cart.items);
      for( var j = 0; j < cart.items[i].itemsIds.length; j++ ){
        cart.items[i].itemsIds = norseUtils.forceArray(cart.items[i].itemsIds);
        if( cart.items[i].itemsIds[j].id == qr ){
          cart.currentQrStatus = cart.items[i].itemsIds[j].activated;
        }
      }
    }
    return cart;
  }
  return null;
}


exports.markTicketUsed = function( qr ){
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 1,
    query: "fulltext('items.itemsIds.id', '\"" + qr + "\"', 'OR') or ngram('items.itemsIds.id', '\"" + qr + "\"', 'OR')"
  });
  if( result.total > 0 ){
    var result = cartRepo.modify({
      key: result.hits[0].id,
      editor: editor
    });
  }
  function editor( node ){
    if( node.items ){
      node.items = norseUtils.forceArray(node.items);
      for( var i = 0; i < node.items.length; i++ ){
        node.items[i].itemsIds = norseUtils.forceArray(node.items[i].itemsIds);
        for( var j = 0; j < node.items[i].itemsIds.length; j++ ){
          if( node.items[i].itemsIds[j].id == qr ){
            node.items[i].itemsIds[j].activated = true;
            return node;
          }
        }
      }
    }
    return node;
  }
}


exports.getCreatedCarts = function(){
  var cartRepo = connectCartRepo();
  var result = [];
  var carts = cartRepo.query({
    start: 0,
    count: -1,
    query: "(status = 'paid' or status = 'failed' or status = 'created' or status = 'pending') and _ts > '2019-03-26T07:24:47.393Z'",
    sort: "_ts desc"
  });
  for( var i = 0; i < carts.hits.length; i++ ){
    result.push(this.getCart(carts.hits[i].id));
  }
  return result;
}

exports.modify = function( cartId, id, amount, itemSize, force ){
  var cart = this.getCart(cartId);
  var cartRepo = connectCartRepo();
  var item = contentLib.get({ key: id });
  if( item && item.data && item.data.generateIds ){
    var generateIds = parseInt(item.data.generateIds);
  }
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
          node.items[i].generateIds = generateIds ? generateIds : node.items[i].generateIds;
          if( parseInt(amount) < 1 ){
            delete node.items[i];
          }
          return node;
        }
      }
      node.items.push({
        id: id,
        amount: amount,
        itemSize: itemSize,
        generateIds: generateIds ? generateIds : null
      });
      return node;
    } else {
      node.items = [{
        id: id,
        amount: amount,
        itemSize: itemSize,
        generateIds: generateIds ? generateIds : null
      }];
      return node;
    }
  }
  return result;
}

function modifyInventory( items ){
  items = norseUtils.forceArray(items);
  for( var i = 0; i < items.length; i++ ){
    var result = contentLib.modify({
      key: items[i]._id,
      requireValid: false,
      branch: 'draft',
      editor: (function (node) {
        return editor(node, items[i]);
      })
    });
    contentLib.publish({
      keys: [items[i]._id],
      sourceBranch: 'draft',
      targetBranch: 'master'
    });
  }
  function editor( node, item ){
    if( typeof node.data.inventory !== 'undefined' && node.data.inventory > 0 ){
      node.data.inventory = node.data.inventory - item.amount;
    }
    if( node.data.sizes ){
      node.data.sizes = norseUtils.forceArray(node.data.sizes);
      for( var j = 0; j < node.data.sizes.length; j++ ){
        if( node.data.sizes[j].title == item.itemSize ){
          node.data.sizes[j].amount = node.data.sizes[j].amount - item.amount;
          break;
        }
      }
    }
    return node;
  }
}

exports.modifyInventory = modifyInventory;

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
    node.novaPoshtaСity = params.novaPoshtaСity ? params.novaPoshtaСity : node.novaPoshtaСity;
    node.novaPoshtaWarehouse = params.novaPoshtaWarehouse ? params.novaPoshtaWarehouse : node.novaPoshtaWarehouse;
    return node;
  }
  return this.getCart(cartId);
}

exports.generateItemsIds = function( cartId ){
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });
  function editor( node ){
    if( node && node.items ){
      node.items = norseUtils.forceArray(node.items);
      for( var i = 0; i < node.items.length; i++ ){
        node.items[i].itemsIds = [];
        var idsCount = parseInt(node.items[i].amount);
        if( node.items[i].generateIds ){
          idsCount = idsCount * parseInt(node.items[i].generateIds);
        }
        for( var j = 0; j < idsCount; j++ ){
          node.items[i].itemsIds.push({
            id: textEncoding.md5( node.name + ' ' + node.surname + ' ' + node.items[i].id + ' ' + (new Date().getTime()) + ' ' + j + ' ' + i ),
            activated: false
          });
        }
      } 
    }
    return node;
  }
  return this.getCart(cartId);
}

exports.getNextId = function(){
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 10,
    query: ""
  });
  return (result.total + 1).toFixed();
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
    if( item && item.data && typeof item.data.inventory === 'undefined' ){ item.data.inventory = 99999999 }
    if( item && item.data ){
      result.push({
        _id: item._id,
        imageCart: norseUtils.getImage( item.data.mainImage, 'block(140, 140)', false, 'absolute' ),
        imageSummary: norseUtils.getImage( item.data.mainImage, 'block(90, 90)', false, 'absolute' ),
        displayName: item.displayName,
        stock: item.data.inventory >= parseInt(items[i].amount),
        price: item.data.price,
        finalPrice: item.data.finalPrice,
        amount: parseInt(items[i].amount).toFixed(),
        itemSize: items[i].itemSize,
        itemSizeStock: checkItemSizeStock( items[i].itemSize, parseInt(items[i].amount), item._id),
        itemsIds: norseUtils.forceArray(items[i].itemsIds)
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
      result += parseFloat( item.data.weight ) * parseInt( items[i].amount );
    }
  }
  return result;
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

function checkCartStock( items ){
  for( var i = 0; i < items.length; i++ ){
    if( !items[i].stock || !items[i].itemSizeStock ){
      return false;
    }
  }
  return true;
}

function checkItemSizeStock( size, amount, id ) {
  var item = contentLib.get({ key: id });
  if( item && item.data && item.data.sizes ){
    var sizes = norseUtils.forceArray(item.data.sizes);
    for( var i = 0; i < sizes.length; i++ ){
      if( sizes[i].title == size ){
        if( parseInt(amount) <= parseInt(sizes[i].amount) ){
          return true;
          break;
        }
      }
    }
  } else {
    return true;
  }
  return false;
}