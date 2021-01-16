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

function getLocalPriceForProduct(product, getLocalPrice) {
  if (!product) return null;
  if (product.data.price)
    product.data.price = convertCurrency(product.data.price, getLocalPrice);
  if (product.data.finalPrice)
    product.data.finalPrice = convertCurrency(
      product.data.finalPrice,
      getLocalPrice
    );
  return product;
}

function convertCurrency(price, getLocalPrice) {
  if (!price) return null;
  if (!getLocalPrice) {
    return { amount: price, currency: "UAH" };
  }

  let ip = "178.140.1.234";

  let locationInfo = cache.api.getOnly(ip);
  if (!locationInfo) {
    locationInfo = ipLib.getIpInfo(ip);
    cache.api.put(ip, locationInfo);
  }
  if (!locationInfo) return { amount: price, currency: "UAH" };

  let currencyRate = cache.api.getOnly(locationInfo.currency);
  if (!currencyRate) {
    currencyRate = getCurrencyRatio(locationInfo.currency);
    cache.api.put(locationInfo.currency, currencyRate);
  }
  if (!currencyRate) return { amount: price, currency: "UAH" };
  return {
    amount:
      Math.round(parseInt(price) * parseFloat(currencyRate.rate) * 100) / 100,
    currency: locationInfo.currency
  };
}
