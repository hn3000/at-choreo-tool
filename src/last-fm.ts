
const MISSING_KEY = 'missing last.fm API key';
const LASTFM_API_KEY = process.env['LASTFM_API_KEY'] || MISSING_KEY;

import { ILastFMTags } from './last-fm-api';
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

async function fetchLastFM<T>(url) {
  if (LASTFM_API_KEY == MISSING_KEY) {
    console.warn(`not fetching ${url}, no api key`);
    throw "missing api key";
  }
  const sep = url.includes('?') ? '&' : '?';
  const urlComplete = `${url}${sep}api_key=${LASTFM_API_KEY}&format=json`;
  let retry = false;
  do {
    try {
      await nextTimeout();
      //console.debug(`last-fm: ${urlComplete}`);
      let result = await unpackResult<T>(fetch(urlComplete));
    
      return result;
    } catch (xx) {
      if (xx === 'retry') {
        retry = true;
      }
      throw xx;
    }
  } while (retry);
}


const topTagCache = new Map<string, Promise<ILastFMTags>>();

interface ILastFMCacheEntry {
  info?: any;
  error?: any;
}

interface ILastFMCache {
  [kind: string]: {
    [key: string]: ILastFMCacheEntry;
  }
}

const LASTFM_CACHE_FILE = './.lastFmCache.json';
if (fs.existsSync(LASTFM_CACHE_FILE)) {
  const cacheFileContents = fs.readFileSync(LASTFM_CACHE_FILE, { encoding: 'utf-8' });
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
  fs.writeFileSync(LASTFM_CACHE_FILE, JSON.stringify(cacheContents, null, 2), { encoding: 'utf-8' });
});

export async function lastfm_getTopTags(song: string, artist: string): Promise<ILastFMTags> {
  const songKey = `${song}--:--${artist}`;
  let result = topTagCache.get(songKey);
  if (null == result) {
    result = fetchLastFM(`http://ws.audioscrobbler.com/2.0/?method=track.getTopTags&track=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`);
    topTagCache.set(songKey, result);
  }
  return result;
}