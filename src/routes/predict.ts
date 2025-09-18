import { Hono } from 'hono';
import { aiPredictiveAnalysis } from '../lib/aipredictiveanalysis';
import { dataLoader } from '../lib/loaddata';
import { run } from '../lib/genai';

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
 * GET /predict/creator-insights
 * Generate insights for any type of creator (music, content, business, etc.)
 */
predict.get('/creator-insights', async (c) => {
  try {
    const creatorType = c.req.query('type') || 'general';
    const focus = c.req.query('focus') || 'trends';
    const includeData = c.req.query('includeData') === 'true';

    console.log(`🎨 Generating creator insights for type: ${creatorType}, focus: ${focus}`);

    // Load all available data
    const allData = dataLoader.loadAllData();
    const businessStats = dataLoader.getBusinessStats();
    const movieStats = dataLoader.getMoviesStats();
    const musicStats = dataLoader.getDataStats();

    // Build context based on creator type
    let contextData = '';
    let specificInsights = '';

    if (creatorType === 'musician' || creatorType === 'music') {
      const topAfroTracks = dataLoader.getTopAfroTracks(10);
      const topYouTubeTracks = dataLoader.getTopYouTubeTracks(10);
      
      contextData = `
MUSIC INDUSTRY DATA:
- Total Spotify Afro Tracks: ${musicStats.spotifyAfroTracks}
- Total YouTube Music Videos: ${musicStats.spotifyYouTubeTracks}
- Concert Programs: ${musicStats.concertPrograms}

TOP PERFORMING TRACKS:
${topAfroTracks.slice(0, 5).map((track, i) => 
  `${i + 1}. "${track.name}" by ${track.artist} - Popularity: ${track.popularity}`
).join('\n')}

YOUTUBE TOP PERFORMERS:
${topYouTubeTracks.slice(0, 5).map((track, i) => 
  `${i + 1}. "${track.Track}" by ${track.Artist} - Views: ${track.Views.toLocaleString()}`
).join('\n')}`;

      specificInsights = 'music industry trends, artist development, streaming strategies, live performance opportunities';
      
    } else if (creatorType === 'content' || creatorType === 'video') {
      const shortMovies = dataLoader.getMoviesByRuntimeRange(0, 90);
      const mediumMovies = dataLoader.getMoviesByRuntimeRange(90, 120);
      
      contextData = `
CONTENT CREATION DATA:
- Total Movies Analyzed: ${movieStats.totalMovies}
- Average Runtime: ${movieStats.averageRuntime.toFixed(1)} minutes
- Short Content (<90min): ${movieStats.runtimeDistribution.short} pieces
- Medium Content (90-120min): ${movieStats.runtimeDistribution.medium} pieces
- Long Content (>120min): ${movieStats.runtimeDistribution.long} pieces

CONTENT LENGTH ANALYSIS:
- Short-form content represents ${((movieStats.runtimeDistribution.short / movieStats.totalMovies) * 100).toFixed(1)}% of total
- Optimal content length range appears to be ${movieStats.shortestRuntime}-${movieStats.longestRuntime} minutes
- Most popular format: ${movieStats.runtimeDistribution.short > movieStats.runtimeDistribution.medium ? 'Short-form' : 'Medium-form'} content`;

      specificInsights = 'content creation strategies, optimal video lengths, audience engagement, platform-specific recommendations';
      
    } else if (creatorType === 'business' || creatorType === 'entrepreneur') {
      const topSales = dataLoader.getTopBusinessSales(10);
      
      contextData = `
BUSINESS & RETAIL DATA:
- Total Business Records: ${businessStats.totalRecords}
- Total Net Sales: $${businessStats.totalNetSales.toLocaleString()}
- Average Net Sales: $${businessStats.averageNetSales.toFixed(2)}
- Top Product Category: ${businessStats.topProductType}
- Unique Product Types: ${businessStats.uniqueProductTypes}

TOP PERFORMING BUSINESS CATEGORIES:
${topSales.slice(0, 5).map((sale, i) => 
  `${i + 1}. ${sale["Product Type"]} - Net Sales: $${sale["Total Net Sales"].toLocaleString()}`
).join('\n')}

BUSINESS INSIGHTS:
- Highest performing category generates $${topSales[0]?.["Total Net Sales"].toLocaleString()} in net sales
- Success rate varies by product type and market positioning`;

      specificInsights = 'business strategy, product development, market trends, monetization strategies';
      
    } else {
      // General creator insights combining all data
      contextData = `
COMPREHENSIVE CREATOR ECOSYSTEM DATA:
Music Industry:
- ${musicStats.spotifyAfroTracks} music tracks analyzed
- ${musicStats.concertPrograms} live events tracked

Content Creation:
- ${movieStats.totalMovies} content pieces analyzed
- Average content length: ${movieStats.averageRuntime.toFixed(1)} minutes

Business & Commerce:
- ${businessStats.totalRecords} business cases studied
- $${businessStats.totalNetSales.toLocaleString()} in total sales tracked
- ${businessStats.uniqueProductTypes} different product categories

CROSS-INDUSTRY INSIGHTS:
- Music streaming shows high engagement with energetic, danceable content
- Content creation favors ${movieStats.runtimeDistribution.short > movieStats.runtimeDistribution.medium ? 'shorter' : 'medium-length'} formats
- Business success varies significantly across product categories`;

      specificInsights = 'cross-industry trends, multi-platform strategies, audience development, monetization across different creator verticals';
    }

    // Generate AI insights based on focus area
    const promptContext = `
AFRISIGHT CREATOR INTELLIGENCE SYSTEM

CREATOR TYPE: ${creatorType.toUpperCase()}
ANALYSIS FOCUS: ${focus.toUpperCase()}

${contextData}

Based on this comprehensive data analysis, provide detailed insights for ${creatorType} creators focusing on ${focus}. Include:

1. Current Market Trends & Opportunities
2. Data-Driven Recommendations
3. Growth Strategies & Best Practices
4. Monetization Opportunities
5. Platform-Specific Strategies
6. Collaboration & Networking Ideas
7. Future Predictions & Emerging Trends
8. Actionable Next Steps

Focus particularly on ${specificInsights}. Make recommendations specific, actionable, and backed by the data provided.
`;

    console.log(`🤖 Generating AI insights for ${creatorType} creators...`);
    const aiResponse = await run(promptContext);

    const response: any = {
      success: true,
      creatorType,
      focus,
      insights: aiResponse,
      dataContext: {
        musicTracks: musicStats.spotifyAfroTracks + musicStats.spotifyYouTubeTracks,
        contentPieces: movieStats.totalMovies,
        businessCases: businessStats.totalRecords,
        concertPrograms: musicStats.concertPrograms
      },
      recommendations: {
        primaryFocus: specificInsights,
        dataAvailable: true,
        customAnalysis: true
      },
      generatedAt: new Date().toISOString()
    };

    // Include raw data if requested
    if (includeData) {
      response.rawData = {
        musicStats,
        movieStats,
        businessStats
      };
    }

    return c.json(response);

  } catch (error) {
    console.error('❌ Creator insights error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate creator insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /predict/business-trends
 * Analyze business and market trends for entrepreneurs
 */
predict.get('/business-trends', async (c) => {
  try {
    const category = c.req.query('category') || 'all';
    const minSales = parseFloat(c.req.query('minSales') || '0');
    const maxSales = parseFloat(c.req.query('maxSales') || '50000');

    console.log(`💼 Analyzing business trends for category: ${category}`);

    const businessData = dataLoader.loadBusinessData();
    const businessStats = dataLoader.getBusinessStats();
    
    // Filter data based on parameters
    let filteredData = dataLoader.getBusinessSalesByRange(minSales, maxSales);
    if (category !== 'all') {
      filteredData = dataLoader.searchBusinessByProductType(category);
    }

    const topPerformers = dataLoader.getTopBusinessSales(10);

    const businessContext = `
BUSINESS MARKET ANALYSIS

Overall Market Data:
- Total Businesses Analyzed: ${businessStats.totalRecords}
- Total Market Value: $${businessStats.totalNetSales.toLocaleString()}
- Average Business Performance: $${businessStats.averageNetSales.toFixed(2)}
- Top Performing Category: ${businessStats.topProductType}

${category !== 'all' ? `
Category Focus: ${category}
Filtered Results: ${filteredData.length} businesses
` : ''}

TOP PERFORMING BUSINESSES:
${topPerformers.slice(0, 8).map((business, i) => 
  `${i + 1}. ${business["Product Type"]} - Net Sales: $${business["Total Net Sales"].toLocaleString()}`
).join('\n')}

MARKET INSIGHTS:
- Success Rate Analysis across ${businessStats.uniqueProductTypes} different sectors
- Performance Range: $${Math.min(...businessData.map(b => b["Total Net Sales"])).toLocaleString()} - $${Math.max(...businessData.map(b => b["Total Net Sales"])).toLocaleString()}
- Market Concentration in top-performing categories

Based on this business data, provide:
1. Market opportunity analysis
2. Successful business model patterns
3. Category-specific strategies
4. Growth potential predictions
5. Risk assessment and mitigation
6. Competitive landscape insights
7. Monetization strategies
8. Scaling recommendations
`;

    const aiInsights = await run(businessContext);

    return c.json({
      success: true,
      category,
      insights: aiInsights,
      marketData: {
        totalBusinesses: businessStats.totalRecords,
        totalMarketValue: businessStats.totalNetSales,
        averagePerformance: businessStats.averageNetSales,
        topCategory: businessStats.topProductType,
        categoriesAnalyzed: businessStats.uniqueProductTypes
      },
      topPerformers: topPerformers.slice(0, 5).map(business => ({
        category: business["Product Type"],
        netSales: business["Total Net Sales"],
        performance: business["Total Net Sales"] > businessStats.averageNetSales ? 'Above Average' : 'Below Average'
      })),
      filters: {
        category: category === 'all' ? 'All Categories' : category,
        salesRange: `$${minSales.toLocaleString()} - $${maxSales.toLocaleString()}`,
        resultsCount: filteredData.length
      }
    });

  } catch (error) {
    console.error('❌ Business trends error:', error);
    return c.json({
      success: false,
      error: 'Failed to analyze business trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /predict/content-strategy
 * Analyze content creation strategies based on movies/video data
 */
predict.get('/content-strategy', async (c) => {
  try {
    const contentType = c.req.query('type') || 'all'; // short, medium, long, all
    const minRuntime = parseInt(c.req.query('minRuntime') || '0');
    const maxRuntime = parseInt(c.req.query('maxRuntime') || '300');

    console.log(`🎬 Analyzing content strategy for type: ${contentType}`);

    const moviesData = dataLoader.loadMoviesData();
    const movieStats = dataLoader.getMoviesStats();
    
    // Filter data based on content type
    let filteredMovies = dataLoader.getMoviesByRuntimeRange(minRuntime, maxRuntime);
    let typeDescription = 'All Content Types';

    if (contentType === 'short') {
      filteredMovies = dataLoader.getMoviesByRuntimeRange(0, 90);
      typeDescription = 'Short-Form Content (<90 minutes)';
    } else if (contentType === 'medium') {
      filteredMovies = dataLoader.getMoviesByRuntimeRange(90, 120);
      typeDescription = 'Medium-Form Content (90-120 minutes)';
    } else if (contentType === 'long') {
      filteredMovies = dataLoader.getMoviesByRuntimeRange(120, 300);
      typeDescription = 'Long-Form Content (>120 minutes)';
    }

    const contentContext = `
CONTENT CREATION STRATEGY ANALYSIS

Content Portfolio Overview:
- Total Content Pieces Analyzed: ${movieStats.totalMovies}
- Average Content Length: ${movieStats.averageRuntime.toFixed(1)} minutes
- Runtime Range: ${movieStats.shortestRuntime} - ${movieStats.longestRuntime} minutes

Content Distribution:
- Short-Form (<90min): ${movieStats.runtimeDistribution.short} pieces (${((movieStats.runtimeDistribution.short / movieStats.totalMovies) * 100).toFixed(1)}%)
- Medium-Form (90-120min): ${movieStats.runtimeDistribution.medium} pieces (${((movieStats.runtimeDistribution.medium / movieStats.totalMovies) * 100).toFixed(1)}%)
- Long-Form (>120min): ${movieStats.runtimeDistribution.long} pieces (${((movieStats.runtimeDistribution.long / movieStats.totalMovies) * 100).toFixed(1)}%)

Analysis Focus: ${typeDescription}
Filtered Results: ${filteredMovies.length} content pieces

CONTENT PERFORMANCE PATTERNS:
- Most common content length: ${movieStats.runtimeDistribution.short > movieStats.runtimeDistribution.medium ? 'Short-form dominates' : 'Medium-form preferred'}
- Content length optimization opportunities
- Platform-specific content strategies
- Audience attention span considerations

Based on this content analysis data, provide comprehensive insights for content creators including:

1. Optimal Content Length Strategies
2. Platform-Specific Recommendations (YouTube, TikTok, Instagram, etc.)
3. Audience Engagement Optimization
4. Content Series vs. Standalone Strategy
5. Production Efficiency Tips
6. Content Distribution Strategies
7. Monetization Through Different Content Lengths
8. Trending Content Format Predictions
9. Cross-platform Content Adaptation
10. Content Creation Workflow Optimization

Focus on actionable strategies for ${typeDescription.toLowerCase()} content creation.
`;

    const aiInsights = await run(contentContext);

    return c.json({
      success: true,
      contentType,
      typeDescription,
      insights: aiInsights,
      contentAnalysis: {
        totalPieces: movieStats.totalMovies,
        averageLength: movieStats.averageRuntime,
        lengthRange: {
          shortest: movieStats.shortestRuntime,
          longest: movieStats.longestRuntime
        },
        distribution: {
          shortForm: {
            count: movieStats.runtimeDistribution.short,
            percentage: ((movieStats.runtimeDistribution.short / movieStats.totalMovies) * 100).toFixed(1)
          },
          mediumForm: {
            count: movieStats.runtimeDistribution.medium,
            percentage: ((movieStats.runtimeDistribution.medium / movieStats.totalMovies) * 100).toFixed(1)
          },
          longForm: {
            count: movieStats.runtimeDistribution.long,
            percentage: ((movieStats.runtimeDistribution.long / movieStats.totalMovies) * 100).toFixed(1)
          }
        }
      },
      recommendations: {
        optimalLength: movieStats.averageRuntime,
        dominantFormat: movieStats.runtimeDistribution.short > movieStats.runtimeDistribution.medium ? 'short-form' : 'medium-form',
        diversificationOpportunity: movieStats.runtimeDistribution.long < movieStats.runtimeDistribution.short ? 'long-form content' : 'short-form content'
      },
      filters: {
        runtimeRange: `${minRuntime} - ${maxRuntime} minutes`,
        resultsCount: filteredMovies.length
      }
    });

  } catch (error) {
    console.error('❌ Content strategy error:', error);
    return c.json({
      success: false,
      error: 'Failed to analyze content strategy',
      details: error instanceof Error ? error.message : 'Unknown error'
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
    const businessStats = dataLoader.getBusinessStats();
    const movieStats = dataLoader.getMoviesStats();

    // Calculate quick insights
    const totalViews = topYouTubeTracks.reduce((sum, track) => sum + track.Views, 0);
    const avgPopularity = topAfroTracks.reduce((sum, track) => sum + track.popularity, 0) / topAfroTracks.length;
    
    const uniqueAfroArtists = [...new Set(topAfroTracks.map(track => track.artist))];
    const uniqueYouTubeArtists = [...new Set(topYouTubeTracks.map(track => track.Artist))];

    return c.json({
      success: true,
      overview: {
        totalDataPoints: stats.concertPrograms + stats.spotifyAfroTracks + stats.spotifyYouTubeTracks + stats.businessRecords + stats.movieRecords,
        musicData: {
          concertPrograms: stats.concertPrograms,
          spotifyAfroTracks: stats.spotifyAfroTracks,
          spotifyYouTubeTracks: stats.spotifyYouTubeTracks
        },
        creatorData: {
          businessRecords: stats.businessRecords,
          movieRecords: stats.movieRecords,
          totalMarketValue: businessStats.totalNetSales,
          averageContentLength: movieStats.averageRuntime
        }
      },
      topPerformers: {
        music: {
          totalViewsTop10: totalViews.toLocaleString(),
          averagePopularityTop10: parseFloat(avgPopularity.toFixed(2)),
          uniqueAfroArtistsTop10: uniqueAfroArtists.length,
          uniqueYouTubeArtistsTop10: uniqueYouTubeArtists.length
        },
        business: {
          topCategory: businessStats.topProductType,
          averageSales: businessStats.averageNetSales,
          uniqueCategories: businessStats.uniqueProductTypes
        },
        content: {
          averageRuntime: movieStats.averageRuntime,
          dominantFormat: movieStats.runtimeDistribution.short > movieStats.runtimeDistribution.medium ? 'short-form' : 'medium-form',
          totalPieces: movieStats.totalMovies
        }
      },
      readyForPrediction: {
        dataLoaded: true,
        aiReady: true,
        suggestedAnalysisLimit: 100,
        availableAnalysis: [
          'Music trends and artist insights',
          'Business market analysis',
          'Content creation strategies',
          'Cross-industry creator insights',
          'Multi-platform growth strategies'
        ],
        recommendedEndpoints: [
          'GET /predict/trends - Music trend analysis',
          'GET /predict/creator-insights - Multi-industry creator insights',
          'GET /predict/business-trends - Business market analysis',
          'GET /predict/content-strategy - Content creation optimization',
          'GET /predict/artist - Artist-specific insights'
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

// In-memory chat storage (in production, use Redis or database)
const chatSessions = new Map<string, ChatSession>();

/**
 * POST /predict/chat
 * Interactive AI chat with memory and comprehensive creator data context
 */
predict.post('/chat', async (c) => {
  try {
    const { prompt, sessionId } = await c.req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return c.json({
        success: false,
        error: 'Prompt is required and must be a string'
      }, 400);
    }

    // Get user info from JWT
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;
    const userCreatorType = jwtPayload?.creatorType || 'general';

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    // Generate or use existing session ID
    const currentSessionId = sessionId || `chat_${userId}_${Date.now()}`;
    
    // Get or create chat session
    let session = chatSessions.get(currentSessionId);
    if (!session) {
      session = {
        id: currentSessionId,
        userId: userId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date()
      };
      chatSessions.set(currentSessionId, session);
    }

    // Update last activity
    session.lastActivity = new Date();

    // Add user message to session
    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    session.messages.push(userMessage);

    // Prepare comprehensive context data
    const stats = dataLoader.getDataStats();
    const topAfroTracks = dataLoader.getTopAfroTracks(10);
    const topYouTubeTracks = dataLoader.getTopYouTubeTracks(10);
    const businessStats = dataLoader.getBusinessStats();
    const movieStats = dataLoader.getMoviesStats();
    const topBusinessSales = dataLoader.getTopBusinessSales(5);

    // Build conversation history for context
    const conversationHistory = session.messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Build comprehensive prompt with all creator data
    const contextualPrompt = `
  AFRISIGHT CREATOR AI ASSISTANT

  USER TYPE: ${userCreatorType.toUpperCase()}
  CONVERSATION HISTORY:
  ${conversationHistory}

  DATA OVERVIEW:
  Music:
  - Concerts: ${stats.concertPrograms}
  - Spotify Afro Tracks: ${stats.spotifyAfroTracks}
  - YouTube Videos: ${stats.spotifyYouTubeTracks}
  Top Tracks:
  ${topAfroTracks.slice(0, 3).map((track, i) => 
    `${i + 1}. "${track.name}" by ${track.artist} (Popularity: ${track.popularity}, Energy: ${track.energy})`
  ).join('\n')}
  Top YouTube:
  ${topYouTubeTracks.slice(0, 3).map((track, i) => 
    `${i + 1}. "${track.Track}" by ${track.Artist} (Views: ${track.Views.toLocaleString()})`
  ).join('\n')}

  Business:
  - Cases: ${businessStats.totalRecords}
  - Market Value: $${businessStats.totalNetSales.toLocaleString()}
  - Top Category: ${businessStats.topProductType}
  Top Performers:
  ${topBusinessSales.slice(0, 3).map((business, i) => 
    `${i + 1}. ${business["Product Type"]} ($${business["Total Net Sales"].toLocaleString()})`
  ).join('\n')}

  Content:
  - Pieces: ${movieStats.totalMovies}
  - Avg Length: ${movieStats.averageRuntime.toFixed(1)} min
  - Short: ${movieStats.runtimeDistribution.short}, Medium: ${movieStats.runtimeDistribution.medium}, Long: ${movieStats.runtimeDistribution.long}

  CROSS-INDUSTRY INSIGHTS:
  - Music: High-energy tracks trend
  - Business: Category success varies
  - Content: ${movieStats.runtimeDistribution.short > movieStats.runtimeDistribution.medium ? 'Short-form dominates' : 'Medium-form preferred'}

  SYSTEM CAPABILITIES:
  - Music, business, content, and cross-industry insights
  - Trend analysis, recommendations, and strategies
  - Multi-platform growth and monetization advice
  - Versatility, do not rely on only the available data sources
  USER QUESTION: ${prompt}

  Provide concise, actionable, data-driven insights for ${userCreatorType} creators. Reference relevant data and trends. Build on previous conversation context. Offer endpoint suggestions for deeper analysis if needed.
  `;

    console.log(`💬 Generating comprehensive AI chat response for ${userCreatorType} creator ${userId}, session ${currentSessionId}`);

    // Generate AI response
    const aiResponse = await run(contextualPrompt);

    // Add AI response to session
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    session.messages.push(assistantMessage);

    // Clean up old sessions (keep last 100 per user)
    const userSessions = Array.from(chatSessions.entries())
      .filter(([_, s]) => s.userId === userId)
      .sort((a, b) => b[1].lastActivity.getTime() - a[1].lastActivity.getTime());

    if (userSessions.length > 100) {
      userSessions.slice(100).forEach(([sessionId]) => {
        chatSessions.delete(sessionId);
      });
    }

    return c.json({
      success: true,
      sessionId: currentSessionId,
      message: aiResponse,
      conversation: {
        messageCount: session.messages.length,
        sessionStarted: session.createdAt,
        lastActivity: session.lastActivity
      },
      context: {
        userCreatorType,
        dataPointsAvailable: stats.concertPrograms + stats.spotifyAfroTracks + stats.spotifyYouTubeTracks + stats.businessRecords + stats.movieRecords,
        dataTypes: ['music', 'business', 'content', 'events'],
        topArtistsReferenced: [...new Set([...topAfroTracks.slice(0, 5).map(t => t.artist), ...topYouTubeTracks.slice(0, 5).map(t => t.Artist)])],
        businessCategoriesAvailable: businessStats.uniqueProductTypes,
        contentFormatsAnalyzed: ['short-form', 'medium-form', 'long-form']
      },
      suggestions: [
        "Ask about music trends and artist strategies",
        "Get business market analysis and entrepreneurship advice", 
        "Explore content creation and platform optimization",
        "Request cross-industry collaboration ideas",
        "Analyze monetization strategies across all verticals",
        "Get personalized insights for your creator type"
      ]
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    return c.json({
      success: false,
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /predict/chat/history
 * Get chat history for current user
 */
predict.get('/chat/history', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    const sessionId = c.req.query('sessionId');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

    if (sessionId) {
      // Get specific session
      const session = chatSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return c.json({
          success: false,
          error: 'Session not found or access denied'
        }, 404);
      }

      return c.json({
        success: true,
        sessionId,
        messages: session.messages.slice(-limit),
        sessionInfo: {
          messageCount: session.messages.length,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        }
      });
    } else {
      // Get all user sessions
      const userSessions = Array.from(chatSessions.entries())
        .filter(([_, session]) => session.userId === userId)
        .sort((a, b) => b[1].lastActivity.getTime() - a[1].lastActivity.getTime())
        .slice(0, 20); // Return last 20 sessions

      return c.json({
        success: true,
        sessions: userSessions.map(([sessionId, session]) => ({
          sessionId,
          messageCount: session.messages.length,
          lastMessage: session.messages[session.messages.length - 1]?.content.substring(0, 100) + '...',
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        }))
      });
    }

  } catch (error) {
    console.error('❌ Chat history error:', error);
    return c.json({
      success: false,
      error: 'Failed to get chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /predict/chat/session
 * Delete a chat session
 */
predict.delete('/chat/session', async (c) => {
  try {
    const { sessionId } = await c.req.json();
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    if (!sessionId) {
      return c.json({
        success: false,
        error: 'Session ID is required'
      }, 400);
    }

    const session = chatSessions.get(sessionId);
    if (!session || session.userId !== userId) {
      return c.json({
        success: false,
        error: 'Session not found or access denied'
      }, 404);
    }

    chatSessions.delete(sessionId);

    return c.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete chat session error:', error);
    return c.json({
      success: false,
      error: 'Failed to delete chat session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default predict;