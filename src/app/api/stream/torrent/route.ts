import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Stream torrent endpoint
 * Uses external torrent streaming services to get playable video streams
 */

// Cache for streaming URLs to avoid repeated API calls
const streamCache = new Map<string, { url: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { magnetLink, hash } = await request.json();

    if (!magnetLink && !hash) {
      return NextResponse.json(
        { success: false, error: 'Magnet link or hash required' },
        { status: 400 }
      );
    }

    // Extract hash if not provided
    let torrentHash = hash;
    if (!torrentHash && magnetLink) {
      const hashMatch = magnetLink.match(/xt=urn:btih:([a-f0-9]+)/i);
      if (hashMatch) {
        torrentHash = hashMatch[1].toLowerCase();
      }
    }

    if (!torrentHash) {
      return NextResponse.json(
        { success: false, error: 'Could not extract torrent hash' },
        { status: 400 }
      );
    }

    // Check cache
    const cached = streamCache.get(torrentHash);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json({
        success: true,
        data: { streamUrl: cached.url, source: 'cache' },
      });
    }

    // Try BingeAPI - popular torrent streaming service
    try {
      const bingeUrl = `https://binge.api.strem.fun/stream/${torrentHash}.json`;
      const bingeResponse = await axios.get(bingeUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (bingeResponse.data?.streams && bingeResponse.data.streams.length > 0) {
        const streamUrl = bingeResponse.data.streams[0].url;

        // Cache for 1 hour
        streamCache.set(torrentHash, {
          url: streamUrl,
          expires: Date.now() + 3600000,
        });

        return NextResponse.json({
          success: true,
          data: { streamUrl, source: 'bingeapi' },
        });
      }
    } catch {
      console.log('BingeAPI failed, trying alternatives...');
    }

    // Fallback: Use Torrentio
    try {
      const torrentioUrl = `https://torrentio.strem.fun/stream/${torrentHash}.json`;
      const torrentioResponse = await axios.get(torrentioUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (
        torrentioResponse.data?.streams &&
        torrentioResponse.data.streams.length > 0
      ) {
        const streamUrl = torrentioResponse.data.streams[0].url;

        // Cache for 1 hour
        streamCache.set(torrentHash, {
          url: streamUrl,
          expires: Date.now() + 3600000,
        });

        return NextResponse.json({
          success: true,
          data: { streamUrl, source: 'torrentio' },
        });
      }
    } catch {
      console.log('Torrentio failed');
    }

    // Generate a local streaming URL as fallback
    // This tells the client to use a local proxy
    const localStreamUrl = `/api/stream/proxy?hash=${torrentHash}`;
    return NextResponse.json({
      success: true,
      data: {
        streamUrl: localStreamUrl,
        source: 'local-proxy',
        message: 'Using local torrent streaming - may take a moment to start',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get stream';
    console.error('Stream error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const magnetLink = searchParams.get('magnet');
  const hash = searchParams.get('hash');

  return await POST(
    new NextRequest('', {
      method: 'POST',
      body: JSON.stringify({ magnetLink, hash }),
    })
  );
}
