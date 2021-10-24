
import { AudioTripSong } from '@hn3000/ats-types';

export const BPM_NAN_BPM = -667; // neighbor of the beast -- marker for later
export function fixNaN(json: string) {
  return json.replace(/NaN/, `${BPM_NAN_BPM}`);
}

export function parseSongFile(chars: string, fn: string): AudioTripSong {
  try {
    return JSON.parse(fixNaN(chars));
  } catch (x) {
    console.log(`could not parse song file ${fn}, got ${x}`);
  }

}