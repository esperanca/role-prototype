#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeAll, scrapeSource } from './scrapers/index.js';
import { normalizeEvent } from './normalizer.js';
import { isDuplicate, loadExistingEvents } from './deduplicator.js';
import { loadLocais, matchLocal, suggestNewLocal } from './location-matcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const EVENTS_DIR = path.join(ROOT_DIR, 'content', 'explore');
const LOCAIS_PATH = path.join(ROOT_DIR, '_data', 'locais.json');
const DRAFTS_PATH = path.join(ROOT_DIR, 'rascunhos', 'pendentes.json');

/**
 * Agente principal de scraping
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log('='.repeat(50));
  console.log('AGENTE DE CURADORIA - rolê');
  console.log('='.repeat(50));
  console.log(`Modo: ${args.dryRun ? 'DRY RUN' : 'PRODUÇÃO'}`);
  console.log(`Fonte: ${args.source || 'todas'}`);
  console.log('');

  try {
    // 1. Carrega dados existentes
    console.log('Carregando dados existentes...');
    const [existingEvents, locais] = await Promise.all([
      loadExistingEvents(EVENTS_DIR),
      loadLocais(LOCAIS_PATH)
    ]);
    console.log(`  - ${existingEvents.length} eventos existentes`);
    console.log(`  - ${Object.keys(locais).length} locais cadastrados`);

    // 2. Executa scrapers
    console.log('\nExecutando scrapers...');
    const scrapeResults = args.source
      ? { events: await scrapeSource(args.source), sources: [{ id: args.source }] }
      : await scrapeAll({ limit: args.limit });

    console.log(`\nTotal bruto: ${scrapeResults.events.length} eventos`);

    // 3. Normaliza e processa eventos
    console.log('\nProcessando eventos...');
    const drafts = [];
    const duplicates = [];
    const newLocals = new Map();

    for (const rawEvent of scrapeResults.events) {
      // Normaliza
      const event = normalizeEvent(rawEvent, rawEvent._source);

      // Verifica duplicata
      const dupCheck = await isDuplicate(event, existingEvents);
      if (dupCheck.isDuplicate) {
        duplicates.push({
          event,
          reason: dupCheck.reason,
          match: dupCheck.match?.titulo
        });
        continue;
      }

      // Tenta vincular local
      const localId = matchLocal(event.local_nome, locais);
      if (localId) {
        event.local_id = localId;
      } else if (event.local_nome) {
        // Sugere novo local
        const suggested = suggestNewLocal(event.local_nome);
        newLocals.set(suggested.id, suggested);
        event.local_id = null;
        event.local_sugerido = suggested;
      }

      drafts.push(event);
    }

    // 4. Relatório
    console.log('\n' + '='.repeat(50));
    console.log('RELATÓRIO');
    console.log('='.repeat(50));
    console.log(`Eventos processados: ${scrapeResults.events.length}`);
    console.log(`Duplicatas removidas: ${duplicates.length}`);
    console.log(`Rascunhos gerados: ${drafts.length}`);
    console.log(`Novos locais sugeridos: ${newLocals.size}`);

    if (duplicates.length > 0) {
      console.log('\nDuplicatas:');
      duplicates.slice(0, 5).forEach(d => {
        console.log(`  - "${d.event.titulo}" (${d.reason})`);
      });
      if (duplicates.length > 5) {
        console.log(`  ... e mais ${duplicates.length - 5}`);
      }
    }

    if (newLocals.size > 0) {
      console.log('\nLocais não encontrados:');
      [...newLocals.values()].slice(0, 5).forEach(l => {
        console.log(`  - "${l.nome}" → sugestão: ${l.id}`);
      });
    }

    // 5. Salva rascunhos
    if (!args.dryRun && drafts.length > 0) {
      await saveDrafts(drafts, newLocals);
      console.log(`\nRascunhos salvos em: ${DRAFTS_PATH}`);
    } else if (args.dryRun) {
      console.log('\n[DRY RUN] Nenhum arquivo foi modificado');
      console.log('\nExemplo de rascunho:');
      console.log(JSON.stringify(drafts[0], null, 2));
    }

    console.log('\nConcluído!');

  } catch (err) {
    console.error('\nERRO FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

/**
 * Salva rascunhos no arquivo JSON
 */
async function saveDrafts(drafts, newLocals) {
  // Garante que o diretório existe
  const draftsDir = path.dirname(DRAFTS_PATH);
  await fs.mkdir(draftsDir, { recursive: true });

  // Carrega rascunhos existentes
  let existing = { eventos: [], locais_sugeridos: {} };
  try {
    const content = await fs.readFile(DRAFTS_PATH, 'utf-8');
    existing = JSON.parse(content);
  } catch {
    // Arquivo não existe, usa default
  }

  // Adiciona novos rascunhos
  const output = {
    atualizado_em: new Date().toISOString(),
    eventos: [...existing.eventos, ...drafts],
    locais_sugeridos: {
      ...existing.locais_sugeridos,
      ...Object.fromEntries(newLocals)
    }
  };

  await fs.writeFile(DRAFTS_PATH, JSON.stringify(output, null, 2));
}

/**
 * Parse argumentos da linha de comando
 */
function parseArgs(args) {
  const result = {
    source: null,
    dryRun: false,
    limit: 50
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg.startsWith('--source=')) {
      result.source = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      result.limit = parseInt(arg.split('=')[1], 10);
    }
  }

  return result;
}

// Executa
main();
