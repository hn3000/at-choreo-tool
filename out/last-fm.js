"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastfm_getTopTags = void 0;
var MISSING_KEY = 'missing last.fm API key';
var LASTFM_API_KEY = process.env['LASTFM_API_KEY'] || MISSING_KEY;
var promise_timeout_1 = require("@hn3000/promise-timeout");
var fetch = require("isomorphic-fetch");
var fs = require("fs");
var _nextTimeout = Promise.resolve(undefined);
var _currentDelay = 1100; // slightly over 1s, to be on the safe side
function nextTimeout() {
    var tmp = _nextTimeout;
    _nextTimeout = tmp.then(function (_) { return (0, promise_timeout_1.resolveAfter)(_currentDelay); });
    return tmp;
}
function increaseTimeout() {
    _currentDelay *= 2; // if we observe failures, maybe a second process is requestion from this IP?
}
function unpackResult(resultP) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resultP];
                case 1:
                    result = _a.sent();
                    if (result.status === 200) {
                        return [2 /*return*/, result.json()];
                    }
                    else if (result.status === 503) {
                        increaseTimeout();
                        if (_currentDelay < 60 * 1000) {
                            throw "retry";
                        }
                    }
                    throw new Error(result.statusText + ' ' + result.status);
            }
        });
    });
}
function fetchLastFM(url) {
    return __awaiter(this, void 0, void 0, function () {
        var sep, urlComplete, retry, result, xx_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (LASTFM_API_KEY == MISSING_KEY) {
                        console.warn("not fetching " + url + ", no api key");
                        throw "missing api key";
                    }
                    sep = url.includes('?') ? '&' : '?';
                    urlComplete = "" + url + sep + "api_key=" + LASTFM_API_KEY + "&format=json";
                    retry = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, nextTimeout()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, unpackResult(fetch(urlComplete))];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    xx_1 = _a.sent();
                    if (xx_1 === 'retry') {
                        retry = true;
                    }
                    throw xx_1;
                case 5:
                    if (retry) return [3 /*break*/, 1];
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
var topTagCache = new Map();
var LASTFM_CACHE_FILE = './.lastFmCache.json';
if (fs.existsSync(LASTFM_CACHE_FILE)) {
    var cacheFileContents = fs.readFileSync(LASTFM_CACHE_FILE, { encoding: 'utf-8' });
    if (cacheFileContents.trim().length) {
        try {
            var cacheContents = JSON.parse(cacheFileContents);
            if (cacheContents.topTagsBySong) {
                Object.entries(cacheContents.topTagsBySong).forEach(function (x) {
                    var _a = __read(x, 2), songKey = _a[0], entry = _a[1];
                    topTagCache.set(songKey, entry.info ? Promise.resolve(entry.info) : Promise.reject(entry.error));
                });
            }
        }
        catch (ex) {
            console.debug("corrupt cache file? " + ex);
        }
    }
    else {
        console.debug("note: empty cache file.");
    }
}
function cacheEntry(p) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, p.then(function (info) { return ({ info: info }); }, function (error) { return ({ error: error }); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
process.on('beforeExit', function () { return __awaiter(void 0, void 0, void 0, function () {
    var topTags, cacheContents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(__spreadArray([], __read(topTagCache.entries()), false).map(function (x) { return __awaiter(void 0, void 0, void 0, function () {
                    var ce;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, cacheEntry(x[1])];
                            case 1:
                                ce = _a.sent();
                                return [2 /*return*/, ([x[0], ce])];
                        }
                    });
                }); }))];
            case 1:
                topTags = _a.sent();
                cacheContents = {};
                cacheContents.topTagsBySong = {};
                topTags.forEach(function (_a) {
                    var _b = __read(_a, 2), key = _b[0], entry = _b[1];
                    cacheContents.topTagsBySong[key] = entry;
                });
                fs.writeFileSync(LASTFM_CACHE_FILE, JSON.stringify(cacheContents, null, 2), { encoding: 'utf-8' });
                return [2 /*return*/];
        }
    });
}); });
function lastfm_getTopTags(song, artist) {
    return __awaiter(this, void 0, void 0, function () {
        var songKey, result;
        return __generator(this, function (_a) {
            songKey = song + "--:--" + artist;
            result = topTagCache.get(songKey);
            if (null == result) {
                result = fetchLastFM("http://ws.audioscrobbler.com/2.0/?method=track.getTopTags&track=" + encodeURIComponent(song) + "&artist=" + encodeURIComponent(artist));
                topTagCache.set(songKey, result);
            }
            return [2 /*return*/, result];
        });
    });
}
exports.lastfm_getTopTags = lastfm_getTopTags;
