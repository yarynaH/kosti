var htmlExporter = require("/lib/openxp/html-exporter");
var thymeleaf = require("/lib/thymeleaf");

var qrLib = require("qrLib");
var templates = {
  regularTicket: "../pages/pdfs/regularTicket.html",
  legendaryTicket: "../pages/pdfs/legendaryTicket.html"
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
  var fileSource = htmlExporter.exportToPdf(
    thymeleaf.render(resolve(templates[params.template]), {
      qrcode: qr.createTableTag(7, 0)
    })
  );
  fileSource.name = params.name;
  return htmlExporter.getStream(fileSource);
}
