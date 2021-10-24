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
        return JSON.parse(fixNaN(chars));
    }
    catch (x) {
        console.log("could not parse song file " + fn + ", got " + x);
    }
}
exports.parseSongFile = parseSongFile;
