const norseUtils = require("norseUtils");
const httpClientLib = require("/lib/http-client");

exports.getIpInfo = getIpInfo;

function getIpInfo(ip) {
  if (!ip) return null;
  let response = httpClientLib.request({
    url: "http://ip-api.com/json/" + ip + "?fields=countryCode,currency",
    method: "GET",
    contentType: "application/json"
  });
  if (response.status === 200) {
    let body = JSON.parse(response.body);
    if (body && body.countryCode) {
      return body;
    }
  }
  return null;
}
