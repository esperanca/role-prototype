import fs from 'fs/promises';
import path from 'path';

/**
 * Verifica se um evento já existe no repositório
 */
export async function isDuplicate(event, existingEvents) {
  // 1. Verifica por link_fonte exato
  if (event.link_fonte) {
    const byLink = existingEvents.find(e => e.link_fonte === event.link_fonte);
    if (byLink) {
      return { isDuplicate: true, reason: 'link_fonte', match: byLink };
    }
  }

  // 2. Verifica por título + data (fuzzy)
  const normalizedTitle = normalizeForComparison(event.titulo);
  const eventDate = event.data_inicio;

  for (const existing of existingEvents) {
    const existingTitle = normalizeForComparison(existing.titulo);
    const existingDate = existing.data_inicio;

    // Mesmo título e mesma data
    if (existingTitle === normalizedTitle && existingDate === eventDate) {
      return { isDuplicate: true, reason: 'titulo_data_exato', match: existing };
    }

    // Título similar (>80% match) e mesma data
    if (existingDate === eventDate) {
      const similarity = calculateSimilarity(normalizedTitle, existingTitle);
      if (similarity > 0.8) {
        return { isDuplicate: true, reason: 'titulo_similar', similarity, match: existing };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Normaliza texto para comparação
 */
function normalizeForComparison(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
    .trim();
}

/**
 * Calcula similaridade entre duas strings (Dice coefficient)
 */
function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;

  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);

  let intersection = 0;
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) {
      intersection++;
    }
  }

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

function getBigrams(str) {
  const bigrams = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Carrega eventos existentes do repositório
 */
export async function loadExistingEvents(eventsDir) {
  const events = [];

  try {
    const files = await fs.readdir(eventsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(eventsDir, file), 'utf-8');
      const event = parseEventFrontmatter(content, file);
      if (event) {
        events.push(event);
      }
    }
  } catch (err) {
    console.error('Erro ao carregar eventos existentes:', err.message);
  }

  return events;
}

/**
 * Extrai frontmatter de um arquivo de evento
 */
function parseEventFrontmatter(content, filename) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = match[1];
  const event = { filename };

  // Parse simples do YAML
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      // Remove aspas
      value = value.replace(/^["']|["']$/g, '');
      event[key.trim()] = value;
    }
  }

  // Renomeia campos para o formato interno
  event.titulo = event.title;
  event.data_inicio = event.date;
  event.link_fonte = event.link_fonte || null;

  return event;
}

export default { isDuplicate, loadExistingEvents };
