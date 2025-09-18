import { Hono } from 'hono'
import mongoose from 'mongoose'
import auth from './routes/auth'
import { jwtMiddleware } from './middleware/auth.js'
import { run } from './lib/genai'
import { dataLoader } from './lib/loaddata'
import { aiPredictiveAnalysis } from './lib/aipredictiveanalysis'
import predict from './routes/predict'
import explore from './routes/explore'

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Public auth routes
app.route('/auth', auth)

// Protect all other routes by default
app.use('*', jwtMiddleware)

// Mount the explore routes
app.route('/explore', explore)

// Mount the predict routes
app.route('/predict', predict)

// Data endpoints
app.get('/api/data/stats', (c) => {
  try {
    const stats = dataLoader.getDataStats();
    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get data statistics'
    }, 500);
  }
})

app.get('/api/data/top-afro/:limit?', (c) => {
  try {
    const limit = parseInt(c.req.param('limit') || '10');
    const tracks = dataLoader.getTopAfroTracks(limit);
    return c.json({
      success: true,
      data: tracks,
      count: tracks.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get top Afro tracks'
    }, 500);
  }
})

app.get('/api/data/top-youtube/:limit?', (c) => {
  try {
    const limit = parseInt(c.req.param('limit') || '10');
    const tracks = dataLoader.getTopYouTubeTracks(limit);
    return c.json({
      success: true,
      data: tracks,
      count: tracks.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get top YouTube tracks'
    }, 500);
  }
})

// AI-powered analysis endpoints
app.post('/api/ai/trend-analysis', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const limit = body.limit || 100;

    console.log(`Generating trend analysis for top ${limit} tracks...`);
    const insights = await aiPredictiveAnalysis.generateTrendAnalysis(limit);
    
    return c.json({
      success: true,
      insights,
      message: `Analysis generated using top ${limit} performing tracks`
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate trend analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
})

app.post('/api/ai/artist-insights', async (c) => {
  try {
    const body = await c.req.json();
    const { artist } = body;

    if (!artist) {
      return c.json({ error: 'Artist name is required' }, 400);
    }

    console.log(`Generating insights for artist: ${artist}`);
    const insights = await aiPredictiveAnalysis.generateArtistInsights(artist);
    
    return c.json({
      success: true,
      artist,
      insights
    });
  } catch (error) {
    console.error('Artist insights error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate artist insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
})

app.get('/api/search/afro/:artist', (c) => {
  try {
    const artist = c.req.param('artist');
    const tracks = dataLoader.searchAfroTracksByArtist(artist);
    return c.json({
      success: true,
      artist,
      tracks,
      count: tracks.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to search Afro tracks'
    }, 500);
  }
})

app.get('/api/search/youtube/:artist', (c) => {
  try {
    const artist = c.req.param('artist');
    const tracks = dataLoader.searchYouTubeTracksByArtist(artist);
    return c.json({
      success: true,
      artist,
      tracks,
      count: tracks.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to search YouTube tracks'
    }, 500);
  }
})

// Original AI prompt endpoint
app.post('/ai/prompt', async (c) => {
  try {
    const body = await c.req.json()
    const { prompt } = body

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400)
    }

    const response = await run(prompt)
    
    return c.json({
      success: true,
      prompt: prompt,
      response: response
    })
  } catch (error) {
    console.error('AI Error:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to generate AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Configure Bun server with increased timeout for AI operations
Bun.serve({
  fetch: app.fetch,
  port: Bun.env.PORT || 5000,
  idleTimeout: 255, 
  development: process.env.NODE_ENV !== 'production',
})

console.log(`🚀 AfriSight Backend server running on http://localhost:${Bun.env.PORT || 5000}`)
console.log('⚡ AI-powered music analytics ready!')

export default app
