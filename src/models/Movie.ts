import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string[];
  releaseDate: Date;
  rating: number;
  posterUrl: string;
  torrentHash?: string;
  duration: number;
}

const MovieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    genre: [
      {
        type: String,
      },
    ],
    releaseDate: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    posterUrl: {
      type: String,
    },
    torrentHash: {
      type: String,
      ref: 'Torrent',
    },
    duration: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
