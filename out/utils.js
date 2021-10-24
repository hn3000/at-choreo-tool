"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.niceDate = exports.niceTime = exports.justseconds = exports.fullminutes = exports.fullhours = exports.avg = exports.sum = void 0;
function sum(values) {
    return values.reduce(function (r, v) { return r + v; }, 0);
}
exports.sum = sum;
function avg(values) {
    return sum(values) / values.length;
}
exports.avg = avg;
function fullhours(timeSeconds) {
    return Math.floor(timeSeconds / 3600);
}
exports.fullhours = fullhours;
function fullminutes(timeSeconds) {
    return Math.floor((timeSeconds % 3600) / 60);
}
exports.fullminutes = fullminutes;
function justseconds(timeSeconds) {
    return Math.floor(timeSeconds % 60);
}
exports.justseconds = justseconds;
function niceTime(timeSeconds) {
    if (isNaN(timeSeconds)) {
        return '-';
    }
    if (timeSeconds > 3600) {
        return fullhours(timeSeconds) + ":" + fullminutes(timeSeconds) + ":" + justseconds(timeSeconds);
    }
    else {
        return fullminutes(timeSeconds) + ":" + justseconds(timeSeconds);
    }
}
exports.niceTime = niceTime;
function niceDate(timestampOrDate) {
    var date = new Date(timestampOrDate);
    return date.toISOString().replace('T', ' ').substr(0, 19);
}
exports.niceDate = niceDate;
