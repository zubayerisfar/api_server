# Islamic Content API - Node.js Server

A fast, lightweight Node.js API for serving Quran and Hadith data. Perfect for mobile apps and web applications.

## Quick Start

### 1. Install Dependencies

```bash
cd api_server
npm install
```

### 2. Start the Server

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Quran Endpoints

#### Get All Quran Data

```
GET /api/quran
```

Returns all surahs and verses

**Response:**

```json
{
  "success": true,
  "surahs": [
    {
      "surah_no": 1,
      "surah_name_en": "Al-Fatiha",
      "surah_name_ar": "الفاتحة",
      "surah_name_roman": "Al-Fatiha"
    }
  ],
  "verses": [
    {
      "id": "1-1",
      "surah_no": 1,
      "ayah_no": 1,
      "text_ar": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "text_en": "In the name of Allah, the Most Gracious, the Most Merciful"
    }
  ],
  "total_verses": 6236,
  "total_surahs": 114
}
```

#### Get Only Surahs List

```
GET /api/quran/surahs
```

#### Get Verses of Specific Surah

```
GET /api/quran/verses/:surahNo
```

Example: `/api/quran/verses/1` - Gets all verses from Surah Al-Fatiha

#### Download All Quran Data

```
GET /api/download/quran
```

### Hadith Endpoints

#### Get List of Hadith Books

```
GET /api/hadith/books
```

**Response:**

```json
{
  "success": true,
  "items": [
    "Sahih_Bukhari_Islamic_Foundation",
    "Sahih_Muslim_Islamic_Foundation",
    "Sunan_Abu_Dawud_Islamic_Foundation",
    "Sunan_an_Nasai_Islamic_Foundation",
    "Sunan_at_Tirmidhi_Islamic_Foundation",
    "Sunan_Ibn_Majah",
    "Musnad_Ahmad"
  ]
}
```

#### Get All Hadiths from a Book

```
GET /api/hadith/:book
```

Example: `/api/hadith/Sahih_Bukhari_Islamic_Foundation`

**Response:**

```json
{
  "success": true,
  "book": "Sahih_Bukhari_Islamic_Foundation",
  "hadiths": [
    {
      "id": "1",
      "hadith_no": "1",
      "source_book": "Sahih_Bukhari_Islamic_Foundation",
      "section_name": "Belief",
      "chapter_en": "Faith",
      "chapter_bn": "বিশ্বাস",
      "english_text": "...",
      "bangla_text": "...",
      "arabic_text": "...",
      "hadith_grade": "Sahih"
    }
  ],
  "total": 7563
}
```

#### Search Hadiths

```
GET /api/hadith/:book/search?q=search_term
```

Example: `/api/hadith/Sahih_Bukhari_Islamic_Foundation/search?q=prayer`

**Response:**

```json
{
  "success": true,
  "book": "Sahih_Bukhari_Islamic_Foundation",
  "query": "prayer",
  "results": [...],
  "total": 42
}
```

#### Download All Hadith Data

```
GET /api/download/hadith
```

Downloads all hadiths from all available books.

### Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "message": "Islamic Content API is running",
  "timestamp": "2026-02-01T19:05:55.000Z"
}
```

### API Documentation

```
GET /
```

Shows all available endpoints.

## Features

✅ Fast JSON API for Quran data
✅ Search functionality for Hadiths
✅ Multiple Hadith books support
✅ CORS enabled for cross-origin requests
✅ Compression enabled for faster response
✅ In-memory caching for better performance
✅ Error handling and validation
✅ Health check endpoint
✅ Easy to deploy

## Project Structure

```
api_server/
├── server.js           # Main server file
├── package.json        # Dependencies
├── data/               # CSV data files
│   ├── The Quran Dataset.csv
│   ├── Sahih_Bukhari_Islamic_Foundation.csv
│   ├── Sahih_Muslim_Islamic_Foundation.csv
│   ├── Sunan_Abu_Dawud_Islamic_Foundation.csv
│   ├── Sunan_an_Nasai_Islamic_Foundation.csv
│   ├── Sunan_at_Tirmidhi_Islamic_Foundation.csv
│   ├── Sunan_Ibn_Majah.csv
│   └── Musnad_Ahmad.csv
└── README.md           # This file
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```
PORT=5000
NODE_ENV=production
```

## Deploying Online

### Option 1: Heroku (Free)

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: node server.js
   ```
3. Deploy:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Option 2: Vercel

1. Install Vercel CLI
2. Deploy:
   ```bash
   vercel
   ```

### Option 3: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set start command: `npm start`
4. Deploy!

### Option 4: Your Own Server

1. Install Node.js on your server
2. Upload files via SSH/FTP
3. Run: `npm install && npm start`
4. Use PM2 to keep it running:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

## Testing the API

### Using cURL

```bash
# Get all Quran
curl http://localhost:5000/api/quran

# Get surahs only
curl http://localhost:5000/api/quran/surahs

# Get verses from Surah 1
curl http://localhost:5000/api/quran/verses/1

# Get hadith books
curl http://localhost:5000/api/hadith/books

# Get all hadiths from Sahih Bukhari
curl http://localhost:5000/api/hadith/Sahih_Bukhari_Islamic_Foundation

# Search hadiths
curl "http://localhost:5000/api/hadith/Sahih_Bukhari_Islamic_Foundation/search?q=prayer"

# Health check
curl http://localhost:5000/health
```

### Using Browser

Simply visit:

- `http://localhost:5000` - API documentation
- `http://localhost:5000/health` - Health check
- `http://localhost:5000/api/quran/surahs` - Get surahs

## Performance Tips

1. **Caching**: The API caches data in memory after first load
2. **Compression**: Responses are automatically compressed
3. **Filtering**: Use search endpoint to get only relevant data
4. **Batch Requests**: Load data once and cache on the app side

## Troubleshooting

### Port Already in Use

```bash
# Change port (Windows)
set PORT=3000 && npm start

# Or use different port (Linux/Mac)
PORT=3000 npm start
```

### CSV Files Not Found

Make sure all CSV files are in the `data/` folder

### CORS Issues

The API has CORS enabled. If you still have issues, the headers are set in server.js

### Memory Issues

For very large deployments, consider:

- Splitting data into smaller chunks
- Using a database instead of CSV
- Adding pagination

## Available Hadith Books

- Sahih Bukhari (Islamic Foundation)
- Sahih Muslim (Islamic Foundation)
- Sunan Abu Dawud (Islamic Foundation)
- Sunan An-Nasai (Islamic Foundation)
- Sunan At-Tirmidhi (Islamic Foundation)
- Sunan Ibn Majah
- Musnad Ahmad

## License

Free to use for Islamic educational purposes.

## Support

For issues or improvements, add them to the project.

---

**Version:** 1.0.0
**Last Updated:** February 1, 2026
