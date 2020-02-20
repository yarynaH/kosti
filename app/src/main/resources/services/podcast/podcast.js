var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");
var moment = require(libLocation + "moment");

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
  let view = resolve("podcast.html");
  let body = thymeleaf.render(view, { rssFeed: result });
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
      "itunes:title": episode.displayName,
      description: episode.data.intro,
      guid: episode._id,
      link: portal.pageUrl({ id: episode._id, type: "absolute" }),
      pubDate: date,
      explicit: episode.data.explicit,
      enclosure: { url: fileUrl, length: size, type: type },
      "itunes:episode": episode.data.episode,
      "itunes:season": episode.data.season,
      "itunes:explicit": episode.data.explicit,
      "itunes:duration": episode.data.duration,
      "itunes:episodeType": "full",
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
      },
      "itunes:image": ""
    };
  }

  function createPodcast(episodes) {
    let year = new Date().getFullYear();
    let imageUrl = portal.assetUrl({
      path: "images/vk-podcast.jpg",
      type: "absolute"
    });
    return {
      title: "Эноа | Настольная Ролевая Игра",
      link: portal.serviceUrl({ service: "podcast", type: "absolute" }),
      language: "ru",
      copyright: "&#169; " + year + " Вечерние Кости",
      author: "Вечерние Кости",
      "googleplay:author": "Вечерние Кости",
      description: i18nLib.localize({
        key: "podcast.kosti.descr",
        locale: "ru"
      }),
      "itunes:author": "Вечерние Кости",
      "itunes:type": "serial",
      "googleplay:email": "info@kostirpg.com",
      "itunes:owner": {
        "itunes:name": "Вечерние Кости",
        "itunes:email": "info@kostirpg.com"
      },
      owner: {
        name: "Вечерние Кости",
        email: "info@kostirpg.com"
      },
      image: {
        link: "https://www.kostirpg.com",
        title: "Эноа | Настольная Ролевая Игра",
        url: imageUrl
      },
      "itunes:image": imageUrl,
      "itunes:explicit": "true",
      "googleplay:explicit": "yes",
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
      if (prop === "itunes:category" || prop === "googleplay:category") {
        xml += getCategoryText(obj[prop]);
        continue;
      } else if (prop === "itunes:image") {
        xml += getImageTag(obj[prop]);
        continue;
      } else if (prop === "enclosure") {
        xml += getEnclosure(obj[prop]);
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

  function getEnclosure(enc) {
    return (
      "<enclosure length='" +
      enc.length +
      "' type='" +
      enc.type +
      "' url='" +
      enc.url +
      "'></enclosure>"
    );
  }
};
