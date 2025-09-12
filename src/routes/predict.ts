import { Hono } from 'hono';
import { aiPredictiveAnalysis } from '../lib/aipredictiveanalysis';
import { dataLoader } from '../lib/loaddata';

const predict = new Hono();

/**
 * GET /predict/trends
 * Generate comprehensive trend analysis and predictions
 */
predict.get('/trends', async (c) => {
  try {
    // Get query parameters with better defaults
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100); // Max 100, default 50
    const includeRawResponse = c.req.query('includeRawResponse') === 'true';

    console.log(`🔮 Generating trend predictions for top ${limit} tracks...`);
    
    // Add response headers to prevent browser timeout
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    
    const insights = await aiPredictiveAnalysis.generateTrendAnalysis(limit);
    
    // Prepare response based on user preference
    const response: any = {
      success: true,
      message: `AI trend analysis completed using top ${limit} performing tracks`,
      predictions: {
        topGenres: insights.analysis.topGenres,
        emergingArtists: insights.analysis.emergingArtists,
        popularEvents: insights.analysis.popularEvents,
        concertTrends: insights.analysis.concertTrends,
        marketingSuggestions: insights.analysis.marketingSuggestions,
        collaborationIdeas: insights.analysis.collaborationIdeas,
        venueRecommendations: insights.analysis.venueRecommendations
      },
      dataAnalyzed: {
        tracksAnalyzed: insights.dataUsed.afroTracksCount + insights.dataUsed.youtubeTracksCount,
        afroTracks: insights.dataUsed.afroTracksCount,
        youtubeTracks: insights.dataUsed.youtubeTracksCount,
        totalViews: insights.dataUsed.totalViews.toLocaleString(),
        totalStreams: insights.dataUsed.totalStreams.toLocaleString()
      },
      generatedAt: insights.timestamp,
      note: limit >= 75 ? "Large analysis may take 60-90 seconds" : "Analysis completed quickly"
    };

    // Include raw AI response if requested
    if (includeRawResponse) {
      response.rawAiResponse = insights.rawAiResponse;
    }

    return c.json(response);
  } catch (error) {
    console.error('❌ Trend prediction error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate trend predictions',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Try reducing the limit parameter (e.g., ?limit=25) for faster analysis'
    }, 500);
  }
});

/**
 * GET /predict/artist
 * Generate predictions and insights for a specific artist
 */
predict.get('/artist', async (c) => {
  try {
    const artist = c.req.query('artist');

    if (!artist || typeof artist !== 'string') {
      return c.json({ 
        success: false,
        error: 'Artist name is required and must be a string',
        usage: 'Use ?artist=ArtistName in the URL'
      }, 400);
    }

    console.log(`🎵 Generating artist insights for: ${artist}`);

    // Get artist data first
    const afroTracks = dataLoader.searchAfroTracksByArtist(artist);
    const youtubeTracks = dataLoader.searchYouTubeTracksByArtist(artist);

    if (afroTracks.length === 0 && youtubeTracks.length === 0) {
      return c.json({
        success: false,
        error: `No data found for artist: ${artist}`,
        suggestion: 'Please check the artist name spelling or try a different artist'
      }, 404);
    }

    // Generate AI insights
    const insights = await aiPredictiveAnalysis.generateArtistInsights(artist);

    // Calculate performance metrics
    const avgPopularity = afroTracks.length > 0 
      ? afroTracks.reduce((sum, track) => sum + track.popularity, 0) / afroTracks.length 
      : 0;
    
    const totalViews = youtubeTracks.reduce((sum, track) => sum + track.Views, 0);
    const totalLikes = youtubeTracks.reduce((sum, track) => sum + track.Likes, 0);

    return c.json({
      success: true,
      artist,
      insights,
      metrics: {
        spotifyTracks: afroTracks.length,
        youtubeTracks: youtubeTracks.length,
        averagePopularity: parseFloat(avgPopularity.toFixed(2)),
        totalYouTubeViews: totalViews.toLocaleString(),
        totalYouTubeLikes: totalLikes.toLocaleString(),
        engagementRate: youtubeTracks.length > 0 
          ? parseFloat(((totalLikes / totalViews) * 100).toFixed(4))
          : 0
      },
      topTracks: {
        spotify: afroTracks.slice(0, 3).map(track => ({
          name: track.name,
          album: track.album,
          popularity: track.popularity,
          energy: track.energy,
          danceability: Array.isArray(track.danceability) ? track.danceability[0] : track.danceability
        })),
        youtube: youtubeTracks.slice(0, 3).map(track => ({
          title: track.Track,
          album: track.Album,
          views: track.Views.toLocaleString(),
          likes: track.Likes.toLocaleString()
        }))
      }
    });
  } catch (error) {
    console.error('❌ Artist insights error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate artist insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /predict/genre-trends
 * Predict trends for a specific genre or audio features
 */
predict.get('/genre-trends', async (c) => {
  try {
    // Get query parameters with defaults
    const minEnergy = parseFloat(c.req.query('minEnergy') || '0');
    const maxEnergy = parseFloat(c.req.query('maxEnergy') || '1');
    const minDanceability = parseFloat(c.req.query('minDanceability') || '0');
    const maxDanceability = parseFloat(c.req.query('maxDanceability') || '1');
    const minTempo = parseFloat(c.req.query('minTempo') || '0');
    const maxTempo = parseFloat(c.req.query('maxTempo') || '300');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

    console.log(`🎶 Analyzing genre trends with audio feature filters...`);

    // Get all Afro tracks and filter by audio features
    const allAfroTracks = dataLoader.loadSpotifyAfroData();
    const filteredTracks = allAfroTracks.filter(track => {
      const danceability = Array.isArray(track.danceability) ? track.danceability[0] : track.danceability;
      return track.energy >= minEnergy && track.energy <= maxEnergy &&
             danceability >= minDanceability && danceability <= maxDanceability &&
             track.tempo >= minTempo && track.tempo <= maxTempo;
    }).slice(0, limit);

    if (filteredTracks.length === 0) {
      return c.json({
        success: false,
        error: 'No tracks found matching the specified audio feature criteria',
        filters: { minEnergy, maxEnergy, minDanceability, maxDanceability, minTempo, maxTempo },
        usage: 'Try adjusting the filter parameters in the URL query string'
      }, 404);
    }

    // Calculate audio feature averages for the filtered tracks
    const avgEnergy = filteredTracks.reduce((sum, track) => sum + track.energy, 0) / filteredTracks.length;
    const avgDanceability = filteredTracks.reduce((sum, track) => {
      const dance = Array.isArray(track.danceability) ? track.danceability[0] : track.danceability;
      return sum + dance;
    }, 0) / filteredTracks.length;
    const avgTempo = filteredTracks.reduce((sum, track) => sum + track.tempo, 0) / filteredTracks.length;
    const avgPopularity = filteredTracks.reduce((sum, track) => sum + track.popularity, 0) / filteredTracks.length;

    // Get unique artists and top tracks
    const artists = [...new Set(filteredTracks.map(track => track.artist))];
    const topTracks = filteredTracks
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

    // Generate genre prediction prompt
    const genreData = `
GENRE TREND ANALYSIS

Audio Feature Profile:
- Energy: ${avgEnergy.toFixed(3)} (${avgEnergy > 0.7 ? 'High' : avgEnergy > 0.4 ? 'Medium' : 'Low'})
- Danceability: ${avgDanceability.toFixed(3)} (${avgDanceability > 0.7 ? 'High' : avgDanceability > 0.4 ? 'Medium' : 'Low'})
- Tempo: ${avgTempo.toFixed(1)} BPM (${avgTempo > 120 ? 'Fast' : avgTempo > 90 ? 'Medium' : 'Slow'})
- Average Popularity: ${avgPopularity.toFixed(2)}

Tracks Analyzed: ${filteredTracks.length}
Active Artists: ${artists.length}
Top Artists: ${artists.slice(0, 10).join(', ')}

Top Performing Tracks:
${topTracks.map((track, i) => 
  `${i + 1}. "${track.name}" by ${track.artist} - Popularity: ${track.popularity}`
).join('\n')}
`;

    const prompt = `
${genreData}

Based on this audio feature analysis, predict:
1. What genre or sub-genre this represents
2. Market trends for this style of music
3. Target audience demographics
4. Recommended marketing strategies
5. Future growth potential
6. Similar emerging styles to watch

Keep your analysis concise but insightful, focusing on actionable predictions.
`;

    const aiInsights = await aiPredictiveAnalysis.generateArtistInsights('genre analysis: ' + prompt);

    return c.json({
      success: true,
      message: `Genre trend analysis completed for ${filteredTracks.length} tracks`,
      audioFeatureProfile: {
        averageEnergy: parseFloat(avgEnergy.toFixed(3)),
        averageDanceability: parseFloat(avgDanceability.toFixed(3)),
        averageTempo: parseFloat(avgTempo.toFixed(1)),
        averagePopularity: parseFloat(avgPopularity.toFixed(2))
      },
      insights: aiInsights,
      statistics: {
        tracksAnalyzed: filteredTracks.length,
        uniqueArtists: artists.length,
        energyLevel: avgEnergy > 0.7 ? 'High' : avgEnergy > 0.4 ? 'Medium' : 'Low',
        danceabilityLevel: avgDanceability > 0.7 ? 'High' : avgDanceability > 0.4 ? 'Medium' : 'Low',
        tempoCategory: avgTempo > 120 ? 'Fast' : avgTempo > 90 ? 'Medium' : 'Slow'
      },
      topArtists: artists.slice(0, 10),
      topTracks: topTracks.slice(0, 5).map(track => ({
        name: track.name,
        artist: track.artist,
        album: track.album,
        popularity: track.popularity,
        energy: track.energy,
        danceability: Array.isArray(track.danceability) ? track.danceability[0] : track.danceability,
        tempo: track.tempo
      }))
    });
  } catch (error) {
    console.error('❌ Genre trends error:', error);
    return c.json({
      success: false,
      error: 'Failed to analyze genre trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /predict/quick-stats
 * Get quick prediction statistics and data overview
 */
predict.get('/quick-stats', (c) => {
  try {
    const stats = dataLoader.getDataStats();
    const topAfroTracks = dataLoader.getTopAfroTracks(10);
    const topYouTubeTracks = dataLoader.getTopYouTubeTracks(10);

    // Calculate quick insights
    const totalViews = topYouTubeTracks.reduce((sum, track) => sum + track.Views, 0);
    const avgPopularity = topAfroTracks.reduce((sum, track) => sum + track.popularity, 0) / topAfroTracks.length;
    
    const uniqueAfroArtists = [...new Set(topAfroTracks.map(track => track.artist))];
    const uniqueYouTubeArtists = [...new Set(topYouTubeTracks.map(track => track.Artist))];

    return c.json({
      success: true,
      overview: {
        totalDataPoints: stats.concertPrograms + stats.spotifyAfroTracks + stats.spotifyYouTubeTracks,
        concertPrograms: stats.concertPrograms,
        spotifyAfroTracks: stats.spotifyAfroTracks,
        spotifyYouTubeTracks: stats.spotifyYouTubeTracks
      },
      topPerformers: {
        totalViewsTop10: totalViews.toLocaleString(),
        averagePopularityTop10: parseFloat(avgPopularity.toFixed(2)),
        uniqueAfroArtistsTop10: uniqueAfroArtists.length,
        uniqueYouTubeArtistsTop10: uniqueYouTubeArtists.length
      },
      readyForPrediction: {
        dataLoaded: true,
        aiReady: true,
        suggestedAnalysisLimit: 100,
        recommendedEndpoints: [
          'POST /predict/trends - Comprehensive trend analysis',
          'POST /predict/artist - Artist-specific insights',
          'POST /predict/genre-trends - Audio feature-based analysis'
        ]
      }
    });
  } catch (error) {
    console.error('❌ Quick stats error:', error);
    return c.json({
      success: false,
      error: 'Failed to get prediction statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default predict;