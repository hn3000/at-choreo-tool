"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSongFile = exports.fixNaN = exports.BPM_NAN_BPM = void 0;
exports.BPM_NAN_BPM = -667; // neighbor of the beast -- marker for later
function fixNaN(json) {
    return json.replace(/NaN/, "" + exports.BPM_NAN_BPM);
}
exports.fixNaN = fixNaN;
function parseSongFile(chars, fn) {
    try {
        var result = JSON.parse(fixNaN(chars));
        if (!result || 0 === Object.keys(result).length) {
            console.log("could not parse song file " + fn + ", got " + result);
        }
        return result;
    }
    catch (x) {
        console.log("could not parse song file " + fn + ", got " + x);
    }
}
exports.parseSongFile = parseSongFile;
