var portal = require('/lib/xp/portal'); // Import the portal functions
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the thymeleaf render function
var contentLib = require('/lib/xp/content');

// Handle GET requests
exports.get = function(req) {

  // Find the current component from request
  var component = portal.getComponent();

  // Get all data in order to get attachment size
  var content = portal.getContent();

  // Get all attachments
  var allAttachments = contentLib.getAttachments(content._path);

  // Find a config variable for the component
  var attachment = component.config || [];

  // Generate a URL for an attachment
  var attachmentURL = portal.attachmentUrl({
    name: attachment.ATTACHMENT
  });

  // Calculate attachment file type
  if( attachment.ATTACHMENT && attachment.ATTACHMENT != '' ){
    var fileType = attachment.ATTACHMENT.split('.');
    fileType = fileType[fileType.length - 1];
  }
  if( attachment.ATTACHMENT_TITLE && attachment.ATTACHMENT_TITLE != '' ){
    var title = attachment.ATTACHMENT_TITLE;
  }else{
    var title = attachment.ATTACHMENT;
  }

  if( allAttachments[attachment.ATTACHMENT] ){
    var size = allAttachments[attachment.ATTACHMENT].size;
  }else{
    var size = 0;
  }
  // Define the model
  var model = {
    component: component,
    content: content,
    title: title,
    attachmentURL: attachmentURL,
    fileType: fileType,
    attachmentSize: (Math.round(size * 1000 / 1024 / 1024) / 1000).toString() + " MB",
    attachment: attachment
  };

  // Resolve the view
  var view = resolve('attachment.html');

  // Render a thymeleaf template
  var body = thymeleaf.render(view, model);

  // Return the result
  return {
    body: body,
    contentType: 'text/html'
  };

};