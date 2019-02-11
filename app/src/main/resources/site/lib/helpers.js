var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var userLib = require('userLib');
var authLib = require('/lib/xp/auth');

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

  pageComponents['pagehead'] = thymeleaf.render( resolve('../pages/components/head.html'), {
    siteConfig: siteConfig,
    content: content,
    site: site
  });

  pageComponents['loginRegisterModal'] = thymeleaf.render( resolve('../pages/components/loginRegisterModal.html'), {});

  pageComponents['header'] = thymeleaf.render( resolve('../pages/components/header.html'), {
    menuItems: getMenuItems(),
    site: site,
    user: userLib.getCurrentUser()
  });
  pageComponents['footer'] = thymeleaf.render( resolve('../pages/components/footer.html'), {
    userServiceUrl: userServiceUrl,
    contentServiceUrl: contentServiceUrl
  });

  function getMenuItems() {
    var result = [];
    if ( siteConfig['menuItems'] ) {
      var items = norseUtils.forceArray( siteConfig['menuItems'] );
      items.forEach( function( itemID ) {
        var tempContent = contentLib.get({ key: itemID });
        result.push( {
          url: portal.pageUrl({ id: itemID }),
          title: tempContent.displayName,
          active: tempContent._path === content._path ? true : false
        } );
      });
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