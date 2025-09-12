import { run } from "./genai";
import { dataLoader, SpotifyAfroTrack, SpotifyYouTubeTrack } from "./loaddata";

export interface TrendAnalysis {
  topGenres: string[];
  emergingArtists: string[];
  popularEvents: string[];
  concertTrends: string[];
  marketingSuggestions: string[];
  collaborationIdeas: string[];
  venueRecommendations: string[];
}

export interface PredictiveInsights {
  analysis: TrendAnalysis;
  rawAiResponse: string;
  dataUsed: {
    afroTracksCount: number;
    youtubeTracksCount: number;
    totalViews: number;
    totalStreams: number;
  };
  timestamp: string;
}

export class AIPredictiveAnalysis {
  private static instance: AIPredictiveAnalysis;

  private constructor() {}

  public static getInstance(): AIPredictiveAnalysis {
    if (!AIPredictiveAnalysis.instance) {
      AIPredictiveAnalysis.instance = new AIPredictiveAnalysis();
    }
    return AIPredictiveAnalysis.instance;
  }

  /**
   * Prepare data summary for AI analysis
   */
  private prepareDataSummary(limit: number = 100): {
    afroTracks: SpotifyAfroTrack[];
    youtubeTracks: SpotifyYouTubeTrack[];
    summary: string;
    stats: any;
  } {
    // Get top performing tracks
    const topAfroTracks = dataLoader.getTopAfroTracks(limit);
    const topYouTubeTracks = dataLoader.getTopYouTubeTracks(limit);

    // Calculate statistics
    const totalViews = topYouTubeTracks.reduce(
      (sum, track) => sum + track.Views,
      0
    );
    const totalStreams = topYouTubeTracks.reduce(
      (sum, track) => sum + track.Stream,
      0
    );
    const avgPopularity =
      topAfroTracks.reduce((sum, track) => sum + track.popularity, 0) /
      topAfroTracks.length;

    // Extract unique artists
    const afroArtists = [
      ...new Set(topAfroTracks.map((track) => track.artist)),
    ];
    const youtubeArtists = [
      ...new Set(topYouTubeTracks.map((track) => track.Artist)),
    ];

    // Audio feature analysis
    const avgEnergy =
      topAfroTracks.reduce((sum, track) => sum + track.energy, 0) /
      topAfroTracks.length;
    const avgDanceability =
      topAfroTracks.reduce((sum, track) => {
        const dance = Array.isArray(track.danceability)
          ? track.danceability[0]
          : track.danceability;
        return sum + dance;
      }, 0) / topAfroTracks.length;
    const avgTempo =
      topAfroTracks.reduce((sum, track) => sum + track.tempo, 0) /
      topAfroTracks.length;

    const summary = `
MUSIC DATA ANALYSIS - TOP ${limit} PERFORMING TRACKS

=== SPOTIFY AFRO TRACKS ANALYSIS ===
Total Tracks: ${topAfroTracks.length}
Top Artists: ${afroArtists.slice(0, 10).join(", ")}
Average Popularity: ${avgPopularity.toFixed(2)}
Average Energy: ${avgEnergy.toFixed(3)}
Average Danceability: ${avgDanceability.toFixed(3)}
Average Tempo: ${avgTempo.toFixed(1)} BPM

Top 10 Most Popular Afro Tracks:
${topAfroTracks
  .slice(0, 10)
  .map(
    (track, i) =>
      `${i + 1}. "${track.name}" by ${track.artist} (${
        track.album
      }) - Popularity: ${track.popularity}`
  )
  .join("\n")}

=== YOUTUBE TRACKS ANALYSIS ===
Total Tracks: ${topYouTubeTracks.length}
Top Artists: ${youtubeArtists.slice(0, 10).join(", ")}
Total Views: ${totalViews.toLocaleString()}
Total Streams: ${totalStreams.toLocaleString()}

Top 10 Most Viewed YouTube Tracks:
${topYouTubeTracks
  .slice(0, 10)
  .map(
    (track, i) =>
      `${i + 1}. "${track.Track}" by ${track.Artist} (${
        track.Album
      }) - Views: ${track.Views.toLocaleString()}, Likes: ${track.Likes.toLocaleString()}`
  )
  .join("\n")}

=== AUDIO FEATURES TRENDS ===
Energy Level: ${
      avgEnergy > 0.7 ? "High" : avgEnergy > 0.4 ? "Medium" : "Low"
    } (${avgEnergy.toFixed(3)})
Danceability: ${
      avgDanceability > 0.7 ? "High" : avgDanceability > 0.4 ? "Medium" : "Low"
    } (${avgDanceability.toFixed(3)})
Tempo Range: ${avgTempo.toFixed(1)} BPM (${
      avgTempo > 120 ? "Fast" : avgTempo > 90 ? "Medium" : "Slow"
    })

=== RELEASE PATTERNS ===
Recent Releases: ${
      topAfroTracks.filter(
        (track) => new Date(track.release_date) > new Date("2020-01-01")
      ).length
    } tracks from 2020+
`;

    return {
      afroTracks: topAfroTracks,
      youtubeTracks: topYouTubeTracks,
      summary,
      stats: {
        afroTracksCount: topAfroTracks.length,
        youtubeTracksCount: topYouTubeTracks.length,
        totalViews,
        totalStreams,
        avgPopularity,
        avgEnergy,
        avgDanceability,
        avgTempo,
      },
    };
  }

  /**
   * Generate AI-powered trend analysis and predictions
   */
  public async generateTrendAnalysis(
    limit: number = 100
  ): Promise<PredictiveInsights> {
    try {
      const { summary, stats } = this.prepareDataSummary(limit);

      const prompt = `
${summary}

As a music industry expert and data analyst, please analyze this data and provide detailed insights in the following format:

## TOP GENRES PREDICTION
Based on the audio features, artist patterns, and popularity metrics, identify and rank the top 5-7 genres that are trending or will trend.

## EMERGING ARTISTS ANALYSIS
Identify 5-8 artists who show strong potential based on their track performance, engagement metrics, and growth patterns.

## POPULAR EVENTS & CONCERT TRENDS
Suggest 5-7 types of events, concert formats, or festival themes that would be successful based on this data.

## MARKET TRENDS & INSIGHTS
Provide 5-7 key market trends, consumer preferences, and industry directions based on the audio features and performance metrics.

## MARKETING SUGGESTIONS
Give 5-7 specific marketing strategies and promotional ideas that would work well with these trending patterns.

## COLLABORATION IDEAS
Suggest 5-7 collaboration opportunities, cross-genre fusions, or partnership ideas based on artist and genre patterns.

## VENUE RECOMMENDATIONS
Recommend 5-7 types of venues, locations, or event formats that would be ideal for these trending musical styles.

Please be specific, actionable, and data-driven in your recommendations. Consider the high danceability (${stats.avgDanceability.toFixed(
        3
      )}), energy levels (${stats.avgEnergy.toFixed(
        3
      )}), and tempo patterns (${stats.avgTempo.toFixed(
        1
      )} BPM) in your analysis.
`;

      console.log("Sending data to AI for trend analysis...");
      const aiResponse = await run(prompt);

      // Parse AI response into structured format
      const analysis = this.parseAIResponse(aiResponse);

      return {
        analysis,
        rawAiResponse: aiResponse,
        dataUsed: {
          afroTracksCount: stats.afroTracksCount,
          youtubeTracksCount: stats.youtubeTracksCount,
          totalViews: stats.totalViews,
          totalStreams: stats.totalStreams,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating trend analysis:", error);
      throw new Error(
        `Failed to generate trend analysis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiResponse: string): TrendAnalysis {
    const sections = {
      topGenres: this.extractSection(
        aiResponse,
        "TOP GENRES",
        "EMERGING ARTISTS"
      ),
      emergingArtists: this.extractSection(
        aiResponse,
        "EMERGING ARTISTS",
        "POPULAR EVENTS"
      ),
      popularEvents: this.extractSection(
        aiResponse,
        "POPULAR EVENTS",
        "MARKET TRENDS"
      ),
      concertTrends: this.extractSection(
        aiResponse,
        "MARKET TRENDS",
        "MARKETING SUGGESTIONS"
      ),
      marketingSuggestions: this.extractSection(
        aiResponse,
        "MARKETING SUGGESTIONS",
        "COLLABORATION IDEAS"
      ),
      collaborationIdeas: this.extractSection(
        aiResponse,
        "COLLABORATION IDEAS",
        "VENUE RECOMMENDATIONS"
      ),
      venueRecommendations: this.extractSection(
        aiResponse,
        "VENUE RECOMMENDATIONS",
        ""
      ),
    };

    return {
      topGenres: this.extractListItems(sections.topGenres),
      emergingArtists: this.extractListItems(sections.emergingArtists),
      popularEvents: this.extractListItems(sections.popularEvents),
      concertTrends: this.extractListItems(sections.concertTrends),
      marketingSuggestions: this.extractListItems(
        sections.marketingSuggestions
      ),
      collaborationIdeas: this.extractListItems(sections.collaborationIdeas),
      venueRecommendations: this.extractListItems(
        sections.venueRecommendations
      ),
    };
  }

  /**
   * Extract section content between headers
   */
  private extractSection(
    text: string,
    startHeader: string,
    endHeader: string
  ): string {
    const startIndex = text.indexOf(startHeader);
    if (startIndex === -1) return "";

    const endIndex = endHeader
      ? text.indexOf(endHeader, startIndex)
      : text.length;
    const section = text.substring(
      startIndex,
      endIndex === -1 ? text.length : endIndex
    );

    return section.replace(startHeader, "").trim();
  }

  /**
   * Extract list items from text section
   */
  private extractListItems(text: string): string[] {
    if (!text) return [];

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const items: string[] = [];

    for (const line of lines) {
      // Match numbered lists, bullet points, or dash lists
      const match = line.match(/^[\d]+\.?\s*(.+)|^[-•*]\s*(.+)|^(.+)$/);
      if (match) {
        const item = (match[1] || match[2] || match[3]).trim();
        if (item && item.length > 10) {
          // Filter out headers and short items
          items.push(item);
        }
      }
    }

    return items.slice(0, 7); // Limit to 7 items per category
  }

  /**
   * Generate quick insights for specific artist
   */
  public async generateArtistInsights(artistName: string): Promise<string> {
    const afroTracks = dataLoader.searchAfroTracksByArtist(artistName);
    const youtubeTracks = dataLoader.searchYouTubeTracksByArtist(artistName);

    if (afroTracks.length === 0 && youtubeTracks.length === 0) {
      throw new Error(`No data found for artist: ${artistName}`);
    }

    const artistData = `
ARTIST ANALYSIS: ${artistName}

Spotify Afro Tracks: ${afroTracks.length}
${afroTracks
  .slice(0, 5)
  .map(
    (track) =>
      `- "${track.name}" (${track.album}) - Popularity: ${
        track.popularity
      }, Energy: ${track.energy.toFixed(3)}`
  )
  .join("\n")}

YouTube Tracks: ${youtubeTracks.length}
${youtubeTracks
  .slice(0, 5)
  .map(
    (track) =>
      `- "${track.Track}" (${
        track.Album
      }) - Views: ${track.Views.toLocaleString()}, Likes: ${track.Likes.toLocaleString()}`
  )
  .join("\n")}
`;

    const prompt = `
${artistData}

Analyze this artist's performance and provide insights about their market position, musical style, audience engagement, and recommendations for future success. Keep it concise but insightful.
`;

    return await run(prompt);
  }
}

// Export singleton instance
export const aiPredictiveAnalysis = AIPredictiveAnalysis.getInstance();
