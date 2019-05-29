var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var norseUtils = require('norseUtils');
var userLib = require('userLib');
var authLib = require('/lib/xp/auth');
var cartLib = require('cartLib');
var nodeLib = require('/lib/xp/node');

exports.fixPermissions = fixPermissions;

exports.getPageComponents = function( req ) {
  var pageComponents = {};
  if( req ){
    var up = req.params;
  } else {
    var up = {};
  }
  var site = portal.getSite();
  var siteConfig = portal.getSiteConfig();
  var content = portal.getContent();

  var userServiceUrl = portal.serviceUrl({
    service: 'user'
  });
  var contentServiceUrl = portal.serviceUrl({
    service: 'content'
  });
  var cartServiceUrl = portal.serviceUrl({
    service: 'cart'
  });
  var commentsServiceUrl = portal.serviceUrl({
    service: 'comments'
  });

  if( content && content.data && content.data.mainImage ){
    var ogImage = portal.imageUrl({
      id: content.data.mainImage,
      scale: '(1,1)',
      type: 'absolute'
    });
  } else {
    var ogImage = portal.assetUrl({
      path: 'images/extended-logo-min.png',
      type: 'absolute'
    });
  }

  pageComponents['pagehead'] = thymeleaf.render( resolve('../pages/components/head.html'), {
    siteConfig: siteConfig,
    content: content,
    ogImage: ogImage,
    site: site
  });

  pageComponents['loginRegisterModal'] = thymeleaf.render( resolve('../pages/components/loginRegisterModal.html'), {});

  pageComponents['header'] = thymeleaf.render( resolve('../pages/components/header.html'), {
    menuItems: getMenuItems(),
    site: site,
    headerUser: thymeleaf.render( resolve('../pages/components/headerUser.html'), {user: userLib.getCurrentUser()})
  });
  pageComponents['footer'] = thymeleaf.render( resolve('../pages/components/footer.html'), {
    userServiceUrl: userServiceUrl,
    contentServiceUrl: contentServiceUrl,
    cartServiceUrl: cartServiceUrl,
    commentsServiceUrl: commentsServiceUrl,
    cartId: cartLib.getCart( req.cookies.cartId )._id
  });

  function getMenuItems() {
    var result = [];
    if ( siteConfig.menuItems ) {
      var items = norseUtils.forceArray( siteConfig.menuItems );
      for( var i = 0; i < items.length; i++ ){
        var tempContent = contentLib.get({ key: items[i] });
        result.push( {
          url: portal.pageUrl({ id: items[i] }),
          title: tempContent.displayName,
          active: tempContent._path === content._path ? true : false
        } );
      }
    }
    return result;
  }

  return pageComponents;
};

function checkUser(){
  var user = userLib.getCurrUser();
  var result = {};
  if( user ){
    result.user = user;
  }
  return result;
}

function fixPermissions( repo, role ){
  if( !role ){
    role = 'role:system.authenticated';
  }
  var repoConn = connectRepo(repo);
  repoConn.setRootPermissions({
      _permissions: [
          {
              "principal": role,
              "allow": [
                  "READ",
                  "CREATE",
                  "MODIFY",
                  "DELETE",
                  "PUBLISH",
                  "READ_PERMISSIONS",
                  "WRITE_PERMISSIONS"
              ],
              "deny": []
          }
      ],
      _inheritsPermissions: true
  });
}

function connectRepo( repo ){
  return nodeLib.connect({
      repoId: repo,
      branch: "master"
  });
}