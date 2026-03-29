import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to handle magnet links
 * GET /api/magnet?link=magnet:?xt=urn:btih:...
 * 
 * Extracts hash and name from magnet link and returns the data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const magnetLink = searchParams.get('link');

    if (!magnetLink) {
      return NextResponse.json(
        { success: false, error: 'Magnet link required' },
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
    const name = dnMatch
      ? decodeURIComponent(dnMatch[1]).replace(/\+/g, ' ').replace(/%0A/g, ' ')
      : 'Unknown Torrent';

    return NextResponse.json({
      success: true,
      data: {
        magnetLink,
        hash: infoHash,
        name: name.trim(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse magnet link' },
      { status: 500 }
    );
  }
}
