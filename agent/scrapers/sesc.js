import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.sescsp.org.br';
const AGENDA_URL = `${BASE_URL}/programacao`;

/**
 * Scraper para agenda do SESC São Paulo
 */
export async function scrapeSesc(options = {}) {
  const { limit = 50, category = null } = options;
  const events = [];

  try {
    console.log('Buscando eventos do SESC SP...');

    // Busca página principal da programação
    const response = await fetch(AGENDA_URL, {
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

    // Seleciona cards de eventos
    // Nota: seletores podem precisar de ajuste conforme estrutura real do site
    $('.card-evento, .programacao-item, .evento-card, article.evento').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const event = extractEventData($, $el);
        if (event && event.titulo) {
          events.push(event);
        }
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos do SESC`);

  } catch (err) {
    console.error('Erro ao scrape do SESC:', err.message);
  }

  return events;
}

/**
 * Extrai dados de um card de evento
 */
function extractEventData($, $el) {
  // Tenta diferentes seletores comuns
  const titulo =
    $el.find('h2, h3, .titulo, .event-title, .card-title').first().text().trim() ||
    $el.find('a').first().text().trim();

  if (!titulo) return null;

  const link = $el.find('a').first().attr('href');
  const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;

  const dataText =
    $el.find('.data, .date, .event-date, time').first().text().trim() ||
    $el.find('[datetime]').attr('datetime');

  const local =
    $el.find('.local, .location, .venue, .unidade').first().text().trim();

  const imagem =
    $el.find('img').first().attr('src') ||
    $el.find('[style*="background"]').first().attr('style')?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];

  const preco =
    $el.find('.preco, .price, .valor').first().text().trim();

  const descricao =
    $el.find('.descricao, .description, .resumo, p').first().text().trim();

  const categorias = [];
  $el.find('.categoria, .category, .tag').each((i, tag) => {
    categorias.push($(tag).text().trim());
  });

  return {
    titulo,
    descricao,
    data: dataText,
    local_nome: local || 'SESC São Paulo',
    link: fullLink,
    preco,
    imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
    categorias
  };
}

/**
 * Busca detalhes de um evento específico
 */
export async function scrapeEventDetails(eventUrl) {
  try {
    const response = await fetch(eventUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RoleScraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      titulo: $('h1, .titulo-evento').first().text().trim(),
      descricao: $('.descricao, .sinopse, .sobre, article p').text().trim(),
      data: $('.data-evento, .when, time').first().text().trim(),
      horario: $('.horario, .time').first().text().trim(),
      local_nome: $('.local, .where, .unidade').first().text().trim(),
      endereco: $('.endereco, .address').first().text().trim(),
      preco: $('.preco, .valores, .ingressos').first().text().trim(),
      imagem: $('meta[property="og:image"]').attr('content') ||
              $('img.hero, .imagem-destaque img').first().attr('src'),
      categorias: $('.categorias .tag, .tipos span').map((i, el) => $(el).text().trim()).get()
    };

  } catch (err) {
    console.error(`Erro ao buscar detalhes de ${eventUrl}:`, err.message);
    return null;
  }
}

export default { scrapeSesc, scrapeEventDetails };
