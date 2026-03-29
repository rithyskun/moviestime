# MoviesTime - Torrent Streaming Platform

A modern web application for streaming movies and TV shows from torrent sources using Next.js and MongoDB. Built with WebTorrent for peer-to-peer streaming and Tailwind CSS for a sleek UI.

## Features

- 🎬 Stream movies and TV shows directly from torrents
- 🔍 Search and discover torrents and movies
- 📊 Torrent details (seeders, leechers, file size)
- 🎞️ Integrated torrent player with metadata
- 📱 Responsive dark-themed design
- 🗄️ MongoDB database for movie metadata
- ⚡ Fast and efficient torrent handling with WebTorrent
- 🔌 RESTful API endpoints for torrents and movies

## Tech Stack

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Torrent Handling**: WebTorrent
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- A torrent client (optional, for magnet links)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moviestime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup MongoDB**
   - **Local**: Install MongoDB Community Server
   - **Cloud**: Use MongoDB Atlas (create a cluster and get connection string)

4. **Configure environment variables**
   Create `.env.local` in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/moviestime
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/moviestime?retryWrites=true&w=majority
   
   TORRENT_API_URL=https://api.thepiratebay.org
   PUBLIC_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Searching for Torrents

1. Go to the home page
2. Click on the "Torrents" tab
3. Use the search bar to find movies or TV shows
4. Browse the results showing seeders, leechers, and file size

### Streaming a Torrent

1. Click on a torrent from the search results
2. Click "Load Torrent" to fetch metadata
3. Wait for torrent information to load
4. Select a video file to stream
5. Use the player controls to watch

### Managing Movies

1. Navigate to the "Movies" tab
2. Search for movies in the database
3. View detailed information about each movie
4. Click "Watch Now" to stream linked torrents

## API Endpoints

### Torrents

- **GET** `/api/torrents` - Search torrents
  - Query params: `q` (search query), `page`, `limit`
  
- **POST** `/api/torrents/add` - Add new torrent
  - Body: `{ name, hash, magnetLink, seeders, leechers, size, category }`

### Movies

- **GET** `/api/movies` - Search movies
  - Query params: `q` (search query), `page`, `limit`, `genre`
  
- **POST** `/api/movies` - Add new movie
  - Body: `{ title, description, genre[], rating, posterUrl, duration }`

- **GET** `/api/movies/[id]` - Get movie details

### Streaming

- **POST** `/api/stream/load` - Load torrent metadata
  - Body: `{ magnetLink }`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── torrents/        # Torrent API routes
│   │   ├── movies/          # Movie API routes
│   │   └── stream/          # Streaming routes
│   ├── movie/[id]/          # Movie detail page
│   ├── torrent/[id]/        # Torrent player page
│   ├── layout.tsx
│   ├── page.tsx             # Home page
│   └── globals.css
├── components/
│   ├── TorrentPlayer.tsx    # Main player component
│   ├── TorrentCard.tsx      # Torrent card UI
│   ├── MovieCard.tsx        # Movie card UI
│   └── SearchBar.tsx        # Search component
├── lib/
│   └── mongodb.ts           # MongoDB connection
├── models/
│   ├── Torrent.ts           # Torrent schema
│   └── Movie.ts             # Movie schema
└── package.json
```

## Known Torrent Sites (For Reference)

These are commonly used torrent sources:
- The Pirate Bay: https://thepiratebay.org
- 1337x: https://1337x.to
- Kickass Torrents: https://kickass.to
- RARBG: https://rarbg.to

**Note**: Ensure you have legal rights to stream content. Always respect copyright laws in your jurisdiction.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/moviestime` |
| `TORRENT_API_URL` | Torrent API endpoint | `https://api.thepiratebay.org` |
| `PUBLIC_URL` | Public application URL | `http://localhost:3000` |

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env.local`
- Verify network access if using MongoDB Atlas

### Torrent Loading Issues
- Check your internet connection
- Ensure the magnet link is valid
- WebTorrent may take time to fetch metadata
- Check browser console for detailed errors

### Port Already in Use
```bash
# Change port
npm run dev -- -p 3001
```

## Performance Tips

1. **Use MongoDB Atlas** for better reliability in production
2. **Enable caching** for frequently accessed movies
3. **Optimize images** for faster poster loading
4. **Use a CDN** for static assets
5. **Rate limit API** endpoints to prevent abuse

## Security Considerations

- ⚠️ This application streams content. Users are responsible for legal compliance
- Implement authentication for a production version
- Add input validation and sanitization
- Use HTTPS in production
- Implement rate limiting and DDoS protection
- Use environment variables for sensitive data

## Contributing

Feel free to submit issues and pull requests to improve the application.

## License

MIT License - See LICENSE file for details

## Disclaimer

This application is provided for educational purposes. Users are responsible for ensuring they have legal rights to stream content. The developers are not liable for any copyright infringement or misuse.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
