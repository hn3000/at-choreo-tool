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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var index_1 = require("./index");
var json_ref_1 = require("@hn3000/json-ref");
var fs = require("fs");
var utils_1 = require("./utils");
var last_fm_1 = require("./last-fm");
function main(args) {
    var _this = this;
    var _a;
    console.warn(args);
    var cmd = (_a = args[2]) !== null && _a !== void 0 ? _a : 'dumpinfo';
    var restArgs = args.slice(3);
    var options = restArgs.filter(function (x) { return x.startsWith('--'); });
    var paths = restArgs.filter(function (x) { return !x.startsWith('--'); }) || ['.'];
    var sortOrder = orderByDate('-');
    var sortField = 'date';
    var limit = 10;
    var lastFmTags = false;
    var generate = [];
    options.forEach(function (o) {
        var _a;
        var _b = __read(o.split('=')), option = _b[0], rest = _b.slice(1);
        var args = (_a = rest === null || rest === void 0 ? void 0 : rest.join('=')) !== null && _a !== void 0 ? _a : '';
        switch (option) {
            case '--count':
                limit = Number(args);
                break;
            case '--last-fm-tags':
                lastFmTags = true;
                break;
            case '--filter':
                var filterMatch = /^(.*)(=(.*))?$/.exec(args);
                break;
            case '--generate':
                generate.push(args);
                break;
            case '--sort':
                var sortMatch = /^(-|\+)?(.*)$/.exec(args);
                var dir = sortMatch[1];
                sortField = sortMatch[2];
                switch (sortMatch[2]) {
                    case 'gemspeed':
                    case 'gems':
                    case 'ribbons':
                    case 'dirgems':
                    case 'barriers':
                    case 'drums':
                        sortOrder = orderByChoreo(sortMatch[2], dir || '-');
                        break;
                    case 'name':
                        sortOrder = orderByName(dir || '+');
                        break;
                    case 'songFile':
                        sortOrder = orderByName(dir || '+', 'songFilename');
                        break;
                    case 'songAudio':
                        sortOrder = orderByName(dir || '+', 'songAudioFilename');
                        break;
                    case 'length':
                        sortOrder = orderByLength(dir || '-');
                        break;
                    default:
                    case 'date':
                        sortOrder = orderByDate(dir || '-');
                        break;
                }
                break;
            default:
                console.warn("Unsupported option " + o + " ignored.");
        }
    });
    var _b = __read((0, index_1.choreoCollector)([
        { key: 'author', field: json_ref_1.JsonPointer.get('/metadata/authorID/displayName') },
        { key: 'artist', field: json_ref_1.JsonPointer.get('/metadata/artist') },
        { key: 'all', field: { getValue: function () { return '*'; } } },
    ]), 2), collection = _b[0], collectorCB = _b[1];
    var doneCB = function () { return __awaiter(_this, void 0, void 0, function () {
        var promises_1, all, all_1, choreos_1, map_1, field_1, all, choreos, topChoreos, lengths_1, keys_2, keys_1, keys_1_1, k, authorEntries, totalTime_1, totalChoreos_1, totalSongs_1, clonable_1, shouldGenerate, optionalName, name_1, allChoreos_1, name_2, name_3, name_4, count_1, rems, bestStep, needsParts, i, part, partstr, ex_1;
        var e_1, _a;
        var _this = this;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 3, , 4]);
                    promises_1 = [];
                    if (lastFmTags) {
                        all = collection['all']['*'];
                        all.forEach(function (x) { return __awaiter(_this, void 0, void 0, function () {
                            var p;
                            return __generator(this, function (_a) {
                                p = (0, last_fm_1.lastfm_getTopTags)(x.songName, x.songArtist).then(function (r) {
                                    var _a;
                                    var tags = (_a = r === null || r === void 0 ? void 0 : r.toptags) === null || _a === void 0 ? void 0 : _a.tag;
                                    x.songTags = tags === null || tags === void 0 ? void 0 : tags.map(function (x) { return x.name; });
                                }).catch(function (err) { return ([]); });
                                promises_1.push(p);
                                return [2 /*return*/];
                            });
                        }); });
                    }
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    _g.sent();
                    //console.debug(`gonna wait for ${promises.length} promises`);
                    return [4 /*yield*/, Promise.all(promises_1)];
                case 2:
                    //console.debug(`gonna wait for ${promises.length} promises`);
                    _g.sent();
                    switch (cmd) {
                        case 'dumpinfo':
                            console.log(JSON.stringify(collection, null, 2));
                            break;
                        case 'tallest':
                            break;
                        case 'widest':
                            break;
                        case 'csv-songs': {
                            all_1 = collection['all']['*'];
                            choreos_1 = all_1.filter(function (x) { return x.choreoEventCount > 0; });
                            choreos_1.sort(sortOrder);
                            map_1 = new Map();
                            choreos_1.forEach(function (k) {
                                var song = "\"" + k.songName + "\",\"" + k.songArtist + "\"";
                                if (!map_1.has(song)) {
                                    map_1.set(song, []);
                                }
                                map_1.get(song).push(k);
                            });
                            console.log('"n","song","artist","mapper","levels","bpm","length","mapped","tags"');
                            __spreadArray([], __read(map_1.entries()), false).forEach(function (e, i) {
                                var _a;
                                var choreos = e[1];
                                var mapperSet = choreos.reduce(function (s, x) { return (s.add(x.choreoAuthor), s); }, new Set());
                                var mappers = __spreadArray([], __read(mapperSet), false).join(' / ');
                                var tags = ((_a = choreos[0].songTags) !== null && _a !== void 0 ? _a : []).join(';');
                                var levels = choreos.map(function (x) { return x.choreoName; }).join(', ');
                                var _b = choreos[0], songBPM = _b.songBPM, songLength = _b.songLength, songModificationTimestamp = _b.songModificationTimestamp;
                                console.log("\"" + (i + 1) + "\"," + e[0] + ",\"" + mappers + "\",\"" + levels + "\",\"" + songBPM + "\",\"" + (0, utils_1.niceTime)(songLength) + "\",\"" + (0, utils_1.niceDate)(songModificationTimestamp) + "\",\"" + tags + "\"");
                            });
                            break;
                        }
                        case 'top-songs':
                            field_1 = choreoField(sortField);
                            all = collection['all']['*'];
                            choreos = all.filter(function (x) { return x.choreoEventCount > 0; });
                            choreos.sort(sortOrder);
                            topChoreos = choreos.slice(0, limit);
                            lengths_1 = {
                                songName: 0,
                                songArtist: 0,
                                choreoName: 0,
                                choreoAuthor: 0,
                            };
                            keys_2 = Object.keys(lengths_1);
                            topChoreos.forEach(function (choreo, i) {
                                var e_2, _a;
                                try {
                                    for (var keys_3 = __values(keys_2), keys_3_1 = keys_3.next(); !keys_3_1.done; keys_3_1 = keys_3.next()) {
                                        var k = keys_3_1.value;
                                        lengths_1[k] = Math.max(lengths_1[k], choreo[k].length);
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (keys_3_1 && !keys_3_1.done && (_a = keys_3.return)) _a.call(keys_3);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                            });
                            try {
                                for (keys_1 = __values(keys_2), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                                    k = keys_1_1.value;
                                    lengths_1[k] += 1;
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            topChoreos.forEach(function (choreo, i) {
                                var songName = choreo.songName, songArtist = choreo.songArtist, songBPM = choreo.songBPM, songLength = choreo.songLength, songModificationTimestamp = choreo.songModificationTimestamp, choreoAuthor = choreo.choreoAuthor, choreoName = choreo.choreoName;
                                console.log(rp(songName, lengths_1.songName)
                                    + rp(songArtist, lengths_1.songArtist)
                                    + lp("(" + fmt0(songBPM) + ")", 5) + ' '
                                    + rp(choreoName, lengths_1.choreoName)
                                    + rp(choreoAuthor, lengths_1.choreoAuthor)
                                    + rp("" + (0, utils_1.niceTime)(songLength), 7)
                                    + ((0, utils_1.niceDate)(songModificationTimestamp) + " ")
                                    + ("[" + sortField + ": " + field_1(choreo) + "]"));
                            });
                            break;
                        case 'stats':
                        case 'stats-extended':
                        case 'statsExtended': {
                            authorEntries = Object.entries(collection['author']);
                            authorEntries.forEach(function (ae) {
                                var list = ae[1];
                                ae[1] = list.filter(function (x) { return x.choreoEventCount > 0; });
                                ae[1].sort(sortOrder);
                            });
                            authorEntries.sort(orderAuthorEntriesByLength('+'));
                            totalTime_1 = 0;
                            totalChoreos_1 = 0;
                            totalSongs_1 = new Set();
                            authorEntries.forEach(function (ae) {
                                var thisCount = ae[1].length;
                                var thisSongs = new Set();
                                totalChoreos_1 += thisCount;
                                var thisTime = (0, utils_1.sum)(ae[1].map(function (x) { return x.songLength; }));
                                totalTime_1 += thisTime;
                                ae[1].forEach(function (k) {
                                    thisSongs.add(k.songArtist + " - " + k.songName);
                                });
                                console.log(ae[0] + "\t" + thisSongs.size + "\t" + thisCount + "\t" + (0, utils_1.niceTime)(thisTime));
                                thisSongs.forEach(function (s) { return totalSongs_1.add(s); });
                                if (cmd.endsWith('xtended')) {
                                    ae[1].forEach(function (k) {
                                        console.log("\t" + k.choreoAuthor + " - " + k.songArtist + " - " + k.songName + " - " + k.choreoName);
                                        console.log("\t\tx: " + fmt2(k.choreoMeta.xMin) + " .. " + fmt2(k.choreoMeta.xMax) + ", y: " + fmt2(k.choreoMeta.yMin) + " .. " + fmt2(k.choreoMeta.yMax));
                                        console.log("\t\tbarriers: " + k.choreoMeta.numBarriers + ", gems: " + k.choreoMeta.numGemsLeft + "/" + k.choreoMeta.numGemsRight);
                                        console.log("\t\tdirgems: " + k.choreoMeta.numDirGemsLeft + "/" + k.choreoMeta.numDirGemsRight + ", drums: " + k.choreoMeta.numDrumsLeft + "/" + k.choreoMeta.numDrumsRight);
                                        console.log("\t\tgemspeed: " + k.choreoGemSpeed + ", bpm: " + k.songBPM);
                                    });
                                }
                            });
                            console.log("total\t" + totalSongs_1.size + " songs\t" + totalChoreos_1 + " choreos\t" + (0, utils_1.niceTime)(totalTime_1));
                            break;
                        }
                        case 'create-playlists':
                        case 'clonable-playlists':
                        case 'createPlaylists':
                        case 'clonablePlaylists':
                            clonable_1 = cmd.startsWith('clonable');
                            shouldGenerate = function (which) {
                                if (generate.includes(which))
                                    return true;
                                var whichPlus = which + '=';
                                var result = generate.some(function (x) { return x.startsWith(whichPlus); });
                                if (!result)
                                    console.warn("skipping " + which + ", not in [" + generate.join(',') + "]");
                                return result;
                            };
                            optionalName = function (which) {
                                var whichPlus = which + '=';
                                var matching = generate.filter(function (x) { return x.startsWith(whichPlus); });
                                var names = matching.map(function (x) { return x.substring(whichPlus.length); });
                                return names[0];
                            };
                            console.warn(cmd + " will generate [" + generate.join(',') + "]");
                            if (shouldGenerate('author')) {
                                name_1 = (_b = optionalName('author')) !== null && _b !== void 0 ? _b : 'by';
                                Object.keys(collection['author']).forEach(function (author) {
                                    var choreosAll = collection['author'][author];
                                    var choreos = choreosAll.filter(function (x) { return x.choreoEventCount > 0; });
                                    choreos.sort(orderByDate('-'));
                                    if (choreos.length > 1) {
                                        makePlaylist(name_1 + " " + author, name_1 + "-" + author + " (" + choreos.length + ")", choreos, clonable_1);
                                        if (choreos.length > 10) {
                                            var count_2 = choreos.length;
                                            var rems = [8, 9, 10, 11].map(function (x) { return ({ x: x, r: count_2 % x }); });
                                            var bestStep = rems.reduce(function (a, b) { return a.r > b.r ? a : b; }).x;
                                            for (var i = 0; i < count_2; i += bestStep) {
                                                var part = Math.floor(i / bestStep) + 1;
                                                var partstr = part < 10 ? '0' + part : part;
                                                makePlaylist("by " + author + " Pt " + partstr, "all-by-" + author + "-" + partstr, choreos.slice(i, i + bestStep), clonable_1);
                                            }
                                        }
                                    }
                                    else {
                                        makePlaylist("by " + author, "by-" + author, choreos, clonable_1);
                                    }
                                });
                            }
                            allChoreos_1 = [];
                            if (generate.length === 0 || shouldGenerate('newest') || shouldGenerate('newest-more') || shouldGenerate('all')) {
                                Object.keys(collection['author']).forEach(function (author) {
                                    var choreosAll = collection['author'][author];
                                    var choreos = choreosAll.filter(function (x) { return x.choreoEventCount > 0; });
                                    choreos.sort(orderByDate('-'));
                                    allChoreos_1.push.apply(allChoreos_1, __spreadArray([], __read(choreos), false));
                                });
                            }
                            allChoreos_1.sort(function (a, b) { return b.songModificationTimestamp - a.songModificationTimestamp; });
                            if (shouldGenerate('newest') || shouldGenerate('newest-more')) {
                                name_2 = (_d = (_c = optionalName('newest')) !== null && _c !== void 0 ? _c : optionalName('newest-more')) !== null && _d !== void 0 ? _d : 'fresh';
                                makePlaylist(name_2 + " 05", '${name}-05', allChoreos_1.slice(0, 5), clonable_1);
                                makePlaylist(name_2 + " 10", '${name}-10', allChoreos_1.slice(0, 10), clonable_1);
                                makePlaylist(name_2 + " 20", '${name}-20', allChoreos_1.slice(0, 20), clonable_1);
                            }
                            if (generate.includes('newest-more')) {
                                name_3 = (_e = optionalName('newest-more')) !== null && _e !== void 0 ? _e : 'fresh';
                                makePlaylist(name_3 + " 30", name_3 + "-30", allChoreos_1.slice(0, 30), clonable_1);
                                makePlaylist(name_3 + " 40", name_3 + "-40", allChoreos_1.slice(0, 40), clonable_1);
                                makePlaylist(name_3 + " 50", name_3 + "-50", allChoreos_1.slice(0, 50), clonable_1);
                            }
                            if (shouldGenerate('all') || generate.length === 0) {
                                name_4 = (_f = optionalName('all')) !== null && _f !== void 0 ? _f : 'all';
                                count_1 = allChoreos_1.length;
                                rems = [8, 9, 10, 11].map(function (x) { return ({ x: x, r: count_1 % x }); });
                                bestStep = rems.reduce(function (a, b) { return a.r > b.r ? a : b; }).x;
                                needsParts = count_1 > bestStep;
                                if (needsParts) {
                                    console.warn("generate playlists with all " + count_1 + " choreos in batches of " + bestStep + " as " + name_4);
                                }
                                else {
                                    console.warn("generate playlist with " + count_1 + " choreos as " + name_4);
                                }
                                for (i = 0; i < count_1; i += bestStep) {
                                    part = Math.floor(i / bestStep) + 1;
                                    partstr = needsParts ? (part < 10 ? '0' + part : part) : 'all';
                                    makePlaylist(name_4 + " #" + partstr, name_4 + "-" + partstr, allChoreos_1.slice(i, i + bestStep), clonable_1);
                                }
                            }
                            break;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_1 = _g.sent();
                    console.warn('caught exception', ex_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, index_1.findSongs)(paths, collectorCB, doneCB);
}
exports.main = main;
function makePlaylist(name, filename, choreos, clonable) {
    var playlist = {
        title: name,
        items: [],
        totalDuration: 0,
        choreoType: 1,
        isBuiltIn: !!clonable,
        localTitle: {
            m_FileID: 0,
            m_PathID: 0
        },
    };
    choreos.forEach(function (choreo) {
        var length = choreo.songLength;
        playlist.items.push({
            song: {
                m_FileID: 0,
                m_PathID: 0
            },
            songID: choreo.songID,
            choreoID: choreo.choreoId,
            choreoIndex: 0,
            length: length,
            mode: (choreo.songFilename) ? 2 : 1,
            'x-choreoLabel': choreo.choreoAuthor + " - " + choreo.songArtist + " - " + choreo.songName + " - " + choreo.choreoName,
            'x-choreoFile': "" + choreo.songFilename,
        });
        playlist.totalDuration += length;
    });
    var filenameSanitized = (filename + ".atl").replace(/\//g, '_');
    fs.writeFile(filenameSanitized, JSON.stringify(playlist, null, 2), { encoding: 'utf-8' }, function (err) {
        err && console.log('failed to write playlist', err);
    });
}
function repeatToLength(p, n) {
    var parts = new Array(Math.ceil(n / p.length));
    for (var i = 0, n_1 = parts.length; i < n_1; ++i) {
        parts[i] = p;
    }
    var tmp = parts.join('');
    return tmp.substr(0, n);
}
function rp(x, n, pad) {
    if (pad === void 0) { pad = ' '; }
    if (x.length < n) {
        return x + repeatToLength(pad, n - x.length);
    }
    return x;
}
function lp(x, n, pad) {
    if (pad === void 0) { pad = ' '; }
    if (x.length < n) {
        return repeatToLength(pad, n - x.length) + x;
    }
    return x;
}
function fmt0(x) {
    return x != null ? x.toFixed(0) : '-';
}
function fmt2(x) {
    return x != null ? x.toFixed(2) : '-';
}
function choreoField(item) {
    var val;
    switch (item) {
        default:
        case 'name':
            val = function (x) { return x.songName; };
            break;
        case 'length':
            val = function (x) { return x.songLength; };
            break;
        case 'date':
            val = function (x) { return x.songModificationTimestamp; };
            break;
        case 'gemspeed':
            val = function (x) { return x.choreoGemSpeed; };
            break;
        case 'gems':
            val = function (x) { return x.choreoMeta.numGemsLeft + x.choreoMeta.numGemsRight; };
            break;
        case 'dirgems':
            val = function (x) { return x.choreoMeta.numDirGemsLeft + x.choreoMeta.numDirGemsRight; };
            break;
        case 'drums':
            val = function (x) { return x.choreoMeta.numDrumsLeft + x.choreoMeta.numDrumsRight; };
            break;
        case 'ribbons':
            val = function (x) { return x.choreoMeta.numRibbonsLeft + x.choreoMeta.numRibbonsRight; };
            break;
        case 'barriers':
            val = function (x) { return x.choreoMeta.numBarriers; };
            break;
    }
    return val;
}
function orderByDate(dir) {
    var f = dir == '-' ? -1 : 1;
    return function orderByDateX(a, b) {
        return f * (a.songModificationTimestamp - b.songModificationTimestamp);
    };
}
function orderByName(dir, field) {
    if (field === void 0) { field = 'songName'; }
    var f = dir == '-' ? -1 : 1;
    return function orderByNameX(a, b) {
        return f * (a[field].localeCompare(b[field]));
    };
}
function orderByChoreo(item, dir) {
    var f = dir == '-' ? -1 : 1;
    var val = choreoField(item);
    return function orderByChoreoX(a, b) {
        var valA = val(a);
        var valB = val(b);
        return f * (valA - valB);
    };
}
function orderAuthorEntriesByLength(dir) {
    var f = dir == '-' ? -1 : 1;
    return function orderAEByLengthX(a, b) {
        return f * (a[1].length - b[1].length
            || (0, utils_1.sum)(a[1].map(function (x) { return x.songLength; })) - (0, utils_1.sum)(b[1].map(function (x) { return x.songLength; })));
    };
}
function orderByLength(dir) {
    var f = dir == '-' ? -1 : 1;
    return function orderByLengthX(a, b) {
        return f * (a.songLength - b.songLength);
    };
}
