import slugify from 'slugify';

/**
 * Normaliza dados de evento extraídos de diferentes fontes
 */
export function normalizeEvent(rawEvent, source) {
  return {
    titulo: cleanText(rawEvent.titulo),
    descricao: cleanHtml(rawEvent.descricao || ''),
    data_inicio: parseDate(rawEvent.data),
    data_fim: rawEvent.data_fim ? parseDate(rawEvent.data_fim) : null,
    horario: rawEvent.horario || null,
    local_nome: cleanText(rawEvent.local_nome || rawEvent.local || ''),
    local_id: null, // Será preenchido pelo matcher de locais
    preco: normalizePrice(rawEvent.preco),
    link_fonte: rawEvent.link,
    tags: normalizeTags(rawEvent.tags || rawEvent.categorias || []),
    imagem: rawEvent.imagem || null,
    fonte: source,
    slug: generateSlug(rawEvent.titulo, rawEvent.data),
    extraido_em: new Date().toISOString()
  };
}

/**
 * Limpa texto removendo espaços extras e caracteres especiais
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/**
 * Remove tags HTML e limpa o texto
 */
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converte string de data para ISO 8601
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Se já é ISO, retorna
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  // Formatos brasileiros comuns
  const patterns = [
    // "15 de dezembro de 2025"
    /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,
    // "15/12/2025"
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // "15.12.2025"
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/
  ];

  const months = {
    janeiro: '01', fevereiro: '02', março: '03', marco: '03',
    abril: '04', maio: '05', junho: '06',
    julho: '07', agosto: '08', setembro: '09',
    outubro: '10', novembro: '11', dezembro: '12'
  };

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      const [, day, monthOrNum, year] = match;
      const month = months[monthOrNum.toLowerCase()] || monthOrNum.padStart(2, '0');
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Normaliza informação de preço
 */
function normalizePrice(preco) {
  if (!preco) return null;

  const lower = preco.toLowerCase();

  if (lower.includes('grátis') || lower.includes('gratuito') || lower.includes('entrada livre')) {
    return 'gratuito';
  }

  // Extrai valor numérico
  const match = preco.match(/R?\$?\s*(\d+(?:[.,]\d{2})?)/);
  if (match) {
    return `R$ ${match[1].replace(',', '.')}`;
  }

  return preco;
}

/**
 * Normaliza tags/categorias
 */
function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    tags = [tags];
  }

  return tags
    .filter(Boolean)
    .map(tag => tag.toLowerCase().trim())
    .map(tag => tag.replace(/\s+/g, '-'))
    .filter(tag => tag.length > 0);
}

/**
 * Gera slug único para o evento
 */
function generateSlug(titulo, data) {
  const baseSlug = slugify(titulo, {
    lower: true,
    strict: true,
    locale: 'pt'
  });

  const dateStr = parseDate(data);
  if (dateStr) {
    return `${dateStr}-${baseSlug}`.slice(0, 80);
  }

  return baseSlug.slice(0, 80);
}

export default { normalizeEvent };
