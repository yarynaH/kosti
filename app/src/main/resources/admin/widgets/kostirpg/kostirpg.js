var thymeleaf = require("/lib/thymeleaf");
var portalLib = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");

exports.get = handleGet;

function handleGet(req) {
  function renderView() {
    var view = resolve("kostirpg.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel() {
    var contentId = req.params.contentId;
    if (!contentId && portalLib.getContent()) {
      contentId = portalLib.getContent()._id;
    }
    var showGenerateButton = false;

    var content = contentLib.get({ key: contentId });

    if (
      content &&
      content.data &&
      content.data.codeType &&
      content.data.codeType._selected === "unique" &&
      content.type === app.name + ":promo"
    ) {
      showGenerateButton = true;
    }

    return {
      showGenerateButton: showGenerateButton,
      id: content._id,
      widgetId: app.name
    };
  }

  function forceArray(data) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    return data;
  }

  return renderView();
}
