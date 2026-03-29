import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// This endpoint validates magnet links and fetches metadata without WebTorrent
export async function POST(request: NextRequest) {
  try {
    const { magnetLink } = await request.json();

    if (!magnetLink) {
      return NextResponse.json(
        { success: false, error: 'Magnet link is required' },
        { status: 400 }
      );
    }

    // Extract hash from magnet link
    const hashMatch = magnetLink.match(/xt=urn:btih:([a-f0-9]+)/i);
    if (!hashMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid magnet link format' },
        { status: 400 }
      );
    }

    const infoHash = hashMatch[1].toLowerCase();
    
    // Extract name from magnet link if available
    const dnMatch = magnetLink.match(/dn=([^&]+)/i);
    const name = dnMatch ? decodeURIComponent(dnMatch[1]).replace(/\+/g, ' ') : 'Unknown Torrent';

    // Try to get metadata from torrent metadata service
    try {
      const metadataResponse = await axios.get(
        `https://torrentio.strem.fun/meta/${infoHash}.json`,
        { timeout: 5000 }
      );

      const metadata = metadataResponse.data;
      
      return NextResponse.json({
        success: true,
        data: {
          magnetLink,
          infoHash,
          name: metadata?.name || name,
          files: metadata?.files || [],
          progress: 0,
          downloaded: 0,
          uploaded: 0,
        },
      });
    } catch (metadataError) {
      // If metadata fetch fails, return basic info from magnet link
      return NextResponse.json({
        success: true,
        data: {
          magnetLink,
          infoHash,
          name,
          files: [],
          progress: 0,
          downloaded: 0,
          uploaded: 0,
          message: 'Metadata not available - use your torrent client for full details',
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process magnet link' },
      { status: 500 }
    );
  }
}
