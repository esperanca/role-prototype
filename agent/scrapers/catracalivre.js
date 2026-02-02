import * as cheerio from 'cheerio';

const BASE_URL = 'https://catracalivre.com.br';
const AGENDA_URL = `${BASE_URL}/agenda/sp/`;

/**
 * Scraper para Catraca Livre
 */
export async function scrapeCatracaLivre(options = {}) {
  const { limit = 50 } = options;
  const events = [];

  try {
    console.log('Buscando eventos do Catraca Livre...');

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

    $('.evento, .post, .card, article, .agenda-item').each((i, el) => {
      if (events.length >= limit) return false;

      try {
        const $el = $(el);
        const titulo = $el.find('h2, h3, .titulo, .entry-title').first().text().trim();
        if (!titulo || titulo.length < 3) return;

        const link = $el.find('a').first().attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;
        const dataText = $el.find('.data, .date, time, .quando').first().text().trim();
        const local = $el.find('.local, .onde, .endereco').first().text().trim();
        const descricao = $el.find('.descricao, .resumo, .excerpt, p').first().text().trim();
        const imagem = $el.find('img').first().attr('src');
        const preco = $el.find('.preco, .valor, .gratis').first().text().trim();

        const categorias = [];
        $el.find('.categoria, .tag, .tipo').each((i, tag) => {
          categorias.push($(tag).text().trim());
        });

        events.push({
          titulo,
          descricao,
          data: dataText,
          local_nome: local || 'São Paulo',
          link: fullLink,
          preco: preco || 'gratuito',
          imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
          categorias
        });
      } catch (err) {
        console.warn('Erro ao extrair evento:', err.message);
      }
    });

    console.log(`Encontrados ${events.length} eventos do Catraca Livre`);

  } catch (err) {
    console.error('Erro ao scrape do Catraca Livre:', err.message);
  }

  return events;
}

export default { scrapeCatracaLivre };
