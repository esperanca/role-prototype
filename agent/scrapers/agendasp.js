import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.prefeitura.sp.gov.br';
const AGENDA_URL = `${BASE_URL}/cidade/secretarias/cultura/agenda_cultural`;

/**
 * Scraper para Agenda Cultural SP (Prefeitura)
 */
export async function scrapeAgendaSP(options = {}) {
  const { limit = 50 } = options;
  const events = [];

  try {
    console.log('Buscando eventos da Agenda Cultural SP...');

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

    // Seleciona itens da agenda
    $('.agenda-item, .evento, .listagem-item, article').each((i, el) => {
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

    console.log(`Encontrados ${events.length} eventos da Agenda SP`);

  } catch (err) {
    console.error('Erro ao scrape da Agenda SP:', err.message);
  }

  return events;
}

/**
 * Extrai dados de um item da agenda
 */
function extractEventData($, $el) {
  const titulo = $el.find('h2, h3, .titulo, a.title').first().text().trim();
  if (!titulo) return null;

  const link = $el.find('a').first().attr('href');
  const fullLink = link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : null;

  const dataText = $el.find('.data, .date, time').first().text().trim();
  const local = $el.find('.local, .endereco').first().text().trim();
  const descricao = $el.find('.resumo, .descricao, p').first().text().trim();
  const imagem = $el.find('img').first().attr('src');

  const categorias = [];
  $el.find('.categoria, .tipo').each((i, tag) => {
    categorias.push($(tag).text().trim());
  });

  return {
    titulo,
    descricao,
    data: dataText,
    local_nome: local,
    link: fullLink,
    preco: null,
    imagem: imagem ? (imagem.startsWith('http') ? imagem : `${BASE_URL}${imagem}`) : null,
    categorias
  };
}

export default { scrapeAgendaSP };
