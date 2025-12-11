'use server';

import * as cheerio from 'cheerio';
import { ScrapedEventData } from '@/lib/types';

export async function scrapeEventUrl(url: string): Promise<ScrapedEventData | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GatherXbot/1.0; +http://gatherx.io)'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const data: ScrapedEventData = {};

    // 1. Try Open Graph Tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogSite = $('meta[property="og:site_name"]').attr('content');

    if (ogTitle) data.title = ogTitle;
    if (ogDesc) data.description = ogDesc;
    if (ogImage) data.imageUrl = ogImage;
    if (ogSite) data.source = ogSite;

    // 2. Try JSON-LD (Common in Eventbrite, Luma, Partiful)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        // Handle array of objects or single object
        const items = Array.isArray(json) ? json : [json];
        
        const event = items.find(item => 
          item['@type'] === 'Event' || item['@type'] === 'MusicEvent' || item['@type'] === 'SocialEvent'
        );

        if (event) {
          if (event.name) data.title = event.name;
          if (event.description) data.description = event.description;
          if (event.startDate) data.date = event.startDate; // ISO String often works
          if (event.location) {
             if (typeof event.location === 'string') {
                 data.location = event.location;
             } else if (event.location.name) {
                 data.location = event.location.name;
                 if (event.location.address && event.location.address.addressLocality) {
                     data.location += `, ${event.location.address.addressLocality}`;
                 }
             }
          }
          if (event.image) {
             if (typeof event.image === 'string') data.imageUrl = event.image;
             else if (Array.isArray(event.image)) data.imageUrl = event.image[0];
          }
        }
      } catch (e) {
        console.error("Error parsing JSON-LD", e);
      }
    });

    return data;
  } catch (error) {
    console.error("Error scraping event URL:", error);
    return null;
  }
}
