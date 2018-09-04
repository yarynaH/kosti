var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var userLib = require('user');

exports.getPageComponents = function( req ) {
  var pageComponents = {};
  var up = req.params;
  var site = portal.getSite();
  var siteConfig = portal.getSiteConfig();
  var content = portal.getContent();

  pageComponents['pagehead'] = thymeleaf.render( resolve('../pages/components/head.html'), {
    siteConfig: siteConfig,
    content: content,
    site: site
  });

  pageComponents['footer'] = thymeleaf.render( resolve('../pages/components/footer.html'), {});

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