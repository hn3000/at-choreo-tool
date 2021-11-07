
export interface ILastFMTags {
  toptags: {
    tag: {count: number; name: string; url: string; }[];
    "@attr": {
      artist: string;
      track: string;
    }
  }
}