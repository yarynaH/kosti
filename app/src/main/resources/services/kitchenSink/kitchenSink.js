var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var nodeLib = require("/lib/xp/node");
var htmlExporter = require("/lib/openxp/html-exporter");
var textEncodingLib = require("/lib/text-encoding");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");

exports.get = function(req) {
  var podcasts = contentLib.query({
    start: 0,
    limit: -1,
    query: "",
    contentTypes: [app.name + ":podcast"]
  });
  let episodes = [];
  for (let i = 0; i < podcasts.hits.length; i++) {
    episodes.push(beautifyEpisode(podcasts.hits[i]));
  }
  let result = OBJtoXML({ channel: createPodcast(episodes) });
  var view = resolve("kitchenSink.html");
  var body = thymeleaf.render(view, { rssFeed: result });
  return {
    body: body,
    contentType: "text/xml"
  };

  function beautifyEpisode(episode) {
    let type = episode.attachments[episode.data.audioFile].mimeType;
    let size = episode.attachments[episode.data.audioFile].size;
    let date = new Date(episode.publish.from);
    date = date.toUTCString();
    let fileUrl = portal.attachmentUrl({
      id: episode._id,
      type: "absolute",
      name: episode.data.audioFile
    });
    return {
      title: episode.displayName,
      description: episode.data.intro,
      guid: episode._id,
      link: portal.pageUrl({ id: episode._id, type: "absolute" }),
      pubDate: date,
      "itunes:explicit": episode.data.explicit,
      enclosure: { url: fileUrl, length: size, type: type },
      "itunes:episode": episode.data.episode,
      "itunes:season": episode.data.season
    };
  }

  function createPodcast(episodes) {
    let year = new Date().getFullYear();
    return {
      title: "ЭНОА",
      link: "https://www.kostirpg.com",
      language: "ru-ru",
      copyright: "&#169; " + year + " Вечерние Кости",
      "itunes:author": "Вечерние Кости",
      description: "Новая кампания по ЭНОА от Вечерние Кости.",
      "itunes:type": "serial",
      "itunes:owner": {
        "itunes:name": "Вечерние Кости",
        "itunes:email": "info@kostirpg.com"
      },
      "itunes:image": "",
      "itunes:explicit": "true",
      "itunes:category": "hobbies",
      item: episodes
    };
  }

  function OBJtoXML(obj) {
    var xml = "";
    for (var prop in obj) {
      xml += obj[prop] instanceof Array ? "" : "<" + prop + ">";
      if (obj[prop] instanceof Array) {
        for (var array in obj[prop]) {
          xml += "<" + prop + ">";
          xml += OBJtoXML(new Object(obj[prop][array]));
          xml += "</" + prop + ">";
        }
      } else if (typeof obj[prop] == "object") {
        xml += OBJtoXML(new Object(obj[prop]));
      } else {
        xml += obj[prop];
      }
      xml += obj[prop] instanceof Array ? "" : "</" + prop + ">";
    }
    var xml = xml.replace(/<\/?[0-9]{1,}>/g, "");
    return xml;
  }
};
