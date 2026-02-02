import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.itaucultural.org.br';
const AGENDA_URL = `${BASE_URL}/agenda`;

/**
 * Scraper para Itaú Cultural
 */
export async function scrapeItauCultural(options = {}) {
  const { limit = 50 } = options;
  const events = [];

  try {
    console.log('Buscando eventos do Itaú Cultural...');

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

    $('.card-evento, .evento-item, .programacao-card, article').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const titulo = $el.find('h2, h3, .titulo, .card-title').first().text().trim();
        if (!titulo) return;

        const link = $el.find('a').first().attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;
        const dataText = $el.find('.data, .date, time, .periodo').first().text().trim();
        const descricao = $el.find('.descricao, .resumo, p').first().text().trim();
        const imagem = $el.find('img').first().attr('src');
        const categorias = [];
        $el.find('.categoria, .tipo, .tag').each((i, tag) => {
          categorias.push($(tag).text().trim());
        });

        events.push({
          titulo,
          descricao,
          data: dataText,
          local_nome: 'Itaú Cultural',
          link: fullLink,
          preco: 'gratuito',
          imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
          categorias
        });
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos do Itaú Cultural`);

  } catch (err) {
    console.error('Erro ao scrape do Itaú Cultural:', err.message);
  }

  return events;
}

export default { scrapeItauCultural };
