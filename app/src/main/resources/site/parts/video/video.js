var portal = require('/lib/xp/portal'); // Import the portal functions
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the thymeleaf render function
var contentLib = require('/lib/xp/content');

// Handle GET requests
exports.get = function(req) {

  // Find the current component from request
  var component = portal.getComponent();

  // Find a config variable for the component
  var video = component.config || [],
      url = "";
  if ( video && video.VIDEO_URL ) {
    url = video.VIDEO_URL.split('/');
    url = url[url.length-1];

    if( video.VIDEO_SOURCE == 'vimeo' ){
      url = 'https://player.vimeo.com/video/' + url;
    }else if( video.VIDEO_SOURCE == 'youtube' ){
      if( url.split('?v=')[1] ){
        url = 'https://www.youtube.com/embed/' + url.split('?v=')[1];
      }else{
        url = 'https://www.youtube.com/embed/' + url;
      }
    }
  }

  // Define the model
  var model = {
    component: component,
    url: url
  };

  // Resolve the view
  var view = resolve('video.html');

  // Render a thymeleaf template
  var body = thymeleaf.render(view, model);

  // Return the result
  return {
    body: body,
    contentType: 'text/html'
  };

};