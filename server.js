const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');

// In-memory cache for data
let quranCache = null;
let hadithCache = {};

/**
 * Load Quran data from CSV
 */
async function loadQuranData() {
  if (quranCache) return quranCache;

  try {
    console.log('Loading Quran data...');
    const quranPath = path.join(DATA_DIR, 'The Quran Dataset.csv');
    
    const quranData = {
      surahs: {},
      verses: []
    };

    return new Promise((resolve, reject) => {
      fs.createReadStream(quranPath)
        .pipe(csv())
        .on('data', (row) => {
          // Parse Quran data
          const surahNo = parseInt(row.sura_number || row['Surah Number'] || 0);
          const ayahNo = parseInt(row.ayah_number || row['Ayah Number'] || 0);
          const textAr = row.ayah_ar || row.text || '';
          const textEn = row.ayah_en || row.Translation || '';
          const surahName = row.sura_name || row['Surah Name'] || '';
          const surahNameAr = row.sura_name_arabic || '';
          const surahNameRoman = row.sura_name_english || surahName || '';

          if (surahNo > 0 && ayahNo > 0) {
            // Store surah info
            if (!quranData.surahs[surahNo]) {
              quranData.surahs[surahNo] = {
                surah_no: surahNo,
                surah_name_en: surahNameRoman,
                surah_name_ar: surahNameAr,
                surah_name_roman: surahNameRoman
              };
            }

            // Store verse
            quranData.verses.push({
              id: `${surahNo}-${ayahNo}`,
              surah_no: surahNo,
              ayah_no: ayahNo,
              text_ar: textAr,
              text_en: textEn,
              text_bn: textEn // Bengali translation if available
            });
          }
        })
        .on('end', () => {
          quranCache = quranData;
          console.log(`✓ Loaded Quran: ${Object.keys(quranData.surahs).length} surahs, ${quranData.verses.length} verses`);
          resolve(quranData);
        })
        .on('error', (err) => {
          console.error('Error loading Quran:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.error('Error in loadQuranData:', err);
    throw err;
  }
}

/**
 * Load Hadith data from CSV
 */
async function loadHadithData(bookName) {
  if (hadithCache[bookName]) return hadithCache[bookName];

  try {
    const fileName = `${bookName}.csv`;
    const hadithPath = path.join(DATA_DIR, fileName);

    if (!await fs.pathExists(hadithPath)) {
      console.warn(`Hadith file not found: ${fileName}`);
      return { hadiths: [], books: [] };
    }

    console.log(`Loading Hadith data from ${bookName}...`);

    const hadithData = {
      hadiths: []
    };

    return new Promise((resolve, reject) => {
      fs.createReadStream(hadithPath)
        .pipe(csv())
        .on('data', (row) => {
          hadithData.hadiths.push({
            id: parseInt(row.hadith_id) || 0,
            hadith_no: row.hadith_no || row.hadith_number || '',
            source_book: bookName,
            section_name: row.section_name || '',
            chapter_en: row.chapter_en || '',
            chapter_bn: row.chapter_bn || '',
            chapter_ar: row.chapter_ar || '',
            english_text: row.english_text || '',
            bangla_text: row.bangla_text || '',
            arabic_text: row.arabic_text || '',
            english_narrator: row.narrator || '',
            bangla_narrator: row.narrator || '',
            hadith_grade: row.status || ''
          });
        })
        .on('end', () => {
          hadithCache[bookName] = hadithData;
          console.log(`✓ Loaded ${bookName}: ${hadithData.hadiths.length} hadiths`);
          resolve(hadithData);
        })
        .on('error', (err) => {
          console.error(`Error loading ${bookName}:`, err);
          reject(err);
        });
    });
  } catch (err) {
    console.error(`Error in loadHadithData for ${bookName}:`, err);
    throw err;
  }
}

// ============= ROUTES =============

/**
 * GET /api/quran
 * Get all Quran data (surahs + verses)
 */
app.get('/api/quran', async (req, res) => {
  try {
    const data = await loadQuranData();
    res.json({
      success: true,
      surahs: Object.values(data.surahs),
      verses: data.verses,
      total_verses: data.verses.length,
      total_surahs: Object.keys(data.surahs).length
    });
  } catch (err) {
    console.error('Error fetching Quran:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Quran data'
    });
  }
});

/**
 * GET /api/quran/surahs
 * Get only Surahs list
 */
app.get('/api/quran/surahs', async (req, res) => {
  try {
    const data = await loadQuranData();
    res.json({
      success: true,
      items: Object.values(data.surahs)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Surahs'
    });
  }
});

/**
 * GET /api/quran/verses/:surahNo
 * Get verses for a specific surah
 */
app.get('/api/quran/verses/:surahNo', async (req, res) => {
  try {
    const { surahNo } = req.params;
    const data = await loadQuranData();
    const verses = data.verses.filter(v => v.surah_no === parseInt(surahNo));
    
    res.json({
      success: true,
      surah_no: parseInt(surahNo),
      verses: verses,
      total_verses: verses.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verses'
    });
  }
});

/**
 * GET /api/hadith/books
 * Get list of available hadith books
 */
app.get('/api/hadith/books', (req, res) => {
  const books = [
    'Sahih_Bukhari_Islamic_Foundation',
    'Sahih_Muslim_Islamic_Foundation',
    'Sunan_Abu_Dawud_Islamic_Foundation',
    'Sunan_an_Nasai_Islamic_Foundation',
    'Sunan_at_Tirmidhi_Islamic_Foundation',
    'Sunan_Ibn_Majah',
    'Musnad_Ahmad'
  ];

  res.json({
    success: true,
    items: books
  });
});

/**
 * GET /api/hadith/:book
 * Get hadiths from a specific book
 */
app.get('/api/hadith/:book', async (req, res) => {
  try {
    const { book } = req.params;
    const data = await loadHadithData(book);
    
    res.json({
      success: true,
      book: book,
      hadiths: data.hadiths,
      total: data.hadiths.length
    });
  } catch (err) {
    console.error('Error fetching hadith:', err);
    res.status(500).json({
      success: false,
      error: `Failed to fetch hadiths from ${book}`
    });
  }
});

/**
 * GET /api/hadith/:book/search
 * Search hadiths
 */
app.get('/api/hadith/:book/search', async (req, res) => {
  try {
    const { book } = req.params;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required'
      });
    }

    const data = await loadHadithData(book);
    const searchLower = q.toLowerCase();
    
    const results = data.hadiths.filter(h =>
      (h.english_text && h.english_text.toLowerCase().includes(searchLower)) ||
      (h.bangla_text && h.bangla_text.toLowerCase().includes(searchLower)) ||
      (h.chapter_en && h.chapter_en.toLowerCase().includes(searchLower))
    );

    res.json({
      success: true,
      book: book,
      query: q,
      results: results,
      total: results.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to search hadiths'
    });
  }
});

/**
 * GET /api/download/quran
 * Download all Quran data as JSON
 */
app.get('/api/download/quran', async (req, res) => {
  try {
    const data = await loadQuranData();
    res.json({
      success: true,
      surahs: Object.values(data.surahs),
      verses: data.verses
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to download Quran'
    });
  }
});

/**
 * GET /api/download/hadith
 * Download all Hadith data as JSON
 */
app.get('/api/download/hadith', async (req, res) => {
  try {
    const books = [
      'Sahih_Bukhari_Islamic_Foundation',
      'Sahih_Muslim_Islamic_Foundation',
      'Sunan_Abu_Dawud_Islamic_Foundation',
      'Sunan_an_Nasai_Islamic_Foundation',
      'Sunan_at_Tirmidhi_Islamic_Foundation',
      'Sunan_Ibn_Majah',
      'Musnad_Ahmad'
    ];

    const allHadiths = [];
    const loadedBooks = [];

    for (const book of books) {
      try {
        const data = await loadHadithData(book);
        allHadiths.push(...data.hadiths);
        loadedBooks.push(book);
      } catch (err) {
        console.warn(`Could not load ${book}:`, err.message);
      }
    }

    res.json({
      success: true,
      books: loadedBooks,
      hadiths: allHadiths,
      total: allHadiths.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to download Hadith'
    });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Islamic Content API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Islamic Content API',
    version: '1.0.0',
    endpoints: {
      quran: {
        'GET /api/quran': 'Get all Quran data',
        'GET /api/quran/surahs': 'Get list of surahs',
        'GET /api/quran/verses/:surahNo': 'Get verses of a surah',
        'GET /api/download/quran': 'Download all Quran data'
      },
      hadith: {
        'GET /api/hadith/books': 'Get list of hadith books',
        'GET /api/hadith/:book': 'Get all hadiths from a book',
        'GET /api/hadith/:book/search?q=query': 'Search hadiths',
        'GET /api/download/hadith': 'Download all hadith data'
      },
      health: {
        'GET /health': 'Health check'
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Islamic Content API Started          ║
║   Server running on port ${PORT}        ║
║   http://localhost:${PORT}              ║
╚════════════════════════════════════════╝
  `);
});
