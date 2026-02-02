import * as cheerio from 'cheerio';

const BASE_URL = 'https://centrocultural.sp.gov.br';
const AGENDA_URL = `${BASE_URL}/programacao/`;

/**
 * Scraper para Centro Cultural São Paulo
 */
export async function scrapeCCSP(options = {}) {
  const { limit = 50 } = options;
  const events = [];

  try {
    console.log('Buscando eventos do CCSP...');

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

    $('.evento, .programacao-item, .card, article').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const titulo = $el.find('h2, h3, .titulo, a').first().text().trim();
        if (!titulo || titulo.length < 3) return;

        const link = $el.find('a').first().attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;
        const dataText = $el.find('.data, .date, time').first().text().trim();
        const descricao = $el.find('.descricao, .resumo, p').first().text().trim();
        const imagem = $el.find('img').first().attr('src');
        const local = $el.find('.local, .espaco').first().text().trim();

        events.push({
          titulo,
          descricao,
          data: dataText,
          local_nome: local || 'Centro Cultural São Paulo',
          link: fullLink,
          preco: null,
          imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
          categorias: []
        });
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos do CCSP`);

  } catch (err) {
    console.error('Erro ao scrape do CCSP:', err.message);
  }

  return events;
}

export default { scrapeCCSP };
