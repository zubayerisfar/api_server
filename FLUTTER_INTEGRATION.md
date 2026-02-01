# How to Update Flutter App to Use This API

## Step 1: Update api_config.dart

Replace your Flutter app's `lib/utils/api_config.dart` with:

```dart
class ApiConfig {
  // When using local Node.js API
  static const String baseUrl = 'http://192.168.0.110:5000';  // Change IP if needed

  // When deployed online (replace with your actual domain)
  // static const String baseUrl = 'https://your-api-domain.com';

  // Prayer Times (still uses Aladhan directly)
  static const String aladhanApiBase = 'https://api.aladhan.com/v1';

  // API Endpoints
  static const String apiPrayerTimes = '/api/prayer-times';
  static const String apiQuran = '/api/quran';
  static const String apiQuranSurahs = '/api/quran/surahs';
  static const String apiHadithBooks = '/api/hadith/books';
  static const String apiHadith = '/api/hadith';

  // Download endpoints
  static const String downloadQuran = '/api/download/quran';
  static const String downloadHadith = '/api/download/hadith';
}
```

## Step 2: Update Download Service

Update `lib/services/download_service.dart` to use the new endpoints:

```dart
Future<bool> _downloadQuran() async {
  try {
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.downloadQuran}');
    print('Downloading Quran from: $url');

    final response = await http.get(url).timeout(
      const Duration(minutes: 5),
      onTimeout: () {
        throw Exception('Download timeout');
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);

      if (data['success'] == true) {
        // Insert surahs
        final surahs = List<Map<String, dynamic>>.from(data['surahs']);
        await _db.insertSurahs(surahs);

        // Insert verses in batches
        final verses = List<Map<String, dynamic>>.from(data['verses']);
        const batchSize = 500;

        for (var i = 0; i < verses.length; i += batchSize) {
          final end = (i + batchSize < verses.length) ? i + batchSize : verses.length;
          final batch = verses.sublist(i, end);
          await _db.insertQuranVerses(batch);
        }

        return true;
      }
    }
    return false;
  } catch (e) {
    print('Error downloading Quran: $e');
    return false;
  }
}

Future<bool> _downloadHadith() async {
  try {
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.downloadHadith}');
    final response = await http.get(url).timeout(
      const Duration(minutes: 5),
      onTimeout: () {
        throw Exception('Download timeout');
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);

      if (data['success'] == true) {
        // Insert books
        final books = List<String>.from(data['books']);
        await _db.insertHadithBooks(books);

        // Insert hadiths in batches
        final hadiths = List<Map<String, dynamic>>.from(data['hadiths']);
        const batchSize = 500;

        for (var i = 0; i < hadiths.length; i += batchSize) {
          final end = (i + batchSize < hadiths.length) ? i + batchSize : hadiths.length;
          final batch = hadiths.sublist(i, end);
          await _db.insertHadiths(batch);
        }

        return true;
      }
    }
    return false;
  } catch (e) {
    print('Error downloading Hadith: $e');
    return false;
  }
}
```

## Step 3: Update API Service (Optional)

For news/blog, update `lib/services/api_service.dart`:

```dart
static Future<ApiResponse<NewsPost>?> getNews() async {
  try {
    // Update this URL to your Flask server if still using it
    // Or if you want to serve news from Node.js too, add that endpoint
    final url = Uri.parse('${ApiConfig.baseUrl}/api/news');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['success'] == true) {
        return ApiResponse(
          success: true,
          items: (data['items'] as List)
              .map((item) => NewsPost.fromJson(item))
              .toList(),
          page: data['page'] ?? 1,
          totalPages: data['total_pages'] ?? 1,
        );
      }
    }
  } catch (e) {
    print('Error fetching news: $e');
  }
  return null;
}
```

## Step 4: Network Configuration

### For Local Network (Home WiFi)

1. Get your computer's IP: Open CMD and run `ipconfig`
2. Look for "IPv4 Address" (e.g., 192.168.0.110)
3. Update `api_config.dart` with your IP
4. Make sure your phone is on the SAME WiFi network

### For Online Deployment

1. Deploy Node.js API (see deployment options in README.md)
2. Update `baseUrl` in `api_config.dart` to your domain
3. Example: `https://your-api.vercel.app` or `https://your-api.railway.app`

## Step 5: Test the API

Before updating the Flutter app, test the API:

1. Start the Node.js server:

   ```bash
   npm start
   # Or double-click START.bat
   ```

2. Open browser and visit: `http://localhost:5000`

3. Test endpoints:
   - `http://localhost:5000/api/quran/surahs` - Should see all surahs
   - `http://localhost:5000/api/hadith/books` - Should see hadith books
   - `http://localhost:5000/health` - Should return OK

4. Test from phone (same WiFi):
   - Replace `localhost` with your computer IP
   - Example: `http://192.168.0.110:5000/api/quran/surahs`

## Troubleshooting

### Phone can't connect to API

1. Check both devices are on same WiFi
2. Check Windows Firewall allows port 5000
3. Verify IP address is correct
4. Run: `ipconfig` on Windows to confirm IP
5. On phone, try opening: `http://[YOUR_IP]:5000` in browser

### Node.js server won't start

1. Check Node.js is installed: `node --version`
2. Check npm packages: `npm install`
3. Check port 5000 is free: `netstat -ano | findstr :5000`
4. If port is used, change PORT in `.env`

### Data not showing

1. Make sure CSV files are in `api_server/data/` folder
2. Check file names match exactly (case-sensitive)
3. Check CSV files aren't corrupted

## Next Steps

1. Start the Node.js API server
2. Update Flutter app configuration
3. Test downloads
4. Deploy to online server when ready

---

**API Location:** `c:\Users\LENOVO\Desktop\Hadith_and_Quran\api_server`
**Start Command:** Double-click `START.bat` or run `npm start`
