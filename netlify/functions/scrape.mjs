import * as cheerio from 'cheerio';

// User-Agent padrão
const UA = 'Mozilla/5.0 (compatible; RoleScraper/1.0)';
const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

// ============ SCRAPERS ============

async function scrapeSesc(limit = 30) {
  const BASE_URL = 'https://www.sescsp.org.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/programacao`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.card-evento, .programacao-item, .evento-card, article.evento').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo, .event-title, .card-title').first().text().trim() ||
                     $el.find('a').first().text().trim();
      if (!titulo) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, .description, .resumo, p').first().text().trim(),
        data: $el.find('.data, .date, .event-date, time').first().text().trim(),
        local_nome: $el.find('.local, .location, .venue, .unidade').first().text().trim() || 'SESC São Paulo',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: $el.find('.preco, .price, .valor').first().text().trim(),
        imagem: $el.find('img').first().attr('src'),
        categorias: $el.find('.categoria, .category, .tag').map((i, t) => $(t).text().trim()).get()
      });
    });
  } catch (err) {
    console.error('SESC error:', err.message);
  }
  return events;
}

async function scrapeAgendaSP(limit = 30) {
  const BASE_URL = 'https://www.prefeitura.sp.gov.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/cidade/secretarias/cultura/agenda_cultural`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.agenda-item, .evento, .listagem-item, article').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo, a.title').first().text().trim();
      if (!titulo) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.resumo, .descricao, p').first().text().trim(),
        data: $el.find('.data, .date, time').first().text().trim(),
        local_nome: $el.find('.local, .endereco').first().text().trim(),
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: null,
        imagem: $el.find('img').first().attr('src'),
        categorias: $el.find('.categoria, .tipo').map((i, t) => $(t).text().trim()).get()
      });
    });
  } catch (err) {
    console.error('AgendaSP error:', err.message);
  }
  return events;
}

async function scrapeItauCultural(limit = 30) {
  const BASE_URL = 'https://www.itaucultural.org.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/agenda`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.card-evento, .evento-item, .programacao-card, article').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo, .card-title').first().text().trim();
      if (!titulo) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, .resumo, p').first().text().trim(),
        data: $el.find('.data, .date, time, .periodo').first().text().trim(),
        local_nome: 'Itaú Cultural',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: 'gratuito',
        imagem: $el.find('img').first().attr('src'),
        categorias: $el.find('.categoria, .tipo, .tag').map((i, t) => $(t).text().trim()).get()
      });
    });
  } catch (err) {
    console.error('Itaú Cultural error:', err.message);
  }
  return events;
}

async function scrapeCCSP(limit = 30) {
  const BASE_URL = 'https://centrocultural.sp.gov.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/programacao/`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.evento, .programacao-item, .card, article').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo, a').first().text().trim();
      if (!titulo || titulo.length < 3) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, .resumo, p').first().text().trim(),
        data: $el.find('.data, .date, time').first().text().trim(),
        local_nome: $el.find('.local, .espaco').first().text().trim() || 'Centro Cultural São Paulo',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: null,
        imagem: $el.find('img').first().attr('src'),
        categorias: []
      });
    });
  } catch (err) {
    console.error('CCSP error:', err.message);
  }
  return events;
}

async function scrapePinacoteca(limit = 20) {
  const BASE_URL = 'https://pinacoteca.org.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/programacao/`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.exposicao, .evento, .programacao-item, .card, article').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo').first().text().trim();
      if (!titulo) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, p').first().text().trim(),
        data: $el.find('.data, .periodo, time').first().text().trim(),
        local_nome: 'Pinacoteca de São Paulo',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: null,
        imagem: $el.find('img').first().attr('src'),
        categorias: ['exposição', 'arte']
      });
    });
  } catch (err) {
    console.error('Pinacoteca error:', err.message);
  }
  return events;
}

async function scrapeMASP(limit = 20) {
  const BASE_URL = 'https://masp.org.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/programacao`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.exposicao, .evento, .card, article, .programacao-item').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo').first().text().trim();
      if (!titulo) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, p').first().text().trim(),
        data: $el.find('.data, .periodo, time').first().text().trim(),
        local_nome: 'MASP',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: null,
        imagem: $el.find('img').first().attr('src'),
        categorias: ['exposição', 'arte']
      });
    });
  } catch (err) {
    console.error('MASP error:', err.message);
  }
  return events;
}

async function scrapeJapanHouse(limit = 20) {
  const BASE_URL = 'https://www.japanhousesp.com.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/programacao/`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.evento, .exposicao, .card, article').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo').first().text().trim();
      if (!titulo) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, p').first().text().trim(),
        data: $el.find('.data, .periodo, time').first().text().trim(),
        local_nome: 'Japan House São Paulo',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: 'gratuito',
        imagem: $el.find('img').first().attr('src'),
        categorias: ['exposição', 'cultura japonesa']
      });
    });
  } catch (err) {
    console.error('Japan House error:', err.message);
  }
  return events;
}

async function scrapeCatracaLivre(limit = 30) {
  const BASE_URL = 'https://catracalivre.com.br';
  const events = [];

  try {
    const response = await fetch(`${BASE_URL}/agenda/sp/`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.evento, .post, .card, article, .agenda-item').each((i, el) => {
      if (events.length >= limit) return false;
      const $el = $(el);
      const titulo = $el.find('h2, h3, .titulo, .entry-title').first().text().trim();
      if (!titulo || titulo.length < 3) return;

      const link = $el.find('a').first().attr('href');
      events.push({
        titulo,
        descricao: $el.find('.descricao, .resumo, .excerpt, p').first().text().trim(),
        data: $el.find('.data, .date, time, .quando').first().text().trim(),
        local_nome: $el.find('.local, .onde, .endereco').first().text().trim() || 'São Paulo',
        link: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null,
        preco: $el.find('.preco, .valor, .gratis').first().text().trim() || 'gratuito',
        imagem: $el.find('img').first().attr('src'),
        categorias: $el.find('.categoria, .tag, .tipo').map((i, t) => $(t).text().trim()).get()
      });
    });
  } catch (err) {
    console.error('Catraca Livre error:', err.message);
  }
  return events;
}

// ============ LOCATION MATCHER ============

const localAliases = {
  'sesc-pinheiros': ['sesc pinheiros', 'sesc de pinheiros'],
  'sesc-24-de-maio': ['sesc 24 de maio', 'sesc 24'],
  'masp': ['masp', 'museu de arte de são paulo', 'museu de arte de sao paulo'],
  'pinacoteca': ['pinacoteca', 'pinacoteca de são paulo', 'pinacoteca de sao paulo', 'pina'],
  'itau-cultural': ['itaú cultural', 'itau cultural', 'instituto itaú cultural'],
  'ccsp': ['ccsp', 'centro cultural são paulo', 'centro cultural sao paulo'],
  'japan-house': ['japan house', 'japan house são paulo', 'japan house sao paulo'],
  'ccbb-sp': ['ccbb', 'centro cultural banco do brasil'],
  'sala-sao-paulo': ['sala são paulo', 'sala sao paulo', 'osesp'],
  'teatro-municipal': ['teatro municipal', 'theatro municipal'],
  'parque-ibirapuera': ['ibirapuera', 'parque ibirapuera', 'parque do ibirapuera'],
  'memorial-america-latina': ['memorial da américa latina', 'memorial america latina'],
  'museu-lingua-portuguesa': ['museu da língua portuguesa', 'museu da lingua portuguesa'],
  'allianz-parque': ['allianz parque', 'allianz park'],
};

function matchLocal(localNome) {
  if (!localNome) return null;
  const normalized = localNome.toLowerCase().trim();

  for (const [id, aliases] of Object.entries(localAliases)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return id;
    }
  }
  return null;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// ============ MAIN HANDLER ============

const scrapers = [
  { id: 'sesc', name: 'SESC São Paulo', fn: scrapeSesc },
  { id: 'agendasp', name: 'Agenda SP', fn: scrapeAgendaSP },
  { id: 'itaucultural', name: 'Itaú Cultural', fn: scrapeItauCultural },
  { id: 'ccsp', name: 'CCSP', fn: scrapeCCSP },
  { id: 'pinacoteca', name: 'Pinacoteca', fn: scrapePinacoteca },
  { id: 'masp', name: 'MASP', fn: scrapeMASP },
  { id: 'japanhouse', name: 'Japan House', fn: scrapeJapanHouse },
  { id: 'catracalivre', name: 'Catraca Livre', fn: scrapeCatracaLivre },
];

export default async (request, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const startTime = Date.now();
  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    sources: [],
    eventos: [],
    errors: []
  };

  // Run all scrapers in parallel
  const scrapePromises = scrapers.map(async (scraper) => {
    const sourceStart = Date.now();
    try {
      const events = await scraper.fn();
      const processedEvents = events.map(event => ({
        ...event,
        _source: scraper.id,
        _slug: generateSlug(event.titulo || 'evento'),
        local_id: matchLocal(event.local_nome)
      }));

      return {
        source: {
          id: scraper.id,
          name: scraper.name,
          count: events.length,
          success: true,
          duration: Date.now() - sourceStart
        },
        events: processedEvents
      };
    } catch (err) {
      return {
        source: {
          id: scraper.id,
          name: scraper.name,
          count: 0,
          success: false,
          error: err.message,
          duration: Date.now() - sourceStart
        },
        events: []
      };
    }
  });

  const scrapeResults = await Promise.all(scrapePromises);

  for (const result of scrapeResults) {
    results.sources.push(result.source);
    results.eventos.push(...result.events);
    if (!result.source.success) {
      results.errors.push({ source: result.source.id, error: result.source.error });
    }
  }

  results.total = results.eventos.length;
  results.duration = Date.now() - startTime;

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers
  });
};

export const config = {
  path: "/.netlify/functions/scrape"
};
