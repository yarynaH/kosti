var portal = require('/lib/xp/portal'); // Import the portal functions
var thymeleaf = require('/lib/thymeleaf'); // Import the thymeleaf render function
var contentLib = require('/lib/xp/content');

exports.get = function(req) {
  var component = portal.getComponent();

  var model = {
    component: component,
    text: component.config.text
  };

  var view = resolve('quote.html');

  var body = thymeleaf.render(view, model);
  return {
    body: body,
    contentType: 'text/html'
  };

};