declare module 'webtorrent' {
  export interface Instance {
    add(magnetLink: string, callback: (torrent: Torrent) => void): void;
  }

  export interface Torrent {
    infoHash: string;
    name: string;
    files: TorrentFile[];
    progress: number;
    downloaded: number;
    uploaded: number;
  }

  export interface TorrentFile {
    name: string;
    length: number;
  }

  export default class WebTorrent {
    constructor();
    add(magnetLink: string, callback: (torrent: Torrent) => void): void;
  }
}
