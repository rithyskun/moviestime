import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Torrent from '@/models/Torrent';

interface TorrentInput {
  name: string;
  hash: string;
  magnetLink: string;
  seeders: number;
  leechers: number;
  size: string;
  category: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body: TorrentInput = await request.json();

    // Check if torrent already exists
    const existing = await Torrent.findOne({ hash: body.hash });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Torrent already exists' },
        { status: 409 }
      );
    }

    const torrent = await Torrent.create(body);

    return NextResponse.json(
      { success: true, data: torrent },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
