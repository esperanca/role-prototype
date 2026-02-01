import * as cheerio from 'cheerio';

/**
 * Scraper para Pinacoteca de São Paulo
 */
export async function scrapePinacoteca(options = {}) {
  const { limit = 30 } = options;
  const events = [];
  const BASE_URL = 'https://pinacoteca.org.br';

  try {
    console.log('Buscando eventos da Pinacoteca...');

    const response = await fetch(`${BASE_URL}/programacao/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RoleScraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.exposicao, .evento, .programacao-item, .card, article').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const titulo = $el.find('h2, h3, .titulo').first().text().trim();
        if (!titulo) return;

        const link = $el.find('a').first().attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;
        const dataText = $el.find('.data, .periodo, time').first().text().trim();
        const descricao = $el.find('.descricao, p').first().text().trim();
        const imagem = $el.find('img').first().attr('src');

        events.push({
          titulo,
          descricao,
          data: dataText,
          local_nome: 'Pinacoteca de São Paulo',
          link: fullLink,
          preco: null,
          imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
          categorias: ['exposição', 'arte']
        });
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos da Pinacoteca`);

  } catch (err) {
    console.error('Erro ao scrape da Pinacoteca:', err.message);
  }

  return events;
}

/**
 * Scraper para MASP
 */
export async function scrapeMASP(options = {}) {
  const { limit = 30 } = options;
  const events = [];
  const BASE_URL = 'https://masp.org.br';

  try {
    console.log('Buscando eventos do MASP...');

    const response = await fetch(`${BASE_URL}/programacao`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RoleScraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.exposicao, .evento, .card, article, .programacao-item').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const titulo = $el.find('h2, h3, .titulo').first().text().trim();
        if (!titulo) return;

        const link = $el.find('a').first().attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;
        const dataText = $el.find('.data, .periodo, time').first().text().trim();
        const descricao = $el.find('.descricao, p').first().text().trim();
        const imagem = $el.find('img').first().attr('src');

        events.push({
          titulo,
          descricao,
          data: dataText,
          local_nome: 'MASP',
          link: fullLink,
          preco: null,
          imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
          categorias: ['exposição', 'arte']
        });
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos do MASP`);

  } catch (err) {
    console.error('Erro ao scrape do MASP:', err.message);
  }

  return events;
}

/**
 * Scraper para Japan House
 */
export async function scrapeJapanHouse(options = {}) {
  const { limit = 30 } = options;
  const events = [];
  const BASE_URL = 'https://www.japanhousesp.com.br';

  try {
    console.log('Buscando eventos da Japan House...');

    const response = await fetch(`${BASE_URL}/programacao/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RoleScraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('.evento, .exposicao, .card, article').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const titulo = $el.find('h2, h3, .titulo').first().text().trim();
        if (!titulo) return;

        const link = $el.find('a').first().attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;
        const dataText = $el.find('.data, .periodo, time').first().text().trim();
        const descricao = $el.find('.descricao, p').first().text().trim();
        const imagem = $el.find('img').first().attr('src');

        events.push({
          titulo,
          descricao,
          data: dataText,
          local_nome: 'Japan House São Paulo',
          link: fullLink,
          preco: 'gratuito',
          imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
          categorias: ['exposição', 'cultura japonesa']
        });
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos da Japan House`);

  } catch (err) {
    console.error('Erro ao scrape da Japan House:', err.message);
  }

  return events;
}

export default { scrapePinacoteca, scrapeMASP, scrapeJapanHouse };
