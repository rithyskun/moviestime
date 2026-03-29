import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Torrent from '@/models/Torrent';
import { searchAllTorrentSources } from '@/lib/torrentSources';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    let query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const fromCache = searchParams.get('cache') !== 'false'; // Default to cache
    const sources = searchParams.get('sources')?.split(',');

    const skip = (page - 1) * limit;

    // Extract hash from magnet link if query is a magnet link
    let searchQuery = query;
    if (query.startsWith('magnet:')) {
      const hashMatch = query.match(/xt=urn:btih:([a-f0-9]+)/i);
      if (hashMatch) {
        searchQuery = hashMatch[1];
      }
    }

    // Try local database first if cache is enabled
    if (fromCache && searchQuery && !query.startsWith('magnet:')) {
      const searchFilter = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { hash: { $regex: searchQuery, $options: 'i' } },
        ],
      };

      const cachedTorrents = await Torrent.find(searchFilter)
        .sort({ seeders: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Torrent.countDocuments(searchFilter);

      if (cachedTorrents.length > 0) {
        return NextResponse.json({
          success: true,
          data: cachedTorrents,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          source: 'cached',
        });
      }
    }

    // If no cached results or cache disabled, search from multiple sources
    const freshTorrents = await searchAllTorrentSources(
      query || searchQuery,
      sources
    );

    // Paginate fresh results
    const paginatedTorrents = freshTorrents.slice(
      skip,
      skip + limit
    );

    return NextResponse.json({
      success: true,
      data: paginatedTorrents,
      pagination: {
        page,
        limit,
        total: freshTorrents.length,
        pages: Math.ceil(freshTorrents.length / limit),
      },
      source: 'live',
      sources_searched: sources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
