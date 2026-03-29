import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Stream proxy endpoint
 * Proxies through to real torrent streaming services
 */

const STREAMING_SERVICES = [
  // VidStream API
  {
    name: 'vidstream',
    getUrl: (hash: string) =>
      `https://api.vidstream.to/stream/${hash}.json`,
  },
  // KaleideoscapeAPI
  {
    name: 'kaleidoscope',
    getUrl: (hash: string) =>
      `https://kaleidoscope-api.strem.fun/stream/${hash}.json`,
  },
  // ElChamsApi
  {
    name: 'elchams',
    getUrl: (hash: string) =>
      `https://chico.alldebrid.com:7777/stream/${hash}.json`,
  },
  // TorrentShare API
  {
    name: 'torrentshare',
    getUrl: (hash: string) =>
      `https://torrentshare.deno.dev/stream/${hash}.json`,
  },
];

async function getMagnetStream(
  hash: string
): Promise<{ url: string; service: string } | null> {
  for (const service of STREAMING_SERVICES) {
    try {
      const url = service.getUrl(hash);
      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.data?.streams && response.data.streams.length > 0) {
        const streamUrl = response.data.streams[0].url;
        if (streamUrl) {
          console.log(`✓ Got stream from ${service.name}`);
          return { url: streamUrl, service: service.name };
        }
      }
    } catch {
      console.log(`✗ ${service.name} failed`);
      continue;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { success: false, error: 'Hash parameter required' },
        { status: 400 }
      );
    }

    // Try to get a working stream
    const result = await getMagnetStream(hash);

    if (result) {
      // If it's a direct magnet link, we need to handle CORS
      // For now, return the URL and let the client fetch it
      return NextResponse.json({
        success: true,
        data: {
          url: result.url,
          service: result.service,
          message: `Streaming from ${result.service}`,
        },
      });
    }

    // If no service worked, return error
    return NextResponse.json(
      {
        success: false,
        error:
          'No streaming sources available for this torrent. Try downloading instead.',
      },
      { status: 503 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proxy error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
