var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var userLib = require('user');

exports.getPageComponents = function( req, headerAttributes ) {
  var pageComponents = {};
  var up = req.params;
  var site = portal.getSite();
  var siteConfig = portal.getSiteConfig();
  var content = portal.getContent();

  var menu = getMenu(norseUtils.forceArray(siteConfig.menuItems));

  pageComponents['header'] = thymeleaf.render( resolve('../pages/components/header.html'), {
    content: content,
    userTopMenu: checkUser(),
    site: site,
    menu: menu,
    headerAttributes: headerAttributes
  } );


  pageComponents['pagehead'] = thymeleaf.render( resolve('../pages/components/pagehead.html'), {
    content: content
  });

  pageComponents['footer'] = thymeleaf.render( resolve('../pages/components/footer.html'), {
    content: content
  });

  function getMenu( menuItems ){
    var menu = [];
    for ( var i = 0; i < menuItems.length; i++ ) {
      menu.push({
        url: portal.pageUrl({ id: menuItems[i]}),
        title: contentLib.get({ key: menuItems[i] }).displayName
      });
    }
    return menu;
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