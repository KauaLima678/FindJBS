// backend/scraper.js (VERSÃO FINAL - Com Paginação e Espera Inteligente)

const puppeteer = require('puppeteer');

const GUPY_URL_BASE = 'https://portal.gupy.io/job-search/term=';

async function scrapeVagas(filters) {
  console.log('Iniciando o robô de scraping (Versão Final com Espera Inteligente)...');
  let browser;

  try {
    const searchTerm = filters.cargo || '';
    browser = await puppeteer.launch({ headless: false, slowMo: 50 }); 
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1440, height: 900 });
    
    const searchUrl = `${GUPY_URL_BASE}${encodeURIComponent(searchTerm)}`;
    console.log(`Navegando para: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    try {
      const cookieButtonSelector = '#onetrust-accept-btn-handler';
      await page.waitForSelector(cookieButtonSelector, { timeout: 7000 });
      await page.click(cookieButtonSelector);
      await page.waitForSelector('#onetrust-banner-sdk', { hidden: true, timeout: 5000 });
    } catch (error) { 
      console.log('Banner de cookies não encontrado.'); 
    }

    const hasZeroResults = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h2'));
        return headings.some(h2 => h2.innerText.includes('Nenhum resultado foi encontrado'));
    });

    if (hasZeroResults) {
      console.log('A busca não retornou vagas.');
      return { searchLocation: `Busca por "${searchTerm}"`, jobs: [] };
    } 
      
    // --- LÓGICA DE PAGINAÇÃO COM ESPERA INTELIGENTE ---
    console.log('Iniciando paginação para carregar mais vagas...');
    const cardSelector = 'a[aria-label^="Ir para vaga"]';
    const maxPagesToLoad = 4; // Clicaremos no botão até 4 vezes

    for (let i = 0; i < maxPagesToLoad; i++) {
        // Contamos quantos cards existem ANTES do clique
        let initialCardCount = await page.$$eval(cardSelector, cards => cards.length);

        const clickedLoadMore = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const loadMoreButton = buttons.find(button => button.innerText.includes('Carregar mais vagas'));
            if (loadMoreButton) {
                loadMoreButton.click();
                return true;
            }
            return false;
        });
        
        if (clickedLoadMore) {
            console.log(`Clicado em "Carregar mais vagas" (${i + 1}/${maxPagesToLoad}). Aguardando novos cards...`);
            // ESPERA INTELIGENTE: esperamos até que o número de cards na tela seja MAIOR que o número inicial.
            await page.waitForFunction(
                (selector, count) => document.querySelectorAll(selector).length > count,
                { timeout: 10000 }, // Espera no máximo 10 segundos pelos novos cards
                cardSelector,
                initialCardCount
            );
            let newCardCount = await page.$$eval(cardSelector, cards => cards.length);
            console.log(`Novos cards carregados. Total agora: ${newCardCount}`);
        } else {
            console.log('Botão "Carregar mais vagas" não encontrado. Todas as vagas foram carregadas.');
            break; 
        }
    }
    // --- FIM DA LÓGICA DE PAGINAÇÃO ---
    
    console.log('Extraindo dados de todos os cards carregados...');
    let vagas = await page.$$eval(cardSelector, (cards) => {
        return cards.map((card, index) => {
            const url = card.href;
            const titulo = card.querySelector('h3')?.innerText || 'N/A';
            const empresa = card.querySelector('div[aria-label^="Empresa"] p')?.innerText || 'N/A';
            let logoUrl = null;
            const logoEl = card.querySelector('img');
            if(logoEl && logoEl.src) { try { const u = new URL(logoEl.src); logoUrl = u.searchParams.get('url') || logoEl.src; } catch(e){ logoUrl = logoEl.src; } }
            let modelo = 'não informado';
            const modeloContainer = card.querySelector('div[aria-label^="Modelo de trabalho"]');
            if (modeloContainer) { const txt = modeloContainer.innerText.toLowerCase(); if(txt.includes('remoto')) modelo = 'remoto'; else if(txt.includes('híbrido')) modelo = 'hibrido'; else if(txt.includes('presencial')) modelo = 'presencial'; }
            let localizacao = 'Não informado';
            const match = card.getAttribute('aria-label').match(/na cidade (.*?)(?: publicada|$)/);
            if (match && match[1]) { localizacao = match[1].trim(); }
            return { id: `${url}-${index}`, titulo, empresa, localizacao, url, logoUrl, modelo };
        });
    });

    const vagasComLocalizacao = vagas.filter(vaga => vaga.localizacao !== 'N/A');
    console.log(`Filtrando vagas: ${vagas.length} encontradas, ${vagasComLocalizacao.length} com localização informada.`);

    const searchLocationDisplay = searchTerm ? `Busca por "${searchTerm}"` : "Brasil";
    console.log(`Extração concluída. Retornando ${vagasComLocalizacao.length} vagas.`);
    return { searchLocation: searchLocationDisplay, jobs: vagasComLocalizacao };

  } catch (error) {
    console.error('Ocorreu um erro no scraping:', error);
    return { searchLocation: 'Erro na busca', jobs: [] };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeVagas };