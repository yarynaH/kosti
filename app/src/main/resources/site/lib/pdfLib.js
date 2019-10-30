var htmlExporter = require("/lib/openxp/html-exporter");
var thymeleaf = require("/lib/thymeleaf");

var qrLib = require("qrLib");
var mailsTemplates = {
  regularTicket: "../pages/pdfs/regularTicket.html",
  legendaryTicket: "../pages/pdfs/legendaryTicket.html"
};

exports.generatePdf = generatePdf;

function generatePdf(params) {
  if (params.type == "ticket") {
    return generateTicket(params);
  }
}

function generateTicket(params) {
  var qr = qrLib(4, "L");
  qr.addData(params.id);
  qr.make();
  var fileSource = htmlExporter.exportToPdf(
    thymeleaf.render(resolve(mailsTemplates[params.ticketType]), {
      qrcode: qr.createTableTag(7, 0)
    })
  );
  return htmlExporter.getStream(fileSource);
}
