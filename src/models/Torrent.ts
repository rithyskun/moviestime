import mongoose, { Schema, Document } from 'mongoose';

export interface ITorrent extends Document {
  name: string;
  hash: string;
  magnetLink: string;
  seeders: number;
  leechers: number;
  size: string;
  uploadedDate: Date;
  category: string;
  url: string;
  source: string;
}

const TorrentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    magnetLink: {
      type: String,
      required: true,
    },
    seeders: {
      type: Number,
      default: 0,
    },
    leechers: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      required: true,
    },
    uploadedDate: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      default: 'Movies',
    },
    url: {
      type: String,
    },
    source: {
      type: String,
      default: 'Manual',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Torrent || mongoose.model<ITorrent>('Torrent', TorrentSchema);
