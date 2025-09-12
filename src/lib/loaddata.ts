// Import JSON data directly
import concertData from '../data/dataconcers2011-.json';
import spotifyAfroData from '../data/spotifyafro.json';
import spotifyYouTubeData from '../data/spotifyyoutubedataset.json';

// Interface for Concert Data (dataconcers2011-.json)
export interface Concert {
  eventType: string;
  Location: string;
  Venue: string;
  Date: string;
  Time: string;
}

export interface WorkItem {
  ID?: string;
  composerName?: string;
  workTitle?: string;
  conductorName?: string;
  soloists: any[];
  interval?: string;
}

export interface Program {
  id: string;
  programID: string;
  orchestra: string;
  season: string;
  concerts: Concert[];
  works?: WorkItem[];
}

export interface ConcertData {
  programs: Program[];
}

// Interface for Spotify Afro Data (spotifyafro.json)
export interface SpotifyAfroTrack {
  name: string;
  album: string;
  artist: string;
  release_date: string;
  length: number;
  popularity: number;
  danceability: number | number[];
  acousticness: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  valence: number;
  key: number;
}

// Interface for Spotify YouTube Dataset (spotifyyoutubedataset.json)
export interface SpotifyYouTubeTrack {
  FIELD1: number;
  Artist: string;
  Url_spotify: string;
  Track: string;
  Album: string;
  Album_type: string;
  Uri: string;
  Danceability: number;
  Energy: number;
  Key: number;
  Loudness: number;
  Speechiness: number;
  Acousticness: number;
  Instrumentalness: number;
  Liveness: number;
  Valence: number;
  Tempo: number;
  Duration_ms: number;
  Url_youtube: string;
  Title: string;
  Channel: string;
  Views: number;
  Likes: number;
  Comments: number;
  Description: string;
  Licensed: boolean;
  official_video: boolean;
  Stream: number;
}

// Data loader class
export class DataLoader {
  private static instance: DataLoader;
  private concertData: ConcertData | null = null;
  private spotifyAfroData: SpotifyAfroTrack[] | null = null;
  private spotifyYouTubeData: SpotifyYouTubeTrack[] | null = null;

  private constructor() {}

  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Load concert data from imported JSON
   */
  public loadConcertData(): ConcertData {
    if (this.concertData) {
      return this.concertData;
    }

    try {
      this.concertData = concertData as ConcertData;
      console.log(`Loaded ${this.concertData.programs.length} concert programs`);
      return this.concertData;
    } catch (error) {
      console.error('Error loading concert data:', error);
      throw new Error('Failed to load concert data');
    }
  }

  /**
   * Load Spotify Afro data from imported JSON
   */
  public loadSpotifyAfroData(): SpotifyAfroTrack[] {
    if (this.spotifyAfroData) {
      return this.spotifyAfroData;
    }

    try {
      this.spotifyAfroData = (spotifyAfroData as any[]).map((track) => ({
        ...track,
        valence: track.valence ?? 0,
        key: track.key ?? 0,
      })) as SpotifyAfroTrack[];
      console.log(`Loaded ${this.spotifyAfroData.length} Spotify Afro tracks`);
      return this.spotifyAfroData;
    } catch (error) {
      console.error('Error loading Spotify Afro data:', error);
      throw new Error('Failed to load Spotify Afro data');
    }
  }

  /**
   * Load Spotify YouTube data from imported JSON
   */
  public loadSpotifyYouTubeData(): SpotifyYouTubeTrack[] {
    if (this.spotifyYouTubeData) {
      return this.spotifyYouTubeData;
    }

    try {
      this.spotifyYouTubeData = spotifyYouTubeData as SpotifyYouTubeTrack[];
      console.log(`Loaded ${this.spotifyYouTubeData.length} Spotify YouTube tracks`);
      return this.spotifyYouTubeData;
    } catch (error) {
      console.error('Error loading Spotify YouTube data:', error);
      throw new Error('Failed to load Spotify YouTube data');
    }
  }

  /**
   * Load all data sets
   */
  public loadAllData(): {
    concerts: ConcertData;
    spotifyAfro: SpotifyAfroTrack[];
    spotifyYouTube: SpotifyYouTubeTrack[];
  } {
    return {
      concerts: this.loadConcertData(),
      spotifyAfro: this.loadSpotifyAfroData(),
      spotifyYouTube: this.loadSpotifyYouTubeData(),
    };
  }

  /**
   * Get data statistics
   */
  public getDataStats(): {
    concertPrograms: number;
    spotifyAfroTracks: number;
    spotifyYouTubeTracks: number;
  } {
    return {
      concertPrograms: this.concertData?.programs.length || 0,
      spotifyAfroTracks: this.spotifyAfroData?.length || 0,
      spotifyYouTubeTracks: this.spotifyYouTubeData?.length || 0,
    };
  }

  /**
   * Search for tracks by artist in Spotify Afro data
   */
  public searchAfroTracksByArtist(artist: string): SpotifyAfroTrack[] {
    if (!this.spotifyAfroData) {
      this.loadSpotifyAfroData();
    }
    
    return this.spotifyAfroData?.filter(track => 
      track.artist.toLowerCase().includes(artist.toLowerCase())
    ) || [];
  }

  /**
   * Search for tracks by artist in Spotify YouTube data
   */
  public searchYouTubeTracksByArtist(artist: string): SpotifyYouTubeTrack[] {
    if (!this.spotifyYouTubeData) {
      this.loadSpotifyYouTubeData();
    }
    
    return this.spotifyYouTubeData?.filter(track => 
      track.Artist.toLowerCase().includes(artist.toLowerCase())
    ) || [];
  }

  /**
   * Get top tracks by popularity from Spotify Afro data
   */
  public getTopAfroTracks(limit: number = 10): SpotifyAfroTrack[] {
    if (!this.spotifyAfroData) {
      this.loadSpotifyAfroData();
    }
    
    return this.spotifyAfroData
      ?.sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit) || [];
  }

  /**
   * Get top tracks by views from Spotify YouTube data
   */
  public getTopYouTubeTracks(limit: number = 10): SpotifyYouTubeTrack[] {
    if (!this.spotifyYouTubeData) {
      this.loadSpotifyYouTubeData();
    }
    
    return this.spotifyYouTubeData
      ?.sort((a, b) => b.Views - a.Views)
      .slice(0, limit) || [];
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();