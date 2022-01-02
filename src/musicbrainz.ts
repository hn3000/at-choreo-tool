
const MISSING_KEY = 'missing last.fm API key';
const MUSICBRAINZ_API_KEY = process.env['MUSICBRAINZ_API_KEY'] || MISSING_KEY;

import {  } from './last-fm-api';
import { resolveAfter } from '@hn3000/promise-timeout';
import * as fetch from 'isomorphic-fetch';
import * as fs from 'fs';

let _nextTimeout = Promise.resolve(undefined);
let _currentDelay = 1100; // slightly over 1s, to be on the safe side

function nextTimeout() {
  const tmp = _nextTimeout;
  _nextTimeout = tmp.then(_ => resolveAfter(_currentDelay));
  return tmp;
}

function increaseTimeout() {
  _currentDelay *= 2; // if we observe failures, maybe a second process is requestion from this IP?
}

async function unpackResult<T>(resultP: Promise<Response>): Promise<T> {
  const result = await resultP;
  if (result.status === 200) {
    return result.json() as Promise<T>;
  } else if (result.status === 503) {
    increaseTimeout();
    if (_currentDelay < 60*1000) {
      throw "retry";
    }
  }
  throw new Error(result.statusText+' '+result.status);
}

async function fetchMusicBrainz<T>(url) {
  if (MUSICBRAINZ_API_KEY == MISSING_KEY) {
    console.warn(`not fetching ${url}, no api key`);
    throw "missing api key";
  }
  const sep = url.includes('?') ? '&' : '?';
  const urlComplete = `${url}${sep}api_key=${MUSICBRAINZ_API_KEY}&format=json`;
  let retry = false;
  do {
    try {
      await nextTimeout();
      console.debug(`musicbrainz: ${urlComplete}`);
      let result = await unpackResult<T>(fetch(urlComplete, {
        headers: {
          "User-Agent": "hn3000-AudioTrip-choreo-tool/1.0 ( https://github.com/hn3000/at-choreo-tool )"
        }
      }));
    
      return result;
    } catch (xx) {
      if (xx === 'retry') {
        retry = true;
      }
      throw xx;
    }
  } while (retry);
}


const topTagCache = new Map<string, Promise<any>>();

interface ILastFMCacheEntry {
  info?: any;
  error?: any;
}

interface ILastFMCache {
  [kind: string]: {
    [key: string]: ILastFMCacheEntry;
  }
}

const MUSICBRAINZ_CACHE_FILE = './.musicbrainzCache.json';
if (fs.existsSync(MUSICBRAINZ_CACHE_FILE)) {
  const cacheFileContents = fs.readFileSync(MUSICBRAINZ_CACHE_FILE, { encoding: 'utf-8' });
  if (cacheFileContents.trim().length) {
    try {
      const cacheContents = JSON.parse(cacheFileContents);
      if (cacheContents.topTagsBySong) {
        Object.entries(cacheContents.topTagsBySong).forEach((x: any) => {
          const [songKey, entry] = x as any as [string, ILastFMCacheEntry];
          topTagCache.set(songKey, entry.info ? Promise.resolve(entry.info) : Promise.reject(entry.error));
        });
      }
    
    } catch (ex) {
      console.debug(`corrupt cache file? ${ex}`);
    }
  } else {
    console.debug(`note: empty cache file.`);
  }
}

async function cacheEntry(p: Promise<any>): Promise<ILastFMCacheEntry> {
  return await p.then(info => ({ info }), error => ({ error }));
}

process.on('beforeExit', async () => {
  
  const topTags: [string, ILastFMCacheEntry][] = await Promise.all(
    [...topTagCache.entries()].map(
      async (x) => {
        const ce = await cacheEntry(x[1]);
        return ([x[0], ce]) as [string, ILastFMCacheEntry];
      }
    )
  );
  
  const cacheContents = {} as ILastFMCache;
  cacheContents.topTagsBySong = {};
  topTags.forEach(([key, entry]) => {cacheContents.topTagsBySong[key] = entry;});
  fs.writeFileSync(MUSICBRAINZ_CACHE_FILE, JSON.stringify(cacheContents, null, 2), { encoding: 'utf-8' });
});

export async function musicbrainz_tags(song: string, artist: string): Promise<any> {
  const songKey = `${song}--:--${artist}`;
  let result = topTagCache.get(songKey);
  if (null == result) {
    result = fetchMusicBrainz<any>(`https://musicbrainz.com/ws/2/recording?query=name:${encodeURIComponent(song)}+artist:${encodeURIComponent(artist)}`);
    topTagCache.set(songKey, result);
  }
  return await result;
}