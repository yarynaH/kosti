var portal = require("/lib/xp/portal");
var httpClient = require("/lib/http-client");

exports.sendDiscordMessage = sendDiscordMessage;
exports.sendTelegramMessage = sendTelegramMessage;
exports.sendSlackMessage = sendSlackMessage;

function sendDiscordMessage(data) {
  var title = data.title ? "**" + data.title + "**\n" : "";
  var body = data.body ? data.body : "";
  var response = httpClient.request({
    url: data.webhookUrl,
    method: "POST",
    body: JSON.stringify({
      content: title + body
    }),
    contentType: "application/json"
  });
  return {
    body: "",
    contentType: "text/html"
  };
}

var BASE_TELEGRAM_URL = "https://api.telegram.org/";

function sendTelegramMessage(data) {
  var title = data.title ? "<b>" + data.title + "</b>\n" : "";
  var body = data.body ? data.body : "";
  var response = httpClient.request({
    url: BASE_TELEGRAM_URL + data.botId + "/sendMessage",
    method: "GET",
    params: {
      text: encodeURI(title + body),
      parse_mode: "HTML",
      chat_id: data.chatId,
      disable_web_page_preview: true
    },
    contentType: "application/json"
  });
  return "test";
}

function sendSlackMessage(data) {
  var title = data.title ? "*" + data.title + "*\n\n" : "";
  var body = data.body ? data.body : "";
  var response = httpClient.request({
    url: data.channel,
    method: "POST",
    body: JSON.stringify({
      text: title + body,
      mrkdwn: true
    }),
    contentType: "application/json"
  });
  return {
    body: "",
    contentType: "text/html"
  };
}
