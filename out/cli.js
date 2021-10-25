"use strict";
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
function main(args) {
    var _a;
    console.warn(args);
    var cmd = (_a = args[2]) !== null && _a !== void 0 ? _a : 'dumpinfo';
    var restArgs = args.slice(3);
    var options = restArgs.filter(function (x) { return x.startsWith('--'); });
    var paths = restArgs.filter(function (x) { return !x.startsWith('--'); }) || ['.'];
    var sortOrder = orderByDate('-');
    var sortField = 'date';
    var limit = 10;
    options.forEach(function (o) {
        var _a = __read(o.split('='), 2), option = _a[0], _b = _a[1], args = _b === void 0 ? '' : _b;
        switch (option) {
            case '--count':
                limit = Number(args);
                break;
            case '--sort':
                var m = /^(-|\+)?(.*)$/.exec(args);
                var dir = m[1];
                sortField = m[2];
                switch (m[2]) {
                    case 'gems':
                    case 'ribbons':
                    case 'dirgems':
                    case 'barriers':
                    case 'drums':
                        sortOrder = orderByChoreo(m[2], dir || '-');
                        break;
                    case 'name':
                        sortOrder = orderByName(dir || '+');
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
    var doneCB = function () {
        var e_1, _a;
        switch (cmd) {
            case 'dumpinfo':
                console.log(JSON.stringify(collection, null, 2));
                break;
            case 'tallest':
                break;
            case 'widest':
                break;
            case 'csv-songs': {
                var all_1 = collection['all']['*'];
                var choreos_1 = all_1.filter(function (x) { return x.choreoEventCount > 0; });
                choreos_1.sort(sortOrder);
                var map_1 = new Map();
                choreos_1.forEach(function (k) {
                    var song = "\"" + k.songName + "\",\"" + k.songArtist + "\"";
                    if (!map_1.has(song)) {
                        map_1.set(song, []);
                    }
                    map_1.get(song).push(k);
                });
                console.log('"n","song","artist","mapper","levels","bpm","length","mapped"');
                __spreadArray([], __read(map_1.entries()), false).forEach(function (e, i) {
                    var choreos = e[1];
                    var mapperSet = choreos.reduce(function (s, x) { return (s.add(x.choreoAuthor), s); }, new Set());
                    var mappers = __spreadArray([], __read(mapperSet), false).join(' / ');
                    var levels = choreos.map(function (x) { return x.choreoName; }).join(', ');
                    var _a = choreos[0], songBPM = _a.songBPM, songLength = _a.songLength, songModificationTimestamp = _a.songModificationTimestamp;
                    console.log("\"" + (i + 1) + "\"," + e[0] + ",\"" + mappers + "\",\"" + levels + "\",\"" + songBPM + "\",\"" + (0, utils_1.niceTime)(songLength) + "\",\"" + (0, utils_1.niceDate)(songModificationTimestamp) + "\"");
                });
                break;
            }
            case 'top-songs':
                var field_1 = choreoField(sortField);
                var all = collection['all']['*'];
                var choreos = all.filter(function (x) { return x.choreoEventCount > 0; });
                choreos.sort(sortOrder);
                var topChoreos = choreos.slice(0, limit);
                var lengths_1 = {
                    songName: 0,
                    songArtist: 0,
                    choreoName: 0,
                    choreoAuthor: 0,
                };
                var keys_2 = Object.keys(lengths_1);
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
                    for (var keys_1 = __values(keys_2), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                        var k = keys_1_1.value;
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
                var authorEntries = Object.entries(collection['author']);
                authorEntries.forEach(function (ae) {
                    var list = ae[1];
                    ae[1] = list.filter(function (x) { return x.choreoEventCount > 0; });
                    ae[1].sort(sortOrder);
                });
                authorEntries.sort(orderAuthorEntriesByLength('+'));
                var totalTime_1 = 0;
                var totalChoreos_1 = 0;
                var totalSongs_1 = new Set();
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
                var clonable_1 = cmd.startsWith('clonable');
                var allChoreos_1 = [];
                Object.keys(collection['author']).forEach(function (author) {
                    var choreosAll = collection['author'][author];
                    var choreos = choreosAll.filter(function (x) { return x.choreoEventCount > 0; });
                    choreos.sort(orderByDate('-'));
                    allChoreos_1.push.apply(allChoreos_1, __spreadArray([], __read(choreos), false));
                    if (choreos.length > 1) {
                        makePlaylist("by " + author, "all-by-" + author + " (" + choreos.length + ")", choreos, clonable_1);
                        if (choreos.length > 10) {
                            var count_1 = choreos.length;
                            var rems_1 = [8, 9, 10, 11].map(function (x) { return ({ x: x, r: count_1 % x }); });
                            var bestStep_1 = rems_1.reduce(function (a, b) { return a.r > b.r ? a : b; }).x;
                            for (var i = 0; i < count_1; i += bestStep_1) {
                                var part = Math.floor(i / bestStep_1) + 1;
                                var partstr = part < 10 ? '0' + part : part;
                                makePlaylist("by " + author + " Pt " + partstr, "all-by-" + author + "-" + partstr, choreos.slice(i, i + bestStep_1), clonable_1);
                            }
                        }
                    }
                    else {
                        makePlaylist("by " + author, "by-" + author, choreos, clonable_1);
                    }
                });
                allChoreos_1.sort(function (a, b) { return b.songModificationTimestamp - a.songModificationTimestamp; });
                makePlaylist('Most Recent 5', 'newest-05', allChoreos_1.slice(0, 5), clonable_1);
                makePlaylist('Most Recent 10', 'newest-10', allChoreos_1.slice(0, 10), clonable_1);
                makePlaylist('Most Recent 20', 'newest-20', allChoreos_1.slice(0, 20), clonable_1);
                makePlaylist('Most Recent 30', 'newest-30', allChoreos_1.slice(0, 30), clonable_1);
                makePlaylist('Most Recent 40', 'newest-40', allChoreos_1.slice(0, 40), clonable_1);
                makePlaylist('Most Recent 50', 'newest-50', allChoreos_1.slice(0, 50), clonable_1);
                var count_2 = allChoreos_1.length;
                var rems = [8, 9, 10, 11].map(function (x) { return ({ x: x, r: count_2 % x }); });
                var bestStep = rems.reduce(function (a, b) { return a.r > b.r ? a : b; }).x;
                for (var i = 0; i < count_2; i += bestStep) {
                    var part = Math.floor(i / bestStep) + 1;
                    var partstr = part < 10 ? '0' + part : part;
                    makePlaylist("Most Recent Part " + partstr, "newest-pt-" + partstr, allChoreos_1.slice(i, i + bestStep), clonable_1);
                }
                break;
        }
    };
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
function orderByName(dir) {
    var f = dir == '-' ? -1 : 1;
    return function orderByNameX(a, b) {
        return f * (a.songName.localeCompare(b.songName));
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
