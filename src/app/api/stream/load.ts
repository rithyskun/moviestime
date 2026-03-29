import { NextRequest, NextResponse } from 'next/server';
import WebTorrent from 'webtorrent';

let client: any = null;

function getTorrentClient(): any {
  if (!client) {
    client = new WebTorrent();
  }
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const { magnetLink } = await request.json();

    if (!magnetLink) {
      return NextResponse.json(
        { success: false, error: 'Magnet link is required' },
        { status: 400 }
      );
    }

    const client = getTorrentClient();

    return new Promise((resolve) => {
      client.add(magnetLink, (torrent: any) => {
        const files = torrent.files.map((file: any) => ({
          name: file.name,
          length: file.length,
          index: torrent.files.indexOf(file),
        }));

        resolve(
          NextResponse.json({
            success: true,
            data: {
              magnetLink,
              infoHash: torrent.infoHash,
              name: torrent.name,
              files,
              progress: torrent.progress,
              downloaded: torrent.downloaded,
              uploaded: torrent.uploaded,
            },
          })
        );
      });

      // Timeout after 10 seconds if torrent metadata not received
      setTimeout(() => {
        resolve(
          NextResponse.json(
            { success: false, error: 'Timeout loading torrent metadata' },
            { status: 408 }
          )
        );
      }, 10000);
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
