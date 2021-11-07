
import { FileWalker, IFile } from '@hn3000/filewalker';
import { parseSongFile, BPM_NAN_BPM } from './parseSongFile';
import { AudioTripSong, IChoreoEvent } from '@hn3000/ats-types';
import { JsonPointer } from '@hn3000/json-ref';
import { avg } from './utils';

import * as fs from 'fs';

export function findSongs(
  paths: string[],
  fileHandler: (song: AudioTripSong, fn: string, stats: fs.Stats) => void,
  done: () => void
) {
  const walker = new FileWalker();

  walker.on('*.ats', (file: IFile) => {
    const contents = parseSongFile(file.contents, file.name);
    fileHandler(contents, file.name, file.stats);
  }, true);

  walker.walk(paths);

  walker.done(done);
}

export interface IChoreoEntry {
  songID: string;
  songName: string;
  songArtist: string;
  songFilename: string;
  songBPM: number;
  songLength: number;
  songModificationTimestamp: number;
  songTags?: string[];

  choreoId: string;
  choreoAuthor: string;
  choreoName: string;
  choreoGemSpeed: number;
  choreoEventCount: number;
  choreoEventStart: number;
  choreoMeta: IChoreoMetadata;
  extractedMeta: { [key:string]: string | number };
}
interface IChoreoCollection { 
  [field: string]: { 
    [val:string]:  IChoreoEntry[];
  }
};

export interface IChoreoCollectorEntry {
  key: string;
  field: JsonPointer | { getValue(x: any): any };
}
export function choreoCollector(fields: IChoreoCollectorEntry[])
: [IChoreoCollection, (song: AudioTripSong, songFilename: string, stats: fs.Stats) => void ] 
{
  const collection: IChoreoCollection = {};
  const collector = (song: AudioTripSong, songFilename: string, stats: fs.Stats) => {
    const extractedMeta = {};

    fields.forEach(f => {
      extractedMeta[f.key] = f.field.getValue(song);
    });

    fields.forEach(f => {
      let hash = collection[f.key];
      if (null == hash) {
        hash = collection[f.key] = {};
      }
      const value = f.field.getValue(song);
      let list = hash[value];
      if (null == list) {
        list = hash[value] = [];
      }

      const songBPM = (song.metadata.avgBPM == BPM_NAN_BPM) 
                    ? avg(song.metadata.tempoSections.map(s => s.beatsPerMinute))
                    : song.metadata.avgBPM;

      song.choreographies.list.forEach(choreo => {
        const choreoMeta = choreo.data.events.reduce(choreoMetaCollector, emptyChoreoMetadata());
        list.push(
          {
            songID: song.metadata.songID, 
            songName:  song.metadata.title,
            songArtist: song.metadata.artist,
            songLength: song.metadata.songFullLengthInSeconds ?? song.metadata.songEndTimeInSeconds,
            songFilename,
            songModificationTimestamp: stats.mtimeMs,
            choreoId: choreo.header.id,
            choreoAuthor: song.metadata.authorID.displayName,
            choreoName: choreo.header.name,
            choreoGemSpeed: choreo.header.gemSpeed,
            choreoEventCount: choreo.data.events.length,
            choreoEventStart: choreo.data.events[0]?.time?.beat ?? -1,
            choreoMeta,
            songBPM,
            extractedMeta: { ...extractedMeta }
          }
        );
      });
    })
  };

  const collectorGuarded = (song: AudioTripSong, songFilename: string, stats: fs.Stats) => {
    try {
      return collector(song, songFilename, stats);
    } catch (ex) {
      console.warn (`caught ${ex} when parsing ${songFilename} (${song?.metadata?.title ?? '??'} / ${song?.metadata?.artist ?? '??'})`)
    }
  }

  return [collection, collectorGuarded];
}

interface IChoreoMetadata {
  xMin?: number,
  xMax?: number,
  yMin?: number,
  yMax?: number,
  numBarriers: number,
  numGemsLeft: number,
  numGemsRight: number,
  numDirGemsLeft: number,
  numDirGemsRight: number,
  numDrumsLeft: number,
  numDrumsRight: number,
  numRibbonsLeft: number,
  numRibbonsRight: number,
}

function min(a,b) {
  if (a == undefined || isNaN(a)) {
    return b;
  }
  if (b == undefined || isNaN(b)) {
    return a;
  }
  if (a < b) return a;

  return b;
}

function max(a,b) {
  if (a == undefined || isNaN(a)) {
    return b;
  }
  if (b == undefined || isNaN(b)) {
    return a;
  }
  if (a > b) return a;

  return b;
}

function inc(x: IChoreoMetadata, p: keyof IChoreoMetadata) {
  x[p] = 1 + (x[p] ?? 0);
}

function emptyChoreoMetadata() {
  let result: IChoreoMetadata = {
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

function choreoMetaCollector(r: IChoreoMetadata, x: IChoreoEvent): IChoreoMetadata {
  let result = { 
    ...r
  };

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

  const keys: (keyof IChoreoMetadata)[] = [
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
