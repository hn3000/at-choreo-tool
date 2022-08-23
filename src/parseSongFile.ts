
import { AudioTripSong } from '@hn3000/ats-types';

export const BPM_NAN_BPM = -667; // neighbor of the beast -- marker for later
export function fixNaN(json: string) {
  return json.replace(/NaN/, `${BPM_NAN_BPM}`);
}

export function parseSongFile(chars: string, fn: string): AudioTripSong {
  try {
    const result = JSON.parse(fixNaN(chars));
    if (!result || 0 === Object.keys(result).length) {
      console.log(`could not parse song file ${fn}, got ${result}`);
    }
    return result;
  } catch (x) {
    console.log(`could not parse song file ${fn}, got ${x}`);
  }

}