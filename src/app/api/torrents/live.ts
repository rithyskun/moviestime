import { NextRequest, NextResponse } from 'next/server';
import { searchAllTorrentSources } from '@/lib/torrentSources';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const sources = searchParams.get('sources')?.split(',');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter required' },
        { status: 400 }
      );
    }

    // Server-side search avoids CORS issues
    const torrents = await searchAllTorrentSources(query, sources);

    return NextResponse.json({
      success: true,
      data: torrents,
      count: torrents.length,
    });
  } catch (error: any) {
    console.error('Live search error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
