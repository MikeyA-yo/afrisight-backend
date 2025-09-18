import { Hono } from "hono";
import { eventScraper, ScrapedEvent } from "../lib/scraper";

const events = new Hono();

/**
 * GET /events/scrape
 * Scrape events from both Tix.Africa and Luma
 */
events.get('/scrape', async (c) => {
  try {
    const results = await eventScraper.scrapeAllEvents();
    
    return c.json({
      success: true,
      data: results,
      summary: {
        tixEventsCount: results.tixEvents.length,
        lumaEventsCount: results.lumaEvents.length,
        totalEventsCount: results.totalEvents,
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Events scraping error:', error);
    return c.json({
      success: false,
      error: 'Failed to scrape events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /events/tix
 * Scrape events from Tix.Africa only
 */
events.get('/tix', async (c) => {
  try {
    const tixEvents = await eventScraper.scrapeTixEvents();
    
    return c.json({
      success: true,
      data: {
        events: tixEvents,
        count: tixEvents.length,
        source: 'tix.africa',
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Tix scraping error:', error);
    return c.json({
      success: false,
      error: 'Failed to scrape Tix events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /events/luma
 * Scrape events from Luma only
 */
events.get('/luma', async (c) => {
  try {
    const lumaEvents = await eventScraper.scrapeLumaEvents();
    
    return c.json({
      success: true,
      data: {
        events: lumaEvents,
        count: lumaEvents.length,
        source: 'luma.com',
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Luma scraping error:', error);
    return c.json({
      success: false,
      error: 'Failed to scrape Luma events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /events/lagos
 * Get Lagos-specific events from both platforms
 */
events.get('/lagos', async (c) => {
  try {
    const results = await eventScraper.scrapeAllEvents();
    const lagosEvents = eventScraper.filterEventsByLocation(results.combinedEvents, 'Lagos');
    
    return c.json({
      success: true,
      data: {
        events: lagosEvents,
        count: lagosEvents.length,
        totalScraped: results.totalEvents,
        location: 'Lagos',
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lagos events scraping error:', error);
    return c.json({
      success: false,
      error: 'Failed to scrape Lagos events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /events/free
 * Get free events from both platforms
 */
events.get('/free', async (c) => {
  try {
    const results = await eventScraper.scrapeAllEvents();
    const freeEvents = eventScraper.filterFreeEvents(results.combinedEvents);
    
    return c.json({
      success: true,
      data: {
        events: freeEvents,
        count: freeEvents.length,
        totalScraped: results.totalEvents,
        filter: 'free',
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Free events scraping error:', error);
    return c.json({
      success: false,
      error: 'Failed to scrape free events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /events/search
 * Search events by keyword
 */
events.get('/search', async (c) => {
  try {
    const keyword = c.req.query('q');
    
    if (!keyword) {
      return c.json({
        success: false,
        error: 'Search keyword (q) is required'
      }, 400);
    }

    const results = await eventScraper.scrapeAllEvents();
    const searchResults = eventScraper.searchEvents(results.combinedEvents, keyword);
    
    return c.json({
      success: true,
      data: {
        events: searchResults,
        count: searchResults.length,
        totalScraped: results.totalEvents,
        searchKeyword: keyword,
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Event search error:', error);
    return c.json({
      success: false,
      error: 'Failed to search events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default events;