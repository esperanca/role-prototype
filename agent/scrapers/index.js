import { scrapeSesc } from './sesc.js';
import { scrapeAgendaSP } from './agendasp.js';
import { scrapeItauCultural } from './itaucultural.js';
import { scrapeCCSP } from './ccsp.js';
import { scrapePinacoteca, scrapeMASP, scrapeJapanHouse } from './museus.js';
import { scrapeCatracaLivre } from './catracalivre.js';

export const scrapers = {
  sesc: {
    name: 'SESC São Paulo',
    scrape: scrapeSesc,
    enabled: true
  },
  agendasp: {
    name: 'Agenda Cultural SP',
    scrape: scrapeAgendaSP,
    enabled: true
  },
  itaucultural: {
    name: 'Itaú Cultural',
    scrape: scrapeItauCultural,
    enabled: true
  },
  ccsp: {
    name: 'Centro Cultural São Paulo',
    scrape: scrapeCCSP,
    enabled: true
  },
  pinacoteca: {
    name: 'Pinacoteca de São Paulo',
    scrape: scrapePinacoteca,
    enabled: true
  },
  masp: {
    name: 'MASP',
    scrape: scrapeMASP,
    enabled: true
  },
  japanhouse: {
    name: 'Japan House',
    scrape: scrapeJapanHouse,
    enabled: true
  },
  catracalivre: {
    name: 'Catraca Livre',
    scrape: scrapeCatracaLivre,
    enabled: true
  }
};

/**
 * Executa todos os scrapers habilitados
 */
export async function scrapeAll(options = {}) {
  const results = {
    events: [],
    errors: [],
    sources: []
  };

  for (const [id, scraper] of Object.entries(scrapers)) {
    if (!scraper.enabled) continue;

    try {
      console.log(`\n--- ${scraper.name} ---`);
      const events = await scraper.scrape(options);

      for (const event of events) {
        results.events.push({
          ...event,
          _source: id
        });
      }

      results.sources.push({
        id,
        name: scraper.name,
        count: events.length,
        success: true
      });

    } catch (err) {
      console.error(`Erro no scraper ${id}:`, err.message);
      results.errors.push({
        source: id,
        error: err.message
      });
      results.sources.push({
        id,
        name: scraper.name,
        count: 0,
        success: false,
        error: err.message
      });
    }
  }

  return results;
}

/**
 * Executa um scraper específico
 */
export async function scrapeSource(sourceId, options = {}) {
  const scraper = scrapers[sourceId];
  if (!scraper) {
    throw new Error(`Scraper não encontrado: ${sourceId}`);
  }

  return scraper.scrape(options);
}

export default { scrapers, scrapeAll, scrapeSource };
