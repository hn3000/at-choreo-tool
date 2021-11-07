
import { findSongs, choreoCollector, IChoreoEntry } from './index';
import { JsonPointer } from '@hn3000/json-ref';
import { AudioTripPlaylist } from '@hn3000/ats-types/';


import * as fs from 'fs';
import { niceDate, niceTime, sum } from './utils';
import { lastfm_getTopTags } from './last-fm';

export function main(args: string[]) {

  console.warn(args);

  const cmd = args[2] ?? 'dumpinfo'

  const restArgs = args.slice(3);

  const options = restArgs.filter(x => x.startsWith('--'));

  const paths = restArgs.filter(x => !x.startsWith('--')) || [ '.' ];
  let sortOrder = orderByDate('-');
  let sortField = 'date';
  let limit = 10;
  let lastFmTags = false;

  options.forEach(o => {
    const [option,args = ''] = o.split('=');
    switch (option) {
      case '--count':
        limit = Number(args);
        break;
      case '--last-fm-tags':
        lastFmTags = true;
        break;
      case '--sort':
        let m = /^(-|\+)?(.*)$/.exec(args);
        const dir: SortDir|null = m[1] as SortDir;
        sortField = m[2];
        switch (m[2]) {
          case 'gems':
          case 'ribbons':
          case 'dirgems':
          case 'barriers':
          case 'drums':  sortOrder = orderByChoreo(m[2], dir || '-'); break;
          case 'name':   sortOrder = orderByName(dir || '+'); break;
          case 'length': sortOrder = orderByLength(dir || '-'); break;
          default:
          case 'date':   sortOrder = orderByDate(dir || '-'); break;
        }
        break;
      default:
        console.warn(`Unsupported option ${o} ignored.`);
    }
  })

  const [ collection, collectorCB] = choreoCollector([
    { key: 'author', field: JsonPointer.get('/metadata/authorID/displayName') },
    { key: 'artist', field: JsonPointer.get('/metadata/artist') },
    { key: 'all', field: { getValue: () => '*'} },
  ]);
  
  const doneCB = async () => {
    const promises = [] as Promise<any>[];
    if (lastFmTags) {
      const all = collection['all']['*'];
      all.forEach(async x => {
        const p = lastfm_getTopTags(x.songName, x.songArtist).then(r => {
          const tags = r?.toptags?.tag;
          x.songTags = tags?.map(x => x.name);
        }, err => ([]));
        promises.push(p);
      });
    }
    await Promise.resolve();
    //console.debug(`gonna wait for ${promises.length} promises`);
    await Promise.all(promises);

    switch (cmd) {
      case 'dumpinfo':
        console.log(JSON.stringify(collection, null, 2));
        break;
      case 'tallest':
        break;
      case 'widest':
        break;
      case 'csv-songs': {
        const all = collection['all']['*'];
        const choreos = all.filter(x => x.choreoEventCount > 0);
        choreos.sort(sortOrder);
        const map = new Map<string, IChoreoEntry[]>();
        choreos.forEach(k => {
          const song = `"${k.songName}","${k.songArtist}"`;
          if (!map.has(song)) {
            map.set(song, []);
          }
          map.get(song).push(k);
        });
        console.log('"n","song","artist","mapper","levels","bpm","length","mapped","tags"');
        [...map.entries()].forEach((e,i) => {
          const choreos = e[1];
          const mapperSet = choreos.reduce((s,x) => (s.add(x.choreoAuthor),s), new Set());
          const mappers = [...mapperSet].join(' / ');
          const tags = (choreos[0].songTags ?? []).join(';');
          const levels = choreos.map(x => x.choreoName).join(', ');
          const { songBPM, songLength, songModificationTimestamp } = choreos[0];
          console.log(`"${i+1}",${e[0]},"${mappers}","${levels}","${songBPM}","${niceTime(songLength)}","${niceDate(songModificationTimestamp)}","${tags}"`);
        });
        break;
        }
      case 'top-songs':
        const field = choreoField(sortField);
        const all = collection['all']['*'];
        const choreos = all.filter(x => x.choreoEventCount > 0);
        choreos.sort(sortOrder);

        const topChoreos = choreos.slice(0,limit);
        const lengths = {
          songName: 0,
          songArtist: 0,
          choreoName: 0,
          choreoAuthor: 0,
        };
        const keys = Object.keys(lengths);
        topChoreos.forEach((choreo,i) => {
          for (let k of keys) {
            lengths[k] = Math.max(lengths[k], choreo[k].length);
          }
        });
        for (let k of keys) {
          lengths[k] += 1;
        }
        topChoreos.forEach((choreo,i) => {
          const { songName, songArtist, songBPM, songLength, songModificationTimestamp, choreoAuthor, choreoName } = choreo;
          console.log(
              rp(songName, lengths.songName)
            + rp(songArtist, lengths.songArtist)
            + lp(`(${fmt0(songBPM)})`, 5) + ' ' 
            + rp(choreoName, lengths.choreoName)
            + rp(choreoAuthor, lengths.choreoAuthor)
            + rp(`${niceTime(songLength)}`, 7)
            +`${niceDate(songModificationTimestamp)} `
            + `[${sortField}: ${field(choreo)}]`
            );
        });
        break;
      case 'stats':
      case 'stats-extended':
      case 'statsExtended': {
        const authorEntries = Object.entries(collection['author']);
        authorEntries.forEach(ae => {
          let list = ae[1];
          ae[1] = list.filter(x => x.choreoEventCount > 0);
          ae[1].sort(sortOrder);
        });
        authorEntries.sort(orderAuthorEntriesByLength('+'));
        let totalTime = 0;
        let totalChoreos = 0;
        let totalSongs = new Set<string>();
        authorEntries.forEach(ae => {
          const thisCount = ae[1].length;
          const thisSongs = new Set<string>();
          totalChoreos += thisCount;
          const thisTime = sum(ae[1].map(x => x.songLength));
          totalTime += thisTime;
          ae[1].forEach(k => {
            thisSongs.add(`${k.songArtist} - ${k.songName}`);
          });
          console.log(`${ae[0]}\t${thisSongs.size}\t${thisCount}\t${niceTime(thisTime)}`)
          thisSongs.forEach(s => totalSongs.add(s));
          if (cmd.endsWith('xtended')) {
            ae[1].forEach(k => {
              console.log(`\t${k.choreoAuthor} - ${k.songArtist} - ${k.songName} - ${k.choreoName}`);
              console.log(`\t\tx: ${fmt2(k.choreoMeta.xMin)} .. ${fmt2(k.choreoMeta.xMax)}, y: ${fmt2(k.choreoMeta.yMin)} .. ${fmt2(k.choreoMeta.yMax)}`);
              console.log(`\t\tbarriers: ${k.choreoMeta.numBarriers}, gems: ${k.choreoMeta.numGemsLeft}/${k.choreoMeta.numGemsRight}`);
              console.log(`\t\tdirgems: ${k.choreoMeta.numDirGemsLeft}/${k.choreoMeta.numDirGemsRight}, drums: ${k.choreoMeta.numDrumsLeft}/${k.choreoMeta.numDrumsRight}`);
            });
          }
        });
        console.log(`total\t${totalSongs.size} songs\t${totalChoreos} choreos\t${niceTime(totalTime)}`);
        break;
        }

      case 'create-playlists':
      case 'clonable-playlists':
      case 'createPlaylists':
      case 'clonablePlaylists':
        const clonable = cmd.startsWith('clonable');
        const allChoreos = [] as IChoreoEntry[];
        Object.keys(collection['author']).forEach(
          (author) => {
            const choreosAll = collection['author'][author];
            const choreos = choreosAll.filter(x => x.choreoEventCount > 0);
            choreos.sort(orderByDate('-'));
            allChoreos.push(...choreos);

            if (choreos.length > 1) {
              makePlaylist(`by ${author}`, `all-by-${author} (${choreos.length})`, choreos, clonable);
              if (choreos.length > 10) {
                const count = choreos.length;
                const rems = [8,9,10,11].map(x => ({x, r: count % x }));
                const bestStep = rems.reduce((a,b) => a.r > b.r ? a : b).x;

                for (let i = 0; i < count; i += bestStep) {
                  const part = Math.floor(i / bestStep)+1;
                  const partstr = part < 10 ? '0'+part : part;
                  makePlaylist(`by ${author} Pt ${partstr}`, `all-by-${author}-${partstr}`, choreos.slice(i, i+bestStep), clonable);
                }
              }
            } else {
              makePlaylist(`by ${author}`, `by-${author}`, choreos, clonable);
            }
          }
        );
        allChoreos.sort((a,b) => b.songModificationTimestamp - a.songModificationTimestamp);

        makePlaylist('Most Recent 5', 'newest-05', allChoreos.slice(0,5), clonable);
        makePlaylist('Most Recent 10', 'newest-10', allChoreos.slice(0,10), clonable);
        makePlaylist('Most Recent 20', 'newest-20', allChoreos.slice(0,20), clonable);
        makePlaylist('Most Recent 30', 'newest-30', allChoreos.slice(0,30), clonable);
        makePlaylist('Most Recent 40', 'newest-40', allChoreos.slice(0,40), clonable);
        makePlaylist('Most Recent 50', 'newest-50', allChoreos.slice(0,50), clonable);

        const count = allChoreos.length;
        const rems = [8,9,10,11].map(x => ({x, r: count % x }));
        const bestStep = rems.reduce((a,b) => a.r > b.r ? a : b).x;

        for (let i = 0; i < count; i += bestStep) {
          const part = Math.floor(i / bestStep)+1;
          const partstr = part < 10 ? '0'+part : part;
          makePlaylist(`Most Recent Part ${partstr}`, `newest-pt-${partstr}`, allChoreos.slice(i, i+bestStep), clonable);
        }

        break;
    }
  };

  findSongs(paths, collectorCB, doneCB);

}

function makePlaylist(name: string, filename: string, choreos: IChoreoEntry[], clonable: boolean) {
  const playlist: AudioTripPlaylist = {
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
  choreos.forEach(choreo => {
    const length = choreo.songLength;
    playlist.items.push({
      song: {
        m_FileID: 0,
        m_PathID: 0
      },
      songID: choreo.songID,
      choreoID: choreo.choreoId,
      choreoIndex: 0,
      length,
      mode: (choreo.songFilename)? 2 : 1,
      'x-choreoLabel': `${choreo.choreoAuthor} - ${choreo.songArtist} - ${choreo.songName} - ${choreo.choreoName}`,
      'x-choreoFile': `${choreo.songFilename}`,
    });
    playlist.totalDuration += length;
  });
  const filenameSanitized = `${filename}.atl`.replace(/\//g, '_');
  fs.writeFile(
    filenameSanitized,
    JSON.stringify(playlist, null, 2), 
    { encoding: 'utf-8' },
    (err) => {
      err && console.log('failed to write playlist', err);
    }
  );

}

function repeatToLength(p: string, n: number) {
  const parts = new Array<string>(Math.ceil(n / p.length));
  for (let i = 0, n = parts.length; i<n; ++i) {
    parts[i] = p;
  }
  const tmp = parts.join('');
  return tmp.substr(0, n);
}

function rp(x: string, n: number, pad = ' ') {
  if (x.length < n) {
    return x + repeatToLength(pad, n - x.length);
  }
  return x;
}

function lp(x: string, n: number, pad = ' ') {
  if (x.length < n) {
    return repeatToLength(pad, n - x.length) + x;
  }
  return x;
}

function fmt0(x?: number) {
  return x != null ? x.toFixed(0) : '-';
}
function fmt2(x?: number) {
  return x != null ? x.toFixed(2) : '-';
}

function choreoField(item: string) 
: (x: any) => number|string
{
  let val: (x: IChoreoEntry) => number|string;
  switch (item) {
    default:
    case 'name':     val = (x: IChoreoEntry) => x.songName; break;
    case 'length':   val = (x: IChoreoEntry) => x.songLength; break;
    case 'date':     val = (x: IChoreoEntry) => x.songModificationTimestamp; break;
    case 'gems':     val = (x: IChoreoEntry) => x.choreoMeta.numGemsLeft + x.choreoMeta.numGemsRight;       break;
    case 'dirgems':  val = (x: IChoreoEntry) => x.choreoMeta.numDirGemsLeft + x.choreoMeta.numDirGemsRight; break;
    case 'drums':    val = (x: IChoreoEntry) => x.choreoMeta.numDrumsLeft + x.choreoMeta.numDrumsRight;     break;
    case 'ribbons':  val = (x: IChoreoEntry) => x.choreoMeta.numRibbonsLeft + x.choreoMeta.numRibbonsRight; break;
    case 'barriers': val = (x: IChoreoEntry) => x.choreoMeta.numBarriers; break;
  }
  return val;
}

type SortDir = '+'|'-';
function orderByDate(dir: SortDir) {
  const f = dir == '-' ? -1 : 1;
  return function orderByDateX(a,b) {
    return f * (a.songModificationTimestamp - b.songModificationTimestamp);
  }
}

function orderByName(dir: SortDir) {
  const f = dir == '-' ? -1 : 1;
  return function orderByNameX(a,b) {
    return f * (a.songName.localeCompare(b.songName));
  }
}
function orderByChoreo(item: 'gems'|'dirgems'|'drums'|'barriers'|'ribbons'|string, dir: SortDir)
: (a: IChoreoEntry, b: IChoreoEntry) => number
{
  const f = dir == '-' ? -1 : 1;

  const val = choreoField(item) as (x: any) => number;
  return function orderByChoreoX(a: IChoreoEntry, b: IChoreoEntry) {
    const valA = val(a);
    const valB = val(b); 
    return f * (valA - valB);
  }
}
function orderAuthorEntriesByLength(dir: SortDir) {
  const f = dir == '-' ? -1 : 1;

  return function orderAEByLengthX(a,b) {
    return f * (
      a[1].length - b[1].length 
      || sum(a[1].map(x => x.songLength))-sum(b[1].map(x => x.songLength))
    );
  }
}

function orderByLength(dir: SortDir) {
  const f = dir == '-' ? -1 : 1;

  return function orderByLengthX(a,b) {
    return f * (a.songLength - b.songLength);
  }
}
