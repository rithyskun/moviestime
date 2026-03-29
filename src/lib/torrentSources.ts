import axios from 'axios';

export interface TorrentResult {
  name: string;
  hash: string;
  magnetLink: string;
  seeders: number;
  leechers: number;
  size: string;
  category: string;
  source: string;
  url?: string;
}

// Simplified search using Torrentz2 API (more reliable)
async function searchTorrentz2(query: string): Promise<TorrentResult[]> {
  try {
    // Using torrentz2 which has better stability
    const response = await axios.get('https://torrentz2eg.com/api/search', {
      params: { q: query },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const results = response.data?.results?.slice(0, 20).map((torrent: any) => {
      const hash = (torrent.magnet?.match(/xt=urn:btih:([a-f0-9]+)/i)?.[1] || torrent.hash)?.toLowerCase();
      if (!isValidHash(hash)) return null;
      return {
        name: torrent.name,
        hash: hash,
        magnetLink: torrent.magnet || `magnet:?xt=urn:btih:${hash}`,
        seeders: parseInt(torrent.seeders || '100'),
        leechers: parseInt(torrent.leechers || '50'),
        size: torrent.size || 'Unknown',
        category: 'Movies',
        source: 'Torrentz2',
        url: `https://torrentz2eg.com/search?f=${encodeURIComponent(query)}`,
      };
    }).filter(Boolean) || [];
    return results;
  } catch (error) {
    console.warn('Torrentz2 search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

// RARBG - using official public API
async function searchRarbg(query: string): Promise<TorrentResult[]> {
  try {
    // RARBG official public API endpoint
    const response = await axios.get('https://torrentapi.org/pubapi_v2.php', {
      params: {
        mode: 'search',
        search_string: query,
        sort: 'seeders',
        limit: 25,
        format: 'json_extended',
        app_id: 'moviestime_app',
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // RARBG API may return array of torrents or error messages
    if (!Array.isArray(response.data) || response.data[0]?.error) {
      return [];
    }

    const results = response.data.slice(0, 25).map((torrent: any) => {
      const hash = torrent.info_hash?.toLowerCase();
      if (!isValidHash(hash)) return null;
      return {
        name: torrent.title || torrent.name,
        hash: hash,
        magnetLink: `magnet:?xt=urn:btih:${hash}`,
        seeders: parseInt(torrent.seeders || 0),
        leechers: parseInt(torrent.leechers || 0),
        size: torrent.size ? formatBytes(parseInt(torrent.size)) : 'Unknown',
        category: torrent.category || 'Movies',
        source: 'RARBG',
        url: torrent.download,
      };
    }).filter(Boolean);
    return results;
  } catch (error) {
    console.warn('RARBG search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

// LIMETORRENTS API
async function searchLimeTorrents(query: string): Promise<TorrentResult[]> {
  try {
    const response = await axios.get('https://www.limetorrents.lol/api/', {
      params: { search: query },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const results = response.data?.results?.slice(0, 20).map((torrent: any) => {
      const hash = torrent.magnet?.match(/xt=urn:btih:([a-f0-9]+)/i)?.[1]?.toLowerCase();
      if (!isValidHash(hash)) return null;
      return {
        name: torrent.title,
        hash: hash,
        magnetLink: torrent.magnet,
        seeders: parseInt(torrent.seeders || 0),
        leechers: parseInt(torrent.leechers || 0),
        size: torrent.size || 'Unknown',
        category: 'Movies',
        source: 'LimeTorrents',
      };
    }).filter(Boolean) || [];
    return results;
  } catch (error) {
    console.warn('LimeTorrents search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

// The Pirate Bay API - via public proxy/mirror
async function searchThePirateBay(query: string): Promise<TorrentResult[]> {
  try {
    const response = await axios.get('https://apibay.org/q.php', {
      params: {
        q: query,
        cat: 'all',
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Filter out empty/error responses
    const torrents = Array.isArray(response.data) 
      ? response.data.filter((t: any) => t.id && t.name) 
      : [];

    const results = torrents.slice(0, 25).map((torrent: any) => {
      const hash = torrent.info_hash?.toLowerCase?.();
      if (!isValidHash(hash)) return null;
      return {
        name: torrent.name,
        hash: hash,
        magnetLink: `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(torrent.name)}`,
        seeders: parseInt(torrent.seeders || 0),
        leechers: parseInt(torrent.leechers || 0),
        size: torrent.size_bytes ? formatBytes(parseInt(torrent.size_bytes)) : 'Unknown',
        category: 'Movies',
        source: 'The Pirate Bay',
        url: `https://thepiratebay.org/description/${torrent.id}`,
      };
    }).filter(Boolean);
    return results;
  } catch (error) {
    console.warn('The Pirate Bay search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

// 1337x - using torrent metasearch
async function search1337x(query: string): Promise<TorrentResult[]> {
  try {
    // Use Torrentz2 which indexes results from multiple sources including 1337x
    const response = await axios.get('https://torrentz2.is/api.json', {
      params: {
        q: query,
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const results = response.data?.results?.slice(0, 25).map((torrent: any) => {
      const hash = torrent.hash?.toLowerCase?.();
      if (!isValidHash(hash)) return null;
      return {
        name: torrent.name || torrent.title,
        hash: hash,
        magnetLink: `magnet:?xt=urn:btih:${hash}`,
        seeders: parseInt(torrent.seeders || 100),
        leechers: parseInt(torrent.leechers || 50),
        size: torrent.size || 'Unknown',
        category: 'Movies',
        source: '1337x',
        url: torrent.url,
      };
    }).filter(Boolean) || [];
    return results;
  } catch (error) {
    console.warn('1337x search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Kickass Torrents - via metasearch
async function searchKickass(query: string): Promise<TorrentResult[]> {
  try {
    // Use Torrentz2 which aggregates results including Kickass mirrors
    const response = await axios.get('https://torrentz2.is/api.json', {
      params: {
        q: query,
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const results = response.data?.results?.slice(0, 25).map((torrent: any) => {
      const hash = torrent.hash?.toLowerCase?.();
      if (!isValidHash(hash)) return null;
      return {
        name: torrent.name || torrent.title,
        hash: hash,
        magnetLink: `magnet:?xt=urn:btih:${hash}`,
        seeders: parseInt(torrent.seeders || 100),
        leechers: parseInt(torrent.leechers || 50),
        size: torrent.size || 'Unknown',
        category: 'Movies',
        source: 'Kickass',
        url: torrent.url,
      };
    }).filter(Boolean) || [];
    return results;
  } catch (error) {
    console.warn('Kickass search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Main search function that queries all sources
export async function searchAllTorrentSources(
  query: string,
  sources?: string[]
): Promise<TorrentResult[]> {
  const activeSources = sources || [
    'thepiratebay',
    '1337x',
    'kickass',
    'rarbg',
  ];

  const searches = [];

  if (activeSources.includes('thepiratebay')) {
    searches.push(searchThePirateBay(query));
  }
  if (activeSources.includes('1337x')) {
    searches.push(search1337x(query));
  }
  if (activeSources.includes('kickass')) {
    searches.push(searchKickass(query));
  }
  if (activeSources.includes('rarbg')) {
    searches.push(searchRarbg(query));
  }

  const results = await Promise.allSettled(searches);
  const allTorrents: TorrentResult[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allTorrents.push(...result.value);
    }
  });

  // Deduplicate by hash and sort by seeders
  const uniqueTorrents = Array.from(
    new Map(allTorrents.map((t) => [t.hash.toLowerCase(), t])).values()
  ).sort((a, b) => b.seeders - a.seeders);

  return uniqueTorrents.slice(0, 100); // Return top 100 results
}

// Helper functions
function isValidHash(hash: string | undefined): boolean {
  if (!hash || typeof hash !== 'string') return false;
  // Valid hash should be exactly 40 hex characters
  return /^[a-f0-9]{40}$/i.test(hash.trim());
}

function formatBytes(bytes: number): string {
  if (!bytes) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function parseSizeFromTitle(title: string): string {
  const match = title.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB|KB)/i);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return 'Unknown';
}
