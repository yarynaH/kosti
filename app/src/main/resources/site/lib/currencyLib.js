const norseUtils = require("norseUtils");
const ipLib = require("ipLib");
const httpClientLib = require("/lib/http-client");
const cacheLib = require("cacheLib");

const KEY = "87a357d2288e59f527be";

exports.getCurrencyRatio = getCurrencyRatio;
exports.getLocalPriceForProduct = getLocalPriceForProduct;
exports.convertCurrency = convertCurrency;

const cache = cacheLib.api.createGlobalCache({
  name: "store",
  size: 1000,
  expire: 60 * 60
});

function getCurrencyRatio(currency) {
  if (!currency) return null;
  let response = httpClientLib.request({
    url:
      "https://free.currconv.com/api/v7/convert?apiKey=" +
      KEY +
      "&q=UAH_" +
      currency +
      "&compact=ultra",
    method: "GET",
    contentType: "application/json"
  });
  if (response.status === 200) {
    let body = JSON.parse(response.body);
    if (body && body["UAH_" + currency]) {
      return { rate: body["UAH_" + currency] };
    }
  }
  return null;
}

function getLocalPriceForProduct(product, ip) {
  if (!product) return null;
  if (product.data.price)
    product.data.price = convertCurrency({
      price: product.data.price,
      ip: ip
    });
  if (product.data.finalPrice)
    product.data.finalPrice = convertCurrency({
      price: product.data.finalPrice,
      ip: ip
    });
  return product;
}

function convertCurrency(params) {
  if (!params.price) return null;
  if (!params.ip) {
    return { amount: params.price, currency: "UAH" };
  }

  let locationInfo = cache.api.getOnly(params.ip);
  if (!locationInfo) {
    locationInfo = ipLib.getIpInfo(params.ip);
    cache.api.put(params.ip, locationInfo);
  }
  if (!locationInfo || locationInfo.currency === "BYR")
    return { amount: params.price, currency: "UAH" };

  let currencyRate = cache.api.getOnly(locationInfo.currency);
  if (!currencyRate) {
    currencyRate = getCurrencyRatio(locationInfo.currency);
    cache.api.put(locationInfo.currency, currencyRate);
  }
  if (!currencyRate) return { amount: params.price, currency: "UAH" };
  return {
    amount:
      Math.round(parseInt(params.price) * parseFloat(currencyRate.rate) * 100) /
      100,
    currency: locationInfo.currency
  };
}
