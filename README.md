# AfriSight Backend

A powerful AI-driven music analytics and prediction system built with Bun, Hono, and Google's Gemini AI. This backend analyzes music data from Spotify and YouTube to provide intelligent insights, trend predictions, and market analysis for the African music industry.

## 🚀 Quick Start

### Prerequisites
- Bun runtime
- Google AI API Key (Gemini)

### Installation
```sh
bun install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
GOOGLEAI_API_KEY=your_gemini_api_key_here
```

### Running the Server
```sh
bun run dev
```

The server will start at `http://localhost:3000`

## 📊 Data Sources

The system analyzes three main datasets:
- **Concert Data** (`dataconcers2011-.json`) - Concert programs and performances
- **Spotify Afro Tracks** (`spotifyafro.json`) - African music tracks with audio features
- **Spotify YouTube Dataset** (`spotifyyoutubedataset.json`) - Combined Spotify and YouTube metrics

## 🛠 API Endpoints

### 🏠 Health Check
- **GET** `/` - Basic health check endpoint

### 🔮 AI Prediction Endpoints

#### Comprehensive Trend Analysis
- **POST** `/predict/trends`
  
  Generates AI-powered analysis of music trends, emerging artists, and market predictions.

  **Request Body:**
  ```json
  {
    "limit": 100,
    "includeRawResponse": false
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "message": "AI trend analysis completed using top 100 performing tracks",
    "predictions": {
      "topGenres": ["Afrobeats", "Amapiano", "Afro-pop"],
      "emergingArtists": ["Artist 1", "Artist 2"],
      "popularEvents": ["Festival types", "Concert formats"],
      "concertTrends": ["Market trends", "Consumer preferences"],
      "marketingSuggestions": ["Strategy 1", "Strategy 2"],
      "collaborationIdeas": ["Collaboration 1", "Collaboration 2"],
      "venueRecommendations": ["Venue type 1", "Venue type 2"]
    },
    "dataAnalyzed": {
      "tracksAnalyzed": 200,
      "afroTracks": 100,
      "youtubeTracks": 100,
      "totalViews": "1,234,567,890",
      "totalStreams": "987,654,321"
    },
    "generatedAt": "2025-09-12T10:30:00.000Z"
  }
  ```

#### Artist-Specific Insights
- **POST** `/predict/artist`
  
  Provides deep analysis and predictions for a specific artist.

  **Request Body:**
  ```json
  {
    "artist": "Burna Boy"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "artist": "Burna Boy",
    "insights": "AI-generated artist analysis...",
    "metrics": {
      "spotifyTracks": 15,
      "youtubeTracks": 8,
      "averagePopularity": 75.5,
      "totalYouTubeViews": "500,000,000",
      "totalYouTubeLikes": "25,000,000",
      "engagementRate": 5.0
    },
    "topTracks": {
      "spotify": [...],
      "youtube": [...]
    }
  }
  ```

#### Genre Trend Analysis
- **POST** `/predict/genre-trends`
  
  Analyzes trends based on audio features and musical characteristics.

  **Request Body:**
  ```json
  {
    "minEnergy": 0.5,
    "maxEnergy": 1.0,
    "minDanceability": 0.6,
    "maxDanceability": 1.0,
    "minTempo": 100,
    "maxTempo": 140,
    "limit": 50
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "message": "Genre trend analysis completed for 45 tracks",
    "audioFeatureProfile": {
      "averageEnergy": 0.725,
      "averageDanceability": 0.823,
      "averageTempo": 118.5,
      "averagePopularity": 68.2
    },
    "insights": "AI-generated genre analysis...",
    "statistics": {
      "tracksAnalyzed": 45,
      "uniqueArtists": 32,
      "energyLevel": "High",
      "danceabilityLevel": "High",
      "tempoCategory": "Medium"
    }
  }
  ```

#### Quick Statistics
- **GET** `/predict/quick-stats`
  
  Provides overview of available data and system readiness.

  **Response:**
  ```json
  {
    "success": true,
    "overview": {
      "totalDataPoints": 622544,
      "concertPrograms": 3956,
      "spotifyAfroTracks": 1052,
      "spotifyYouTubeTracks": 617536
    },
    "topPerformers": {
      "totalViewsTop10": "12,345,678,901",
      "averagePopularityTop10": 82.5,
      "uniqueAfroArtistsTop10": 8,
      "uniqueYouTubeArtistsTop10": 9
    },
    "readyForPrediction": {
      "dataLoaded": true,
      "aiReady": true,
      "suggestedAnalysisLimit": 100
    }
  }
  ```

### 📈 Data Access Endpoints

#### Dataset Statistics
- **GET** `/api/data/stats`
  
  Returns overview statistics for all loaded datasets.

#### Top Performing Tracks
- **GET** `/api/data/top-afro/:limit?`
  
  Get top Spotify Afro tracks by popularity (default limit: 10).

- **GET** `/api/data/top-youtube/:limit?`
  
  Get top YouTube tracks by view count (default limit: 10).

### 🔍 Search Endpoints

#### Artist Search
- **GET** `/api/search/afro/:artist`
  
  Search for tracks by artist in the Spotify Afro dataset.

- **GET** `/api/search/youtube/:artist`
  
  Search for tracks by artist in the YouTube dataset.

### 🤖 Direct AI Interaction

#### Custom AI Prompts
- **POST** `/ai/prompt`
  
  Send custom prompts directly to the Gemini AI.

  **Request Body:**
  ```json
  {
    "prompt": "Analyze the current state of African music industry"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "prompt": "Analyze the current state of African music industry",
    "response": "AI-generated response..."
  }
  ```

## 🎵 Key Features

- **🤖 AI-Powered Analysis** - Leverages Google's Gemini AI for intelligent insights
- **📊 Multi-Source Data** - Combines Spotify, YouTube, and concert data
- **🔮 Predictive Analytics** - Forecasts trends, emerging artists, and market opportunities
- **🎯 Artist Intelligence** - Deep dive analysis for individual artists
- **🎶 Audio Feature Analysis** - Genre predictions based on musical characteristics
- **📈 Performance Metrics** - Views, streams, popularity, and engagement analytics
- **🌍 African Music Focus** - Specialized in African music market trends

## 🛡 Error Handling

All endpoints include comprehensive error handling with:
- Detailed error messages
- Appropriate HTTP status codes
- Suggestions for resolution
- Request validation

## 🧪 Example Usage

### 1. Get System Overview
```bash
curl http://localhost:3000/predict/quick-stats
```

### 2. Analyze Music Trends
```bash
curl -X POST http://localhost:3000/predict/trends \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "includeRawResponse": true}'
```

### 3. Artist Analysis
```bash
curl -X POST http://localhost:3000/predict/artist \
  -H "Content-Type: application/json" \
  -d '{"artist": "Wizkid"}'
```

### 4. Genre Trend Analysis
```bash
curl -X POST http://localhost:3000/predict/genre-trends \
  -H "Content-Type: application/json" \
  -d '{
    "minEnergy": 0.7,
    "minDanceability": 0.8,
    "minTempo": 110,
    "maxTempo": 130,
    "limit": 30
  }'
```

## 📝 Technology Stack

- **Runtime:** Bun
- **Framework:** Hono
- **AI:** Google Gemini AI
- **Language:** TypeScript
- **Data Format:** JSON

## 🚦 Development

### Project Structure
```
src/
├── index.ts              # Main application entry
├── routes/
│   └── predict.ts        # Prediction endpoints
├── lib/
│   ├── genai.ts         # Gemini AI integration
│   ├── loaddata.ts      # Data loading and management
│   └── aipredictiveanalysis.ts # AI analysis logic
└── data/
    ├── dataconcers2011-.json
    ├── spotifyafro.json
    └── spotifyyoutubedataset.json
```

### Adding New Endpoints
1. Define routes in appropriate files under `src/routes/`
2. Import and mount in `src/index.ts`
3. Update this README documentation

## 🔗 Links

- [Google AI Studio](https://aistudio.google.com/) - Get your Gemini API key
- [Hono Documentation](https://hono.dev/) - Web framework
- [Bun Documentation](https://bun.sh/) - JavaScript runtime

---

Built with ❤️ for the African music industry
