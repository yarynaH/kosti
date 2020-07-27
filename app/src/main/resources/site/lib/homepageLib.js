const contentLib = require("/lib/xp/content");
const portal = require("/lib/xp/portal");
const httpClientLib = require("/lib/http-client");
const thymeleaf = require("/lib/thymeleaf");

const norseUtils = require("norseUtils");
const cacheLib = require("cacheLib");
const hashtagLib = require("hashtagLib");

const cache = cacheLib.api.createGlobalCache({
  name: "blog",
  size: 1000,
  expire: 60 * 60 * 24
});

exports.updateCache = updateCache;
exports.getVideoFromCache = getVideoFromCache;
exports.getScheduleFromCache = getScheduleFromCache;

function updateCache() {
  cache.api.clear();
  getVideoFromCache(app.config.gApiKey);
  getScheduleFromCache();
}

function getVideoFromCache(key) {
  var video = cache.api.getOnly("video");
  if (!video) {
    video = getVideo(key);
    cache.api.put("video", video);
  }
  return thymeleaf.render(resolve("../pages/homePage/video.html"), {
    id: video,
    url: "https://www.youtube.com/embed/" + video,
    alt: "Самое свежее видео на канале Вечерние Кости"
  });
}

function getVideo(key) {
  let response = JSON.parse(
    httpClientLib.request({
      url:
        "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCETKVT-Uj-gAqdSTd2YNaMg&maxResults=1&order=date&type=video&key=" +
        key,
      method: "GET",
      headers: {
        "X-Custom-Header": "header-value"
      },
      contentType: "application/json"
    }).body
  );
  if (
    response &&
    response.items &&
    response.items[0] &&
    response.items[0].id &&
    response.items[0].id.videoId
  ) {
    return response.items[0].id.videoId;
  } else {
    let site = portal.getSiteConfig();
    let url = site.video.split("/");
    url = url[url.length - 1];
    return url.split("?v=")[1];
  }
}

function getScheduleFromCache() {
  var schedule = cache.api.getOnly("schedule");
  schedule = false;
  if (!schedule) {
    schedule = getSchedule();
    cache.api.put("schedule", schedule);
  }
  return schedule;
}

function getSchedule() {
  let site = portal.getSiteConfig();
  let scheduleLocation = contentLib.get({ key: site.scheduleLocation });
  let now = new Date();
  now.setDate(now.getDate() - 1);
  now = now.toISOString();
  let result = contentLib.query({
    query: "data.date > dateTime('" + now + "')",
    start: 0,
    count: 3,
    sort: "data.date ASC",
    contentTypes: [app.name + ":schedule"]
  }).hits;
  for (let i = 0; i < result.length; i++) {
    result[i] = beautifySchedule(result[i]);
  }
  let resCopy = JSON.parse(JSON.stringify(result));
  while (result.length < 3 && result.length > 0) {
    for (let i = 0; i < resCopy.length; i++) {
      if (result.length >= 3) {
        break;
      }
      if (resCopy[i].data.repeat) {
        let temp = JSON.parse(JSON.stringify(resCopy[i]));
        let itemDate = new Date(temp.data.date);
        itemDate.setDate(itemDate.getDate() + 7 * parseInt(temp.data.repeat));
        temp.data.date = itemDate;
        result.push(beautifySchedule(temp));
      }
    }
  }
  return result;
}

function beautifySchedule(item) {
  item.image = norseUtils.getImage(item.data.image, "block(301, 109)");
  let itemDate = new Date(item.data.date);
  item.month = norseUtils.getMonthName(itemDate);
  item.day = itemDate.getDate().toFixed();
  item.hashtags = hashtagLib.getHashtags(item.data.hashtags);
  item.time = norseUtils.getTime(itemDate);
  item.url = portal.pageUrl({ path: item._path });
  if (item.repeat) {
    repeatedItems = true;
  }
  return item;
}
