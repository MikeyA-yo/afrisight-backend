import { load } from 'cheerio';

// Event interface for scraped data
export interface ScrapedEvent {
  name: string;
  price: string;
  location: string;
  imageUrl: string;
  eventUrl?: string;
  date?: string;
  source: 'tix' | 'luma';
}

// Scraper configuration
const SCRAPER_CONFIG = {
  tix: {
    baseUrl: "https://tix.africa",
    discoverUrl: "https://tix.africa/discover?category=art%20%26%20culture",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  luma: {
    baseUrl: "https://luma.com",
    discoverUrl: "https://luma.com/discover",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
};

/**
 * Scraper class for extracting events from Tix.Africa and Luma
 */
export class EventScraper {
  private static instance: EventScraper;

  private constructor() {}

  public static getInstance(): EventScraper {
    if (!EventScraper.instance) {
      EventScraper.instance = new EventScraper();
    }
    return EventScraper.instance;
  }

  /**
   * Scrape events from Tix.Africa
   */
  public async scrapeTixEvents(): Promise<ScrapedEvent[]> {
    try {
      console.log('🎫 Scraping events from Tix.Africa...');
      
      const response = await fetch(SCRAPER_CONFIG.tix.discoverUrl, {
        headers: {
          'User-Agent': SCRAPER_CONFIG.tix.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Tix data: ${response.status}`);
      }

      const html = await response.text();
      console.log(html)
      return this.parseTixHTML(html);

    } catch (error) {
      console.error('❌ Error scraping Tix events:', error);
      return [];
    }
  }

  /**
   * Scrape events from Luma
   */
  public async scrapeLumaEvents(): Promise<ScrapedEvent[]> {
    try {
      console.log('📅 Scraping events from Luma...');
      
      const response = await fetch(SCRAPER_CONFIG.luma.discoverUrl, {
        headers: {
          'User-Agent': SCRAPER_CONFIG.luma.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Luma data: ${response.status}`);
      }

      const html = await response.text();
      return this.parseLumaHTML(html);

    } catch (error) {
      console.error('❌ Error scraping Luma events:', error);
      return [];
    }
  }

  /**
   * Parse Tix.Africa HTML and extract events
   */
  private parseTixHTML(html: string): ScrapedEvent[] {
    const $ = load(html);
    const events: ScrapedEvent[] = [];

    // Tix uses: .discover-events_card for each event
    $('.discover-events_card').each((index, element) => {
      try {
        const $event = $(element);
        
        // Extract event name
        const name = $event.find('.discover-events_card-details-info p').first().text().trim();
        
        // Extract price
        const priceElement = $event.find('.discover-events_card-details-price');
        let price = priceElement.text().trim();
        // Handle different price formats
        if (!price || price === '') {
          price = 'Free';
        }
        
        // Extract location
        const locationElement = $event.find('.info').last().find('p');
        const location = locationElement.text().trim();
        
        // Extract image URL
        const imageUrl = $event.find('img').attr('src') || '';
        
        // Extract event URL
        const eventUrl = $event.attr('href') || '';
        const fullEventUrl = eventUrl.startsWith('/') ? 
          `${SCRAPER_CONFIG.tix.baseUrl}${eventUrl}` : eventUrl;
        
        // Extract date
        const dateElement = $event.find('.info').first().find('p');
        const date = dateElement.text().trim();

        // Only add events with valid data
        if (name && location) {
          events.push({
            name,
            price,
            location,
            imageUrl,
            eventUrl: fullEventUrl,
            date,
            source: 'tix'
          });
        }

      } catch (error) {
        console.error(`Error parsing Tix event ${index}:`, error);
      }
    });

    console.log(`✅ Scraped ${events.length} events from Tix.Africa`);
    return events;
  }

  /**
   * Parse Luma HTML and extract events
   */
  private parseLumaHTML(html: string): ScrapedEvent[] {
    const $ = load(html);
    const events: ScrapedEvent[] = [];

    // Luma uses: .event-row for each event
    $('.event-row').each((index, element) => {
      try {
        const $event = $(element);
        
        // Extract event name
        const name = $event.find('.event-title h3 .lux-line-clamp').text().trim();
        
        // Extract location
        const locationElement = $event.find('.meta-row .text-ellipses').last();
        const location = locationElement.text().trim();
        
        // Extract image URL
        const imageUrl = $event.find('.cover-image img').attr('src') || '';
        
        // Extract event URL
        const eventUrl = $event.find('.event-link').attr('href') || '';
        const fullEventUrl = eventUrl.startsWith('/') ? 
          `${SCRAPER_CONFIG.luma.baseUrl}${eventUrl}` : eventUrl;
        
        // Extract date/time
        const dateElement = $event.find('.event-time span');
        const date = dateElement.text().trim();

        // Luma events are typically free or have pricing on detail page
        const price = 'Check Event Page';

        // Only add events with valid data
        if (name && location) {
          events.push({
            name,
            price,
            location,
            imageUrl,
            eventUrl: fullEventUrl,
            date,
            source: 'luma'
          });
        }

      } catch (error) {
        console.error(`Error parsing Luma event ${index}:`, error);
      }
    });

    console.log(`✅ Scraped ${events.length} events from Luma`);
    return events;
  }

  /**
   * Scrape events from both platforms
   */
  public async scrapeAllEvents(): Promise<{
    tixEvents: ScrapedEvent[];
    lumaEvents: ScrapedEvent[];
    totalEvents: number;
    combinedEvents: ScrapedEvent[];
  }> {
    console.log('🚀 Starting comprehensive event scraping...');
    
    const [tixEvents, lumaEvents] = await Promise.allSettled([
      this.scrapeTixEvents(),
      this.scrapeLumaEvents()
    ]);

    const tixResults = tixEvents.status === 'fulfilled' ? tixEvents.value : [];
    const lumaResults = lumaEvents.status === 'fulfilled' ? lumaEvents.value : [];

    const combinedEvents = [...tixResults, ...lumaResults];
    
    console.log(`📊 Scraping Summary:`);
    console.log(`   - Tix.Africa: ${tixResults.length} events`);
    console.log(`   - Luma: ${lumaResults.length} events`);
    console.log(`   - Total: ${combinedEvents.length} events`);

    return {
      tixEvents: tixResults,
      lumaEvents: lumaResults,
      totalEvents: combinedEvents.length,
      combinedEvents
    };
  }

  /**
   * Filter events by location (useful for Lagos-specific events)
   */
  public filterEventsByLocation(events: ScrapedEvent[], locationKeyword: string = 'Lagos'): ScrapedEvent[] {
    return events.filter(event => 
      event.location.toLowerCase().includes(locationKeyword.toLowerCase())
    );
  }

  /**
   * Filter free events
   */
  public filterFreeEvents(events: ScrapedEvent[]): ScrapedEvent[] {
    return events.filter(event => 
      event.price.toLowerCase().includes('free') || 
      event.price === '₦0' ||
      event.price === ''
    );
  }

  /**
   * Get events by price range (for Tix events with Nigerian Naira)
   */
  public filterEventsByPriceRange(events: ScrapedEvent[], minPrice: number = 0, maxPrice: number = 100000): ScrapedEvent[] {
    return events.filter(event => {
      // Extract numeric price from Nigerian Naira format
      const priceMatch = event.price.match(/₦([\d,]+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1].replace(/,/g, ''));
        return price >= minPrice && price <= maxPrice;
      }
      // Include free events in low price range
      if (minPrice === 0 && (event.price.toLowerCase().includes('free') || event.price === '')) {
        return true;
      }
      return false;
    });
  }

  /**
   * Search events by keyword in name
   */
  public searchEvents(events: ScrapedEvent[], keyword: string): ScrapedEvent[] {
    return events.filter(event =>
      event.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

// Export singleton instance
export const eventScraper = EventScraper.getInstance();

