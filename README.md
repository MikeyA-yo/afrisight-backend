# AfriSight Backend

A powerful AI-driven music analytics and prediction system built with Bun, Hono, and Google's Gemini AI. This backend analyzes music data from Spotify and YouTube to provide intelligent insights, trend predictions, and market analysis for the African music industry.

## 🚀 Quick Start

### Prerequisites
- Bun runtime
- MongoDB database
- Google AI API Key (Gemini)

### Installation
```bash
bun install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
# Google AI Configuration
GOOGLEAI_API_KEY=your_gemini_api_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/afrisight

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here

# Server Configuration (optional)
PORT=3000
NODE_ENV=development
```

### Running the Server
```bash
# Development with hot reload
bun run dev

# Production
bun run start
```

The server will start at `http://localhost:3000`

## 📊 Data Sources

The system analyzes three main datasets:
- **Concert Data** (`dataconcers2011-.json`) - Concert programs and performances (3,956 programs)
- **Spotify Afro Tracks** (`spotifyafro.json`) - African music tracks with audio features (1,052 tracks)
- **Spotify YouTube Dataset** (`spotifyyoutubedataset.json`) - Combined Spotify and YouTube metrics (617,536 tracks)

## 🛡 Authentication

AfriSight uses JWT-based authentication. Most endpoints require authentication except for signup and login.

### 🔐 Authentication Endpoints

#### User Registration
- **POST** `/auth/signup`
  
  Register a new user account with creator profile.

  **Request Body:**
  ```json
  {
    "email": "musician@example.com",
    "password": "securepassword123",
    "name": "Jane Smith",
    "creatorType": "Musician"
  }
  ```

  **Valid Creator Types:**
  - `Content Creator`
  - `Musician` 
  - `Producer`
  - `Event Planner`
  - `Other`

  **Success Response (201):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzA5ZjU4ZTQyMzQ1Njc4OTAiLCJlbWFpbCI6Im11c2ljaWFuQGV4YW1wbGUuY29tIiwibmFtZSI6IkphbmUgU21pdGgiLCJjcmVhdG9yVHlwZSI6Ik11c2ljaWFuIn0.signature"
  }
  ```

  **Error Response (400):**
  ```json
  {
    "error": "Email already exists"
  }
  ```

  **Validation Error (400):**
  ```json
  {
    "error": "Invalid creatorType. Must be one of: Content Creator, Musician, Producer, Event Planner, Other"
  }
  ```

#### User Login
- **POST** `/auth/login`
  
  Authenticate user and receive JWT token.

  **Request Body:**
  ```json
  {
    "email": "musician@example.com",
    "password": "securepassword123"
  }
  ```

  **Success Response (200):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzA5ZjU4ZTQyMzQ1Njc4OTAiLCJlbWFpbCI6Im11c2ljaWFuQGV4YW1wbGUuY29tIiwibmFtZSI6IkphbmUgU21pdGgiLCJjcmVhdG9yVHlwZSI6Ik11c2ljaWFuIn0.signature"
  }
  ```

  **Error Response (401):**
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

### 🔑 Using JWT Tokens

Include the JWT token in the Authorization header for protected endpoints:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/predict/trends
```

**Public Endpoints (No Authentication Required):**
- `GET /`
- `POST /auth/signup`
- `POST /auth/login`

**Protected Endpoints (Authentication Required):**
- All `/predict/*` endpoints
- All `/explore/*` endpoints
- All `/api/*` endpoints

## 🛠 API Endpoints

### 🏠 Health Check
- **GET** `/`
  
  Basic health check endpoint.

  **Response:**
  ```json
  "Hello Hono!"
  ```

### 🔮 AI Prediction Endpoints

#### Comprehensive Trend Analysis
- **GET** `/predict/trends`
  
  Generates AI-powered analysis of music trends, emerging artists, and market predictions.

  **Query Parameters:**
  - `limit` (optional) - Number of tracks to analyze (default: 50, max: 100)
  - `includeRawResponse` (optional) - Include raw AI response (default: false)

  **Example Request:**
  ```bash
  GET /predict/trends?limit=75&includeRawResponse=true
  ```

  **Response:**
  ```json
  {
    "success": true,
    "message": "AI trend analysis completed using top 75 performing tracks",
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
      "tracksAnalyzed": 150,
      "afroTracks": 75,
      "youtubeTracks": 75,
      "totalViews": "1,234,567,890",
      "totalStreams": "987,654,321"
    },
    "generatedAt": "2025-09-18T10:30:00.000Z",
    "processingTime": "45.2 seconds"
  }
  ```

#### Artist-Specific Insights
- **GET** `/predict/artist`
  
  Provides deep analysis and predictions for a specific artist.

  **Query Parameters:**
  - `artist` (required) - Artist name to analyze

  **Example Request:**
  ```bash
  GET /predict/artist?artist=Burna Boy
  ```

  **Response:**
  ```json
  {
    "success": true,
    "artist": "Burna Boy",
    "insights": "Burna Boy shows exceptional cross-platform performance with consistent engagement rates...",
    "metrics": {
      "spotifyTracks": 15,
      "youtubeTracks": 8,
      "averagePopularity": 75.5,
      "totalYouTubeViews": "500,000,000",
      "totalYouTubeLikes": "25,000,000",
      "engagementRate": 5.0
    },
    "topTracks": {
      "spotify": [
        {
          "name": "Last Last",
          "popularity": 82,
          "energy": 0.8,
          "danceability": 0.75
        }
      ],
      "youtube": [
        {
          "Track": "Last Last",
          "Views": 45000000,
          "Likes": 850000
        }
      ]
    }
  }
  ```

#### Genre Trend Analysis
- **GET** `/predict/genre-trends`
  
  Analyzes trends based on audio features and musical characteristics.

  **Query Parameters:**
  - `minEnergy` (optional) - Minimum energy level (0.0-1.0)
  - `maxEnergy` (optional) - Maximum energy level (0.0-1.0)
  - `minDanceability` (optional) - Minimum danceability (0.0-1.0)
  - `maxDanceability` (optional) - Maximum danceability (0.0-1.0)
  - `minTempo` (optional) - Minimum tempo (BPM)
  - `maxTempo` (optional) - Maximum tempo (BPM)
  - `limit` (optional) - Number of tracks to analyze (default: 50, max: 100)

  **Example Request:**
  ```bash
  GET /predict/genre-trends?minEnergy=0.8&maxEnergy=1.0&limit=30
  ```

  **Response:**
  ```json
  {
    "success": true,
    "message": "Genre trend analysis completed for 28 tracks matching criteria",
    "audioFeatureProfile": {
      "averageEnergy": 0.825,
      "averageDanceability": 0.876,
      "averageTempo": 128.5,
      "averagePopularity": 71.2
    },
    "insights": "High-energy, highly danceable tracks with medium-fast tempo show strong commercial potential...",
    "statistics": {
      "tracksAnalyzed": 28,
      "uniqueArtists": 18,
      "energyLevel": "Very High",
      "danceabilityLevel": "Very High",
      "tempoCategory": "Medium-Fast"
    },
    "filters": {
      "minEnergy": 0.7,
      "maxEnergy": 1.0,
      "minDanceability": 0.8,
      "minTempo": 120,
      "maxTempo": 140
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
      "suggestedAnalysisLimit": 50,
      "recommendedEndpoints": [
        "GET /predict/trends?limit=50",
        "GET /predict/artist?artist=Wizkid",
        "GET /predict/genre-trends?minEnergy=0.6"
      ]
    }
  }
  ```

#### Interactive AI Chat
- **POST** `/predict/chat`
  
  Interactive AI chat with conversation memory and music data context.

  **Request Body:**
  ```json
  {
    "prompt": "What are the trending African artists right now?",
    "sessionId": "chat_user123_1234567890" // optional, auto-generated if not provided
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "sessionId": "chat_user123_1234567890",
    "message": "Based on the current data, here are the trending African artists: Burna Boy leads with exceptional cross-platform performance...",
    "conversation": {
      "messageCount": 5,
      "sessionStarted": "2025-09-18T10:00:00.000Z",
      "lastActivity": "2025-09-18T10:15:00.000Z"
    },
    "context": {
      "dataPointsAvailable": 622544,
      "topArtistsReferenced": ["Burna Boy", "Wizkid", "Davido", "Tems", "Rema"]
    },
    "suggestions": [
      "Ask me about trending artists or genres",
      "Request a detailed trend analysis",
      "Get insights about specific artists",
      "Explore collaboration opportunities",
      "Analyze audio features and market trends"
    ]
  }
  ```

#### Chat History Management
- **GET** `/predict/chat/history`
  
  Retrieve chat history for the authenticated user.

  **Query Parameters:**
  - `sessionId` (optional) - Get specific session messages
  - `limit` (optional) - Number of messages to return (default: 50, max: 100)

  **Get Specific Session:**
  ```bash
  GET /predict/chat/history?sessionId=chat_user123_1234567890&limit=20
  ```

  **Get All Sessions:**
  ```bash
  GET /predict/chat/history
  ```

  **Single Session Response:**
  ```json
  {
    "success": true,
    "sessionId": "chat_user123_1234567890",
    "messages": [
      {
        "role": "user",
        "content": "What are the trending genres?",
        "timestamp": "2025-09-18T10:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "The trending genres in African music right now are Afrobeats, Amapiano, and Afro-pop...",
        "timestamp": "2025-09-18T10:00:15.000Z"
      }
    ],
    "sessionInfo": {
      "messageCount": 10,
      "createdAt": "2025-09-18T09:45:00.000Z",
      "lastActivity": "2025-09-18T10:15:00.000Z"
    }
  }
  ```

  **All Sessions Response:**
  ```json
  {
    "success": true,
    "sessions": [
      {
        "sessionId": "chat_user123_1234567890",
        "messageCount": 10,
        "lastMessage": "The trending genres in African music right now are Afrobeats, Amapiano...",
        "createdAt": "2025-09-18T09:45:00.000Z",
        "lastActivity": "2025-09-18T10:15:00.000Z"
      }
    ]
  }
  ```

#### Session Management
- **DELETE** `/predict/chat/session`
  
  Delete a specific chat session.

  **Request Body:**
  ```json
  {
    "sessionId": "chat_user123_1234567890"
  }
  ```

  **Success Response:**
  ```json
  {
    "success": true,
    "message": "Chat session deleted successfully"
  }
  ```

  **Error Response (404):**
  ```json
  {
    "success": false,
    "error": "Session not found or access denied"
  }
  ```

### 📈 Data Access Endpoints

#### Dataset Statistics
- **GET** `/api/data/stats`
  
  Returns comprehensive statistics for all loaded datasets.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "concertPrograms": 3956,
      "spotifyAfroTracks": 1052,
      "spotifyYouTubeTracks": 617536,
      "totalDataPoints": 622544,
      "lastUpdated": "2025-09-18T08:00:00.000Z"
    }
  }
  ```

#### Top Performing Tracks
- **GET** `/api/data/top-afro/:limit?`
  
  Get top Spotify Afro tracks by popularity.

  **Parameters:**
  - `limit` (optional) - Number of tracks to return (default: 10, max: 50)

  **Example Request:**
  ```bash
  GET /api/data/top-afro/20
  ```

  **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "Last Last",
        "artist": "Burna Boy",
        "popularity": 89,
        "energy": 0.789,
        "danceability": 0.823,
        "tempo": 105.95
      }
    ],
    "count": 20,
    "sortedBy": "popularity"
  }
  ```

- **GET** `/api/data/top-youtube/:limit?`
  
  Get top YouTube tracks by view count.

  **Parameters:**
  - `limit` (optional) - Number of tracks to return (default: 10, max: 50)

  **Example Request:**
  ```bash
  GET /api/data/top-youtube/25
  ```

  **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "Track": "Essence",
        "Artist": "Wizkid feat. Tems",
        "Views": 158500000,
        "Likes": 2800000,
        "Comments": 125000,
        "Danceability": 0.67,
        "Energy": 0.73
      }
    ],
    "count": 25,
    "sortedBy": "views"
  }
  ```

#### Search Endpoints
- **GET** `/api/search/afro/:artist`
  
  Search Spotify Afro tracks by artist name.

  **Example Request:**
  ```bash
  GET /api/search/afro/Burna Boy
  ```

  **Response:**
  ```json
  {
    "success": true,
    "artist": "Burna Boy",
    "tracks": [
      {
        "name": "Last Last",
        "popularity": 89,
        "energy": 0.789,
        "danceability": 0.823
      }
    ],
    "count": 5
  }
  ```

- **GET** `/api/search/youtube/:artist`
  
  Search YouTube tracks by artist name.

  **Example Request:**
  ```bash
  GET /api/search/youtube/Wizkid
  ```

  **Response:**
  ```json
  {
    "success": true,
    "artist": "Wizkid",
    "tracks": [
      {
        "Track": "Essence",
        "Views": 158500000,
        "Likes": 2800000,
        "Comments": 125000
      }
    ],
    "count": 12
  }
  ```

### 🔍 Creator Discovery Endpoints

#### Search Creators
- **GET** `/explore/creators`
  
  Search for other creators with optional filtering and pagination.

  **Query Parameters:**
  - `limit` (optional) - Number of results (default: 50, max: 100)
  - `page` (optional) - Page number for pagination (default: 1)
  - `creatorType` (optional) - Filter by creator type
  - `name` (optional) - Search by name (case-insensitive partial match)

  **Valid Creator Types:**
  - `Content Creator`
  - `Musician`
  - `Producer`
  - `Event Planner`
  - `Other`

  **Example Requests:**
  ```bash
  # Get all creators (first 50)
  GET /explore/creators

  # Search by name
  GET /explore/creators?name=john&limit=20

  # Filter by creator type
  GET /explore/creators?creatorType=Musician&page=2

  # Combined filters
  GET /explore/creators?creatorType=Producer&name=mike&limit=10&page=1
  ```

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "creators": [
        {
          "_id": "670a1234567890abcdef1234",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "creatorType": "Musician"
        },
        {
          "_id": "670a1234567890abcdef5678",
          "name": "Jane Smith",
          "email": "jane.smith@example.com", 
          "creatorType": "Producer"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalCount": 125,
        "limit": 50,
        "hasNextPage": true,
        "hasPreviousPage": false
      },
      "filters": {
        "creatorType": "Musician",
        "name": "john"
      }
    }
  }
  ```

  **Error Response (400):**
  ```json
  {
    "success": false,
    "error": "Invalid creatorType. Must be one of: Content Creator, Musician, Producer, Event Planner, Other"
  }
  ```

#### Creator Statistics
- **GET** `/explore/creator-stats`
  
  Get distribution statistics of creators by type.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalCreators": 1250,
      "byType": [
        {
          "creatorType": "Musician",
          "count": 456,
          "percentage": 36
        },
        {
          "creatorType": "Content Creator",
          "count": 324,
          "percentage": 26
        },
        {
          "creatorType": "Producer",
          "count": 245,
          "percentage": 20
        },
        {
          "creatorType": "Event Planner",
          "count": 125,
          "percentage": 10
        },
        {
          "creatorType": "Other",
          "count": 100,
          "percentage": 8
        }
      ]
    }
  }
  ```

### ⚙️ User Settings Endpoints

#### Get User Profile
- **GET** `/settings/profile`
  
  Get current user's profile information.

  **Response:**
  ```json
  {
    "success": true,
    "profile": {
      "id": "670a1234567890abcdef1234",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "creatorType": "Musician"
    }
  }
  ```

  **Error Response (401):**
  ```json
  {
    "success": false,
    "error": "User authentication required"
  }
  ```

  **Error Response (404):**
  ```json
  {
    "success": false,
    "error": "User not found"
  }
  ```

#### Update User Profile
- **PUT** `/settings/profile`
  
  Update user's profile information. All fields are optional - provide only the fields you want to update.

  **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "creatorType": "Producer"
  }
  ```

  **Partial Update Example:**
  ```json
  {
    "name": "New Name Only"
  }
  ```

  **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "profile": {
      "id": "670a1234567890abcdef1234",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "creatorType": "Producer"
    },
    "updatedFields": ["name", "email", "creatorType"]
  }
  ```

  **Validation Error (400):**
  ```json
  {
    "success": false,
    "error": "Invalid creatorType. Must be one of: Content Creator, Musician, Producer, Event Planner, Other"
  }
  ```

  **Email Conflict Error (400):**
  ```json
  {
    "success": false,
    "error": "Email already exists"
  }
  ```

  **Invalid Email Format (400):**
  ```json
  {
    "success": false,
    "error": "Invalid email format"
  }
  ```

#### Change Password
- **PUT** `/settings/password`
  
  Change user's password with current password verification.

  **Request Body:**
  ```json
  {
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }
  ```

  **Success Response:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

  **Invalid Current Password (400):**
  ```json
  {
    "success": false,
    "error": "Current password is incorrect"
  }
  ```

  **Weak Password Error (400):**
  ```json
  {
    "success": false,
    "error": "New password must be at least 6 characters long"
  }
  ```

  **Same Password Error (400):**
  ```json
  {
    "success": false,
    "error": "New password must be different from current password"
  }
  ```

#### Delete Account
- **DELETE** `/settings/account`
  
  Delete user account permanently. Requires password confirmation and explicit deletion confirmation.

  **Request Body:**
  ```json
  {
    "password": "userpassword123",
    "confirmDeletion": "DELETE_MY_ACCOUNT"
  }
  ```

  **Success Response:**
  ```json
  {
    "success": true,
    "message": "Account deleted successfully"
  }
  ```

  **Invalid Password (400):**
  ```json
  {
    "success": false,
    "error": "Password is incorrect"
  }
  ```

  **Invalid Confirmation (400):**
  ```json
  {
    "success": false,
    "error": "confirmDeletion must be exactly \"DELETE_MY_ACCOUNT\""
  }
  ```

  **Missing Fields (400):**
  ```json
  {
    "success": false,
    "error": "Password and confirmDeletion are required"
  }
  ```

### 🎫 Event Discovery Endpoints

#### Scrape All Events
- **GET** `/events/scrape`
  
  Scrape events from both Tix.Africa and Luma platforms simultaneously.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "tixEvents": [
        {
          "name": "Afrobeats Night Lagos",
          "price": "₦5,000",
          "location": "Lagos, Nigeria", 
          "imageUrl": "https://tix.africa/images/event123.jpg",
          "eventUrl": "https://tix.africa/events/afrobeats-night-lagos",
          "date": "Dec 25, 2025",
          "source": "tix"
        }
      ],
      "lumaEvents": [
        {
          "name": "Music Tech Meetup",
          "price": "Check Event Page",
          "location": "Victoria Island, Lagos",
          "imageUrl": "https://images.luma.com/event456.jpg", 
          "eventUrl": "https://luma.com/events/music-tech-meetup",
          "date": "Tomorrow at 6:00 PM",
          "source": "luma"
        }
      ],
      "totalEvents": 45,
      "combinedEvents": [
        // All events from both platforms combined
      ]
    },
    "summary": {
      "tixEventsCount": 25,
      "lumaEventsCount": 20,
      "totalEventsCount": 45,
      "scrapedAt": "2025-09-18T10:30:00.000Z"
    }
  }
  ```

  **Error Response (500):**
  ```json
  {
    "success": false,
    "error": "Failed to scrape events",
    "details": "Network timeout or parsing error"
  }
  ```

#### Scrape Tix.Africa Events
- **GET** `/events/tix`
  
  Scrape events exclusively from Tix.Africa platform.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "name": "Davido Live in Concert",
          "price": "₦15,000",
          "location": "Eko Convention Centre, Lagos",
          "imageUrl": "https://tix.africa/images/davido-concert.jpg",
          "eventUrl": "https://tix.africa/events/davido-live-concert",
          "date": "Dec 31, 2025",
          "source": "tix"
        },
        {
          "name": "Amapiano Festival",
          "price": "₦8,500",
          "location": "Federal Palace Hotel, Lagos",
          "imageUrl": "https://tix.africa/images/amapiano-fest.jpg",
          "eventUrl": "https://tix.africa/events/amapiano-festival",
          "date": "Jan 15, 2026",
          "source": "tix"
        }
      ],
      "count": 25,
      "source": "tix.africa",
      "scrapedAt": "2025-09-18T10:30:00.000Z"
    }
  }
  ```

#### Scrape Luma Events
- **GET** `/events/luma`
  
  Scrape events exclusively from Luma platform.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "name": "African Music Industry Networking",
          "price": "Check Event Page",
          "location": "Ikoyi, Lagos",
          "imageUrl": "https://images.luma.com/music-networking.jpg",
          "eventUrl": "https://luma.com/events/african-music-networking",
          "date": "Next Friday at 7:00 PM",
          "source": "luma"
        },
        {
          "name": "Beat Making Workshop",
          "price": "Check Event Page", 
          "location": "Surulere, Lagos",
          "imageUrl": "https://images.luma.com/beat-workshop.jpg",
          "eventUrl": "https://luma.com/events/beat-making-workshop",
          "date": "Dec 20, 2025 at 3:00 PM",
          "source": "luma"
        }
      ],
      "count": 20,
      "source": "luma.com",
      "scrapedAt": "2025-09-18T10:30:00.000Z"
    }
  }
  ```

#### Get Lagos Events
- **GET** `/events/lagos`
  
  Get events specifically located in Lagos from both platforms.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "name": "Lagos Music Festival",
          "price": "₦12,000",
          "location": "Tafawa Balewa Square, Lagos",
          "imageUrl": "https://tix.africa/images/lagos-festival.jpg",
          "eventUrl": "https://tix.africa/events/lagos-music-festival",
          "date": "Dec 28, 2025",
          "source": "tix"
        }
      ],
      "count": 18,
      "totalScraped": 45,
      "location": "Lagos",
      "scrapedAt": "2025-09-18T10:30:00.000Z"
    }
  }
  ```

#### Get Free Events
- **GET** `/events/free`
  
  Get free events from both platforms.

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "name": "Open Mic Night",
          "price": "Free",
          "location": "Terra Kulture, Lagos",
          "imageUrl": "https://tix.africa/images/open-mic.jpg",
          "eventUrl": "https://tix.africa/events/open-mic-night",
          "date": "Every Thursday",
          "source": "tix"
        },
        {
          "name": "Music Tech Talks",
          "price": "Check Event Page",
          "location": "Lagos Tech Hub",
          "imageUrl": "https://images.luma.com/tech-talks.jpg",
          "eventUrl": "https://luma.com/events/music-tech-talks",
          "date": "Monthly",
          "source": "luma"
        }
      ],
      "count": 8,
      "totalScraped": 45,
      "filter": "free",
      "scrapedAt": "2025-09-18T10:30:00.000Z"
    }
  }
  ```

#### Search Events
- **GET** `/events/search`
  
  Search events by keyword in event names.

  **Query Parameters:**
  - `q` (required) - Search keyword

  **Example Request:**
  ```bash
  GET /events/search?q=afrobeats
  ```

  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "name": "Afrobeats Night Lagos",
          "price": "₦5,000",
          "location": "Lagos, Nigeria",
          "imageUrl": "https://tix.africa/images/afrobeats-night.jpg",
          "eventUrl": "https://tix.africa/events/afrobeats-night-lagos",
          "date": "Dec 25, 2025",
          "source": "tix"
        },
        {
          "name": "Pure Afrobeats Party",
          "price": "₦3,500",
          "location": "Ikeja, Lagos",
          "imageUrl": "https://tix.africa/images/pure-afrobeats.jpg",
          "eventUrl": "https://tix.africa/events/pure-afrobeats-party",
          "date": "Jan 1, 2026",
          "source": "tix"
        }
      ],
      "count": 5,
      "totalScraped": 45,
      "searchKeyword": "afrobeats",
      "scrapedAt": "2025-09-18T10:30:00.000Z"
    }
  }
  ```

  **Missing Keyword Error (400):**
  ```json
  {
    "success": false,
    "error": "Search keyword (q) is required"
  }
  ```

#### Event Data Structure

Each scraped event contains the following fields:

```json
{
  "name": "Event Name",           // Event title/name
  "price": "₦5,000 | Free",      // Ticket price (Nigerian Naira for Tix, varies for Luma)
  "location": "City, State",     // Event location/venue
  "imageUrl": "https://...",     // Event poster/image URL
  "eventUrl": "https://...",     // Direct link to event page
  "date": "Dec 25, 2025",       // Event date/time
  "source": "tix | luma"        // Platform source (tix.africa or luma.com)
}
```

## 🤖 Direct AI Interaction

#### AI Prompt Endpoint
- **POST** `/ai/prompt`
  
  Direct interaction with Gemini AI without music data context.

  **Request Body:**
  ```json
  {
    "prompt": "Explain how machine learning works in music recommendation systems"
  }
  ```

  **Response:**
  ```json
  {
    "success": true,
    "prompt": "Explain how machine learning works in music recommendation systems",
    "response": "Machine learning in music recommendation systems works by analyzing...",
    "timestamp": "2025-09-18T10:30:00.000Z"
  }
  ```

## 🧪 Example Usage

### 1. User Registration and Authentication
```bash
# Register a new musician
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "musician@example.com",
    "password": "securepassword123",
    "name": "Jane Smith",
    "creatorType": "Musician"
  }'

# Login and get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "musician@example.com",
    "password": "securepassword123"
  }'

# Save the token from response for use in protected endpoints
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. System Overview
```bash
# Get system health
curl http://localhost:3000/

# Get data statistics
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/data/stats

# Get quick prediction stats
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/predict/quick-stats
```

### 3. Music Trend Analysis
```bash
# Basic trend analysis
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/predict/trends

# Detailed analysis with more tracks
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/trends?limit=75&includeRawResponse=true"

# Quick analysis
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/trends?limit=25"
```

### 4. Artist Analysis
```bash
# Analyze specific artist
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/artist?artist=Burna Boy"

# Multiple artists
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/artist?artist=Wizkid"
```

### 5. Genre and Audio Feature Analysis
```bash
# High-energy tracks analysis
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/genre-trends?minEnergy=0.8&maxEnergy=1.0&limit=30"

# Danceable tracks analysis
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/genre-trends?minDanceability=0.7&minTempo=120&maxTempo=140"
```

### 6. Interactive Chat
```bash
# Start a conversation
curl -X POST http://localhost:3000/predict/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"prompt": "What are the trending African music genres?"}'

# Continue conversation with session ID
curl -X POST http://localhost:3000/predict/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "Can you analyze Burna Boy specifically?",
    "sessionId": "chat_user123_1234567890"
  }'

# Get chat history
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/predict/chat/history?sessionId=chat_user123_1234567890"

# Get all sessions
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/predict/chat/history
```

### 7. Creator Discovery
```bash
# Find all musicians
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/explore/creators?creatorType=Musician&limit=20"

# Search by name
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/explore/creators?name=john&page=1"

# Get creator statistics
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/explore/creator-stats
```

### 8. Data Access
```bash
# Get top Afro tracks
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/data/top-afro/20

# Get top YouTube tracks
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/data/top-youtube/15

# Search for artist tracks
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/api/search/afro/Burna Boy"
```

## 🎵 Key Features

- **🤖 AI-Powered Analysis** - Leverages Google's Gemini AI for intelligent insights
- **💬 Interactive Chat** - Conversational AI with memory and context awareness
- **👥 Creator Discovery** - Find and connect with other music industry professionals
- **🔐 User Authentication** - Secure JWT-based authentication system
- **📊 Multi-Source Data** - Combines Spotify, YouTube, and concert data
- **🔮 Predictive Analytics** - Forecasts trends, emerging artists, and market opportunities
- **🎯 Artist Intelligence** - Deep dive analysis for individual artists
- **🎶 Audio Feature Analysis** - Genre predictions based on musical characteristics
- **📈 Performance Metrics** - Views, streams, popularity, and engagement analytics
- **🌍 African Music Focus** - Specialized in African music market trends
- **📱 Frontend Ready** - RESTful API design optimized for web and mobile frontends

## 🛡 Error Handling

All endpoints include comprehensive error handling with:

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message",
  "details": "Additional technical details (in development mode)",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created (registration)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing JWT)
- **404** - Not Found
- **500** - Internal Server Error

### Error Examples
```json
// Authentication Error
{
  "success": false,
  "error": "User authentication required"
}

// Validation Error
{
  "success": false,
  "error": "Invalid creatorType. Must be one of: Content Creator, Musician, Producer, Event Planner, Other"
}

// Not Found Error
{
  "success": false,
  "error": "Session not found or access denied"
}
```

## 📝 Technology Stack

- **Runtime:** Bun (latest)
- **Framework:** Hono v4.9.7
- **AI:** Google Gemini AI (via @google/genai)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (Hono built-in)
- **Language:** TypeScript
- **Password Hashing:** bcryptjs
- **Data Format:** JSON

## 🚦 Development

### Project Structure
```
src/
├── index.ts                          # Main application entry with Bun server
├── routes/
│   ├── predict.ts                    # AI prediction and chat endpoints
│   ├── explore.ts                    # Creator discovery endpoints
│   └── auth.ts                       # Authentication endpoints (signup/login)
├── models/
│   └── user.ts                       # Mongoose User model with creator types
├── lib/
│   ├── genai.ts                      # Google Gemini AI integration
│   ├── loaddata.ts                   # Data loading and management utilities
│   └── aipredictiveanalysis.ts       # AI analysis logic and predictions
├── data/                             # JSON datasets (imported directly)
│   ├── dataconcers2011-.json         # Concert programs data
│   ├── spotifyafro.json              # Spotify African music tracks
│   └── spotifyyoutubedataset.json    # Combined Spotify + YouTube data
└── middleware/
    └── auth.ts                       # JWT middleware configuration
```

### Development Workflow
```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env  # Edit with your values

# Start development server with hot reload
bun run dev

# Run in production mode
bun run start

# Test API endpoints
curl http://localhost:3000/predict/quick-stats
```

### Adding New Features
1. **New Endpoints**: Add routes in appropriate files under `src/routes/`
2. **Database Models**: Define schemas in `src/models/`
3. **AI Features**: Extend functionality in `src/lib/aipredictiveanalysis.ts`
4. **Middleware**: Add custom middleware in `src/middleware/`
5. **Documentation**: Update this README with new endpoint details

### Performance Considerations
- **Timeout Configuration**: 120-second timeout for AI operations
- **Data Caching**: JSON data loaded once at startup
- **Session Management**: In-memory chat sessions (consider Redis for production)
- **Rate Limiting**: Consider implementing rate limiting for production

## 🔗 Production Deployment

### Environment Variables
```env
# Required
GOOGLEAI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/afrisight
JWT_SECRET=your_secure_jwt_secret_here

# Optional
PORT=3000
NODE_ENV=production
```

### Security Checklist
- ✅ JWT secrets are cryptographically secure
- ✅ Database connection uses authentication
- ✅ HTTPS enabled in production
- ✅ Rate limiting implemented
- ✅ Input validation on all endpoints
- ✅ Password hashing with bcrypt
- ✅ CORS properly configured

### Monitoring
- **Health Check**: `GET /` endpoint for load balancer health checks
- **Error Logging**: Comprehensive error logging with timestamps
- **Performance**: Monitor AI endpoint response times
- **Usage Tracking**: Track API usage per user/endpoint

---

**Built with ❤️ for the African music industry**

*Ready for frontend integration - all endpoints documented and tested*
