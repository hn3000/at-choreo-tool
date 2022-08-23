"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.choreoCollector = exports.findSongs = void 0;
var filewalker_1 = require("@hn3000/filewalker");
var parseSongFile_1 = require("./parseSongFile");
var utils_1 = require("./utils");
function findSongs(paths, fileHandler, done) {
    var walker = new filewalker_1.FileWalker();
    walker.on('*.ats', function (file) {
        var contents = (0, parseSongFile_1.parseSongFile)(file.contents, file.name);
        fileHandler(contents, file.name, file.stats);
    }, true);
    walker.walk(paths);
    walker.done(done);
}
exports.findSongs = findSongs;
;
function choreoCollector(fields) {
    var collection = {};
    var collector = function (song, songFilename, stats) {
        var extractedMeta = {};
        fields.forEach(function (f) {
            extractedMeta[f.key] = f.field.getValue(song);
        });
        fields.forEach(function (f) {
            var hash = collection[f.key];
            if (null == hash) {
                hash = collection[f.key] = {};
            }
            var value = f.field.getValue(song);
            var list = hash[value];
            if (null == list) {
                list = hash[value] = [];
            }
            var songBPM = (song.metadata.avgBPM == parseSongFile_1.BPM_NAN_BPM)
                ? (0, utils_1.avg)(song.metadata.tempoSections.map(function (s) { return s.beatsPerMinute; }))
                : song.metadata.avgBPM;
            song.choreographies.list.forEach(function (choreo) {
                var _a, _b, _c, _d;
                var choreoMeta = choreo.data.events.reduce(choreoMetaCollector, emptyChoreoMetadata());
                list.push({
                    songID: song.metadata.songID,
                    songName: song.metadata.title,
                    songArtist: song.metadata.artist,
                    songLength: (_a = song.metadata.songFullLengthInSeconds) !== null && _a !== void 0 ? _a : song.metadata.songEndTimeInSeconds,
                    songFilename: songFilename,
                    songAudioFilename: song.metadata.songFilename,
                    songModificationTimestamp: stats.mtimeMs,
                    choreoId: choreo.header.id,
                    choreoAuthor: song.metadata.authorID.displayName,
                    choreoName: choreo.header.name,
                    choreoGemSpeed: choreo.header.gemSpeed,
                    choreoEventCount: choreo.data.events.length,
                    choreoEventStart: (_d = (_c = (_b = choreo.data.events[0]) === null || _b === void 0 ? void 0 : _b.time) === null || _c === void 0 ? void 0 : _c.beat) !== null && _d !== void 0 ? _d : -1,
                    choreoMeta: choreoMeta,
                    songBPM: songBPM,
                    extractedMeta: __assign({}, extractedMeta)
                });
            });
        });
    };
    var collectorGuarded = function (song, songFilename, stats) {
        var _a, _b, _c, _d;
        try {
            return collector(song, songFilename, stats);
        }
        catch (ex) {
            console.warn("caught " + ex + " when parsing " + songFilename + " (" + ((_b = (_a = song === null || song === void 0 ? void 0 : song.metadata) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : '??') + " / " + ((_d = (_c = song === null || song === void 0 ? void 0 : song.metadata) === null || _c === void 0 ? void 0 : _c.artist) !== null && _d !== void 0 ? _d : '??') + ")");
        }
    };
    return [collection, collectorGuarded];
}
exports.choreoCollector = choreoCollector;
function min(a, b) {
    if (a == undefined || isNaN(a)) {
        return b;
    }
    if (b == undefined || isNaN(b)) {
        return a;
    }
    if (a < b)
        return a;
    return b;
}
function max(a, b) {
    if (a == undefined || isNaN(a)) {
        return b;
    }
    if (b == undefined || isNaN(b)) {
        return a;
    }
    if (a > b)
        return a;
    return b;
}
function inc(x, p) {
    var _a;
    x[p] = 1 + ((_a = x[p]) !== null && _a !== void 0 ? _a : 0);
}
function emptyChoreoMetadata() {
    var result = {
        numBarriers: 0,
        numDirGemsLeft: 0,
        numDirGemsRight: 0,
        numDrumsLeft: 0,
        numDrumsRight: 0,
        numGemsLeft: 0,
        numGemsRight: 0,
        numRibbonsLeft: 0,
        numRibbonsRight: 0,
        xMin: undefined,
        xMax: undefined,
        yMin: undefined,
        yMax: undefined,
    };
    return result;
}
function choreoMetaCollector(r, x) {
    var result = __assign({}, r);
    /**
     * 0: Barrier
     * 1: Left-hand Gem
     * 2: Right-hand Gem
     * 3: Ribbon (left)
     * 4: Ribbon (right)
     * 5: Drum (left)
     * 6: Drum (right)
     * 7: DirGem (left)
     * 8: DirGem (right)
     */
    var keys = [
        'numBarriers',
        'numGemsLeft',
        'numGemsRight',
        'numRibbonsLeft',
        'numRibbonsRight',
        'numDrumsLeft',
        'numDrumsRight',
        'numDirGemsLeft',
        'numDirGemsRight',
    ];
    if (keys[x.type] != undefined) {
        inc(result, keys[x.type]);
    }
    switch (x.type) {
        case 0:
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
            result.xMax = max(result.xMax, x.position.x);
            result.xMin = min(result.xMin, x.position.x);
            result.yMax = max(result.yMax, x.position.y);
            result.yMin = min(result.yMin, x.position.y);
            break;
    }
    return result;
}
