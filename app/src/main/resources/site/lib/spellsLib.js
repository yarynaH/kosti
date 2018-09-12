var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var i18nLib = require('/lib/xp/i18n');

exports.generateClasses = function( classes ){
  var result = [];
  for (var k in classes){
    if (classes.hasOwnProperty(k)) {
      if( classes[k] ){
        result.push(k);
      }
    }
  }
  return result;
}

exports.generateComponents = function( misc ){
  var result = [];
  var requiredComponents = ['verbal', 'somatic', 'material'];
  for (var k in misc){
    if (misc.hasOwnProperty(k)) {
      if( misc[k] && requiredComponents.indexOf(k) != -1 ){
        result.push(k);
      }
    }
  }
  return result;
}

exports.generateCastTime = function( castTime, otherCastTime, castTimeDescr, lang ){
  var castTimesArr = ['action', 'bonus', 'reaction'];
  var result = '';
  if( castTimesArr.indexOf(castTime) != -1 ){
    result += i18nLib.localize({
      key: 'global.game.' + castTime,
      locale: lang
    });
  } else {
    result += otherCastTime + ' ' + i18nLib.localize({ key: 'global.time.' + castTime, locale: lang });
  }

  if( castTimeDescr ){
    result += castTimeDescr;
  }

  return result;
}

exports.generateDistance = function( range, rangeDistance, rangeDistanceUnits, rangeDescr, lang ){
  var translatedRangeArr = ['self', 'touch', 'selfArea'];
  var result = '';
  if( translatedRangeArr.indexOf(range) != -1 ){
    result += i18nLib.localize({
      key: 'spells.range.' + range,
      locale: lang
    });
  } else {
    result += rangeDistance + ' ' + i18nLib.localize({ key: 'spells.range.' + rangeDistanceUnits, locale: lang });
  }

  if( rangeDescr ){
    result += rangeDescr;
  }

  return result;
}