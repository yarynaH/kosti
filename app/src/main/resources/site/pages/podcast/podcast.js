var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var nodeLib = require("/lib/xp/node");
var htmlExporter = require("/lib/openxp/html-exporter");
var textEncodingLib = require("/lib/text-encoding");
var httpClientLib = require("/lib/http-client");
var util = require("/lib/util");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");
var moment = require(libLocation + "moment");

exports.get = function(req) {
  var content = portal.getContent();
  var podcasts = util.content.getChildren({ key: content._id });
  let episodes = [];
  for (let i = 0; i < podcasts.hits.length; i++) {
    if (podcasts.hits[i].type === app.name + ":podcast") {
      episodes.push(beautifyEpisode(podcasts.hits[i]));
    }
  }
  let result = OBJtoXML({ channel: createPodcast(episodes) });
  var view = resolve("podcast.html");
  var body = thymeleaf.render(view, { rssFeed: result });
  return {
    body: body,
    contentType: "text/xml"
  };

  function beautifyEpisode(episode) {
    let type = episode.attachments[episode.data.audioFile].mimeType;
    let size = episode.attachments[episode.data.audioFile].size;
    let date = moment(episode.publish.from).toString();
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
      explicit: episode.data.explicit,
      enclosure: { url: fileUrl, length: size, type: type },
      "itunes:episode": episode.data.episode,
      "itunes:season": episode.data.season,
      "itunes:explicit": episode.data.explicit,
      episode: episode.data.episode,
      season: episode.data.season,
      image: {
        link: portal.pageUrl({ id: episode._id, type: "absolute" }),
        title: episode.displayName,
        url: norseUtils.getImage(
          episode.data.image,
          "block(1400,1400)",
          null,
          "absolute"
        ).url
      }
    };
  }

  function createPodcast(episodes) {
    let year = new Date().getFullYear();
    let imageUrl = portal.assetUrl({
      path: norseUtils.getImage(
        content.data.image,
        "block(1400,1400)",
        null,
        "absolute"
      ).url,
      type: "absolute"
    });
    return {
      title: content.displayName,
      link: portal.pageUrl({ id: content._id, type: "absolute" }),
      language: content.language,
      copyright: "&#169; " + year + " Вечерние Кости",
      author: "Вечерние Кости",
      "googleplay:author": "Вечерние Кости",
      description: content.data.description,
      "itunes:author": "Вечерние Кости",
      "itunes:type": "serial",
      "itunes:owner": {
        "itunes:name": "Вечерние Кости",
        "itunes:email": "info@kostirpg.com"
      },
      owner: {
        name: "Вечерние Кости",
        email: "info@kostirpg.com"
      },
      image: {
        link: portal.pageUrl({ id: content._id, type: "absolute" }),
        title: content.displayName,
        url: imageUrl
      },
      "itunes:image": imageUrl,
      "itunes:explicit": content.data.explicit,
      "googleplay:explicit": content.data.explicit,
      "itunes:category": {
        text: "Leisure",
        "itunes:category": { text: "Hobbies" }
      },
      "googleplay:category": {
        text: "Games &amp; Hobbies"
      },
      item: episodes
    };
  }

  function OBJtoXML(obj) {
    var xml = "";
    for (var prop in obj) {
      if (prop === "itunes:category") {
        xml += getCategoryText(obj[prop]);
        continue;
      } else if (prop === "itunes:image") {
        xml += getImageTag(obj[prop]);
        continue;
      }
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

  function getCategoryText(category) {
    let result = '<itunes:category text="' + category.text + '">';
    if (category["itunes:category"]) {
      result += getCategoryText(category["itunes:category"]);
    }
    result += "</itunes:category>";
    return result;
  }

  function getImageTag(image) {
    return '<itunes:image href="' + image + '"></itunes:image>';
  }
};
