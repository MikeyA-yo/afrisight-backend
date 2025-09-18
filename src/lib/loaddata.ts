// Import JSON data directly
import concertData from '../data/dataconcers2011-.json';
import spotifyAfroData from '../data/spotifyafro.json';
import spotifyYouTubeData from '../data/spotifyyoutubedataset.json';
import businessData from '../data/business.retailsales.json';
import moviesData from '../data/movies.json';

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

// Interface for Business Retail Sales Data (business.retailsales.json)
export interface BusinessSale {
  "Product Type": string;
  "Net Quantity": number;
  "Gross Sales": number;
  "Discounts": number;
  "Returns": number;
  "Total Net Sales": number;
}

// Interface for Movies Data (movies.json)
export interface Movie {
  runtime: number;
}

// Data loader class
export class DataLoader {
  private static instance: DataLoader;
  private concertData: ConcertData | null = null;
  private spotifyAfroData: SpotifyAfroTrack[] | null = null;
  private spotifyYouTubeData: SpotifyYouTubeTrack[] | null = null;
  private businessData: BusinessSale[] | null = null;
  private moviesData: Movie[] | null = null;

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
   * Load business retail sales data from imported JSON (limited to 500 entries)
   */
  public loadBusinessData(): BusinessSale[] {
    if (this.businessData) {
      return this.businessData;
    }

    try {
      const rawData = businessData as BusinessSale[];
      // Limit to 500 entries
      this.businessData = rawData.slice(0, 500);
      console.log(`Loaded ${this.businessData.length} business sales records (limited to 500)`);
      return this.businessData;
    } catch (error) {
      console.error('Error loading business data:', error);
      throw new Error('Failed to load business data');
    }
  }

  /**
   * Load movies data from imported JSON (limited to 500 entries)
   */
  public loadMoviesData(): Movie[] {
    if (this.moviesData) {
      return this.moviesData;
    }

    try {
      const rawData = moviesData as Movie[];
      // Limit to 500 entries
      this.moviesData = rawData.slice(0, 500);
      console.log(`Loaded ${this.moviesData.length} movie records (limited to 500)`);
      return this.moviesData;
    } catch (error) {
      console.error('Error loading movies data:', error);
      throw new Error('Failed to load movies data');
    }
  }

  /**
   * Load all data sets
   */
  public loadAllData(): {
    concerts: ConcertData;
    spotifyAfro: SpotifyAfroTrack[];
    spotifyYouTube: SpotifyYouTubeTrack[];
    business: BusinessSale[];
    movies: Movie[];
  } {
    return {
      concerts: this.loadConcertData(),
      spotifyAfro: this.loadSpotifyAfroData(),
      spotifyYouTube: this.loadSpotifyYouTubeData(),
      business: this.loadBusinessData(),
      movies: this.loadMoviesData(),
    };
  }

  /**
   * Get data statistics
   */
  public getDataStats(): {
    concertPrograms: number;
    spotifyAfroTracks: number;
    spotifyYouTubeTracks: number;
    businessRecords: number;
    movieRecords: number;
  } {
    return {
      concertPrograms: this.concertData?.programs.length || 0,
      spotifyAfroTracks: this.spotifyAfroData?.length || 0,
      spotifyYouTubeTracks: this.spotifyYouTubeData?.length || 0,
      businessRecords: this.businessData?.length || 0,
      movieRecords: this.moviesData?.length || 0,
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

  /**
   * Get top business sales by total net sales
   */
  public getTopBusinessSales(limit: number = 10): BusinessSale[] {
    if (!this.businessData) {
      this.loadBusinessData();
    }
    
    return this.businessData
      ?.sort((a, b) => b["Total Net Sales"] - a["Total Net Sales"])
      .slice(0, limit) || [];
  }

  /**
   * Search business data by product type
   */
  public searchBusinessByProductType(productType: string): BusinessSale[] {
    if (!this.businessData) {
      this.loadBusinessData();
    }
    
    return this.businessData?.filter(sale => 
      sale["Product Type"].toLowerCase().includes(productType.toLowerCase())
    ) || [];
  }

  /**
   * Get business sales statistics
   */
  public getBusinessStats(): {
    totalRecords: number;
    totalNetSales: number;
    averageNetSales: number;
    topProductType: string;
    uniqueProductTypes: number;
  } {
    if (!this.businessData) {
      this.loadBusinessData();
    }

    if (!this.businessData?.length) {
      return {
        totalRecords: 0,
        totalNetSales: 0,
        averageNetSales: 0,
        topProductType: '',
        uniqueProductTypes: 0
      };
    }

    const totalNetSales = this.businessData.reduce((sum, sale) => sum + sale["Total Net Sales"], 0);
    const averageNetSales = totalNetSales / this.businessData.length;
    
    // Get top product type by total sales
    const productTypeSales = this.businessData.reduce((acc, sale) => {
      const productType = sale["Product Type"];
      acc[productType] = (acc[productType] || 0) + sale["Total Net Sales"];
      return acc;
    }, {} as Record<string, number>);

    const topProductType = Object.entries(productTypeSales)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    const uniqueProductTypes = Object.keys(productTypeSales).length;

    return {
      totalRecords: this.businessData.length,
      totalNetSales,
      averageNetSales,
      topProductType,
      uniqueProductTypes
    };
  }

  /**
   * Get movies statistics
   */
  public getMoviesStats(): {
    totalMovies: number;
    averageRuntime: number;
    shortestRuntime: number;
    longestRuntime: number;
    runtimeDistribution: {
      short: number; // < 90 minutes
      medium: number; // 90-120 minutes
      long: number; // > 120 minutes
    };
  } {
    if (!this.moviesData) {
      this.loadMoviesData();
    }

    if (!this.moviesData?.length) {
      return {
        totalMovies: 0,
        averageRuntime: 0,
        shortestRuntime: 0,
        longestRuntime: 0,
        runtimeDistribution: { short: 0, medium: 0, long: 0 }
      };
    }

    const runtimes = this.moviesData.map(movie => movie.runtime);
    const totalRuntime = runtimes.reduce((sum, runtime) => sum + runtime, 0);
    const averageRuntime = totalRuntime / runtimes.length;
    const shortestRuntime = Math.min(...runtimes);
    const longestRuntime = Math.max(...runtimes);

    const runtimeDistribution = runtimes.reduce((acc, runtime) => {
      if (runtime < 90) acc.short++;
      else if (runtime <= 120) acc.medium++;
      else acc.long++;
      return acc;
    }, { short: 0, medium: 0, long: 0 });

    return {
      totalMovies: this.moviesData.length,
      averageRuntime,
      shortestRuntime,
      longestRuntime,
      runtimeDistribution
    };
  }

  /**
   * Get movies by runtime range
   */
  public getMoviesByRuntimeRange(minRuntime: number = 0, maxRuntime: number = 500): Movie[] {
    if (!this.moviesData) {
      this.loadMoviesData();
    }
    
    return this.moviesData?.filter(movie => 
      movie.runtime >= minRuntime && movie.runtime <= maxRuntime
    ) || [];
  }

  /**
   * Get business sales by net sales range
   */
  public getBusinessSalesByRange(minSales: number = 0, maxSales: number = 50000): BusinessSale[] {
    if (!this.businessData) {
      this.loadBusinessData();
    }
    
    return this.businessData?.filter(sale => 
      sale["Total Net Sales"] >= minSales && sale["Total Net Sales"] <= maxSales
    ) || [];
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();