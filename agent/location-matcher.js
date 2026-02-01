import fs from 'fs/promises';

let locaisCache = null;

/**
 * Carrega locais do arquivo JSON
 */
export async function loadLocais(locaisPath) {
  if (locaisCache) return locaisCache;

  try {
    const content = await fs.readFile(locaisPath, 'utf-8');
    locaisCache = JSON.parse(content);
    return locaisCache;
  } catch (err) {
    console.error('Erro ao carregar locais:', err.message);
    return {};
  }
}

/**
 * Tenta encontrar o local_id correspondente ao nome do local
 */
export function matchLocal(localNome, locais) {
  if (!localNome || !locais) return null;

  const normalized = normalizeLocalName(localNome);

  // 1. Match exato pelo nome
  for (const [id, local] of Object.entries(locais)) {
    if (normalizeLocalName(local.nome) === normalized) {
      return id;
    }
  }

  // 2. Match parcial (contém)
  for (const [id, local] of Object.entries(locais)) {
    const localNormalized = normalizeLocalName(local.nome);
    if (normalized.includes(localNormalized) || localNormalized.includes(normalized)) {
      return id;
    }
  }

  // 3. Match por aliases conhecidos
  const aliases = {
    'ccbb': 'ccbb-sp',
    'centro cultural banco do brasil': 'ccbb-sp',
    'masp': 'masp',
    'museu de arte de são paulo': 'masp',
    'museu de arte de sao paulo': 'masp',
    'sesc pinheiros': 'sesc-pinheiros',
    'sesc 24 de maio': 'sesc-24-de-maio',
    'sala são paulo': 'sala-sao-paulo',
    'sala sao paulo': 'sala-sao-paulo',
    'teatro municipal': 'teatro-municipal-sp',
    'ibirapuera': 'parque-ibirapuera',
    'parque ibirapuera': 'parque-ibirapuera',
    'villa-lobos': 'parque-villa-lobos',
    'parque villa-lobos': 'parque-villa-lobos',
    'pinacoteca': 'pinacoteca',
    'pinacoteca de são paulo': 'pinacoteca',
    'pinacoteca de sao paulo': 'pinacoteca',
    'museu da língua portuguesa': 'museu-lingua-portuguesa',
    'museu da lingua portuguesa': 'museu-lingua-portuguesa',
    'allianz parque': 'allianz-parque',
    'teatro tuca': 'teatro-tuca',
    'teatro faap': 'teatro-faap',
    'teatro renaissance': 'teatro-renaissance',
    'teatro sesi': 'teatro-sesi-sp',
    'teatro do sesi': 'teatro-sesi-sp',
    'memorial da américa latina': 'memorial-america-latina',
    'memorial da america latina': 'memorial-america-latina',
    'espaco unimed': 'espaco-unimed',
    'espaço unimed': 'espaco-unimed'
  };

  const aliasMatch = aliases[normalized];
  if (aliasMatch && locais[aliasMatch]) {
    return aliasMatch;
  }

  return null;
}

/**
 * Normaliza nome de local para comparação
 */
function normalizeLocalName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s*[-–—]\s*/g, ' ') // Normaliza hífens
    .replace(/[()]/g, '') // Remove parênteses
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sugere criação de novo local se não encontrado
 */
export function suggestNewLocal(localNome) {
  const id = localNome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id,
    nome: localNome,
    endereco: null,
    bairro: null,
    tipo: 'outro',
    descricao: null,
    link: null,
    acessibilidade: null,
    criancas: null,
    ativo: true
  };
}

export default { loadLocais, matchLocal, suggestNewLocal };
