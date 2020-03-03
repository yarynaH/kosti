var htmlExporter = require("/lib/openxp/html-exporter");
var thymeleaf = require("/lib/thymeleaf");
var norseUtils = require("norseUtils");
var textEncoding = require("/lib/text-encoding");
var jsonUtilBean = __.newBean("com.myurchenko.lib.pdf.JSONUtil");
var htmlExporterBean = __.newBean("com.myurchenko.lib.pdf.PdfHandler");

var qrLib = require("qrLib");
var templates = {
  regularTicket: "../pages/pdfs/regularTicket.html",
  legendaryTicket: "../pages/pdfs/legendaryTicket.html",
  regularTicket2020: "../pages/pdfs/regularTicket2020.html",
  legendaryTicket2020: "../pages/pdfs/legendaryTicket2020.html"
};

/*
  function generatePdf
  type: ticket
  template: template for ticket to be used
  qrData: data to be in qr code
  name: name
*/
exports.generatePdf = generatePdf;

function generatePdf(params) {
  if (params.type == "ticket") {
    return generateTicket(params);
  }
}

function generateTicket(params) {
  var qr = qrLib(4, "L");
  qr.addData(params.qrData);
  qr.make();
  var html = thymeleaf.render(resolve(templates[params.template]), {
    qrcode: qr.createTableTag(7, 0),
    id: params.qrData,
    friendlyId: params.friendlyId
  });

  var filesource = __.toNativeObject(
    toJson(htmlExporterBean.exportToPdf(html))
  );
  filesource.name = params.name;
  return getStream(filesource);
}

function toJson(fileSource) {
  return JSON.parse(jsonUtilBean.toJson(fileSource));
}

function getStream(fileSource, charsetDecode, encoding) {
  try {
    var stream = textEncoding.base64Decode(fileSource.content);

    if (encoding == undefined) {
      encoding = "UTF-8";
    }

    if (charsetDecode != undefined && charsetDecode === true) {
      stream = textEncoding.charsetDecode(content, encoding);
    }

    return stream;
  } catch (e) {
    log.error(e);
    return e;
  }
}
