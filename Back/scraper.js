// backend/scraper.js (VERSÃO 12 - Busca Precisa com Geocodificação Reversa)

const puppeteer = require('puppeteer');
const axios = require('axios'); // Importamos o axios

const GUPY_URL_BASE = 'https://portal.gupy.io/job-search/term=';

async function scrapeVagas(filters) {
  console.log('Iniciando o robô de scraping (v12)...');
  let browser;

  try {
    // --- ETAPA 1: GEOCALIZAÇÃO REVERSA PARA ENCONTRAR O LOCAL DO MAPA ---
    let locationName = 'Brasil'; // Começamos com um valor padrão
    
    // Verificamos se recebemos as coordenadas do frontend
    if (filters.neLat && filters.swLat) {
      console.log('Coordenadas recebidas. Buscando nome do local...');
      // Calcula o ponto central do mapa visível
      const centerLat = (parseFloat(filters.neLat) + parseFloat(filters.swLat)) / 2;
      const centerLng = (parseFloat(filters.neLng) + parseFloat(filters.swLng)) / 2;

      // Monta a URL da API do Nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${centerLat}&lon=${centerLng}&zoom=10&accept-language=pt-BR`;

      try {
        // Faz a chamada para a API do Nominatim
        const geoResponse = await axios.get(nominatimUrl, {
          headers: { 'User-Agent': 'FindJBS/1.0 (seuemail@example.com)' } // Boa prática: identificar sua aplicação
        });

        const address = geoResponse.data.address;
        // Tenta pegar a cidade, se não tiver, pega o estado.
        if (address) {
          locationName = address.city || address.town || address.village || address.state || 'Brasil';
        }
        console.log(`Local encontrado: ${locationName}`);
      } catch (geoError) {
        console.error('Erro ao buscar localização no Nominatim:', geoError.message);
        // Se a busca falhar, continuamos com o valor padrão "Brasil"
      }
    }
    // --- FIM DA ETAPA DE GEOCALIZAÇÃO ---

    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Usamos o locationName na busca!
    const searchTerm = `${filters.cargo || ''} ${locationName}`;
    const searchUrl = `${GUPY_URL_BASE}${encodeURIComponent(searchTerm)}`;

    console.log(`Navegando para a URL precisa: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    // (O resto do código para clicar em cookies e extrair os dados continua exatamente o mesmo)
    try {
      const cookieButtonSelector = "xpath///button[contains(., 'Aceitar Cookies')]";
      await page.waitForSelector(cookieButtonSelector, { timeout: 5000 });
      const [cookieButton] = await page.$x("//button[contains(., 'Aceitar Cookies')]");
      if (cookieButton) {
        await cookieButton.click();
        console.log('Botão de cookies clicado.');
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.log('Banner de cookies não encontrado ou já aceito.');
    }
    
    const cardSelector = 'a[aria-label^="Ir para vaga"]';
    await page.waitForSelector(cardSelector, { timeout: 30000 });
    
    console.log('Cards de vagas encontrados. Extraindo dados...');
    const vagas = await page.$$eval(cardSelector, (cards) => {
        // ... LÓGICA DE EXTRAÇÃO ... (sem alterações)
        return cards.map((card, index) => {
            const url = card.href;
            const tituloEl = card.querySelector('h3');
            const titulo = tituloEl ? tituloEl.innerText : 'Título não encontrado';
            const empresaEl = card.querySelector('div[aria-label^="Empresa"] p');
            const empresa = empresaEl ? empresaEl.innerText : 'Empresa não encontrada';
            
            let logoUrl = null;
            const logoEl = card.querySelector('img');
            if (logoEl && logoEl.src) {
              try {
                const urlOtimizada = new URL(logoEl.src);
                const urlReal = urlOtimizada.searchParams.get('url');
                logoUrl = urlReal || logoEl.src;
              } catch (e) {
                logoUrl = logoEl.src;
              }
            }

            let modelo = 'não informado';
            const modeloContainer = card.querySelector('div[aria-label^="Modelo de trabalho"]');
            if (modeloContainer) {
              const infoText = modeloContainer.innerText.toLowerCase();
              if (infoText.includes('remoto')) {
                modelo = 'remoto';
              } else if (infoText.includes('híbrido')) {
                modelo = 'hibrido';
              } else if (infoText.includes('presencial')) {
                modelo = 'presencial';
              }
            }
            
            const fullLabel = card.getAttribute('aria-label');
            let localizacao = 'Local não encontrado';
            const match = fullLabel.match(/na cidade (.*?)(?: publicada|$)/);
            if (match && match[1]) {
              localizacao = match[1].trim();
            }
            
            return { id: `${url}-${index}`, titulo, empresa, localizacao, url, logoUrl, modelo };
          });
    });

    console.log(`Extração concluída. ${vagas.length} vagas encontradas em ${locationName}.`);
    return vagas;

  } catch (error) {
    console.error('Ocorreu um erro no scraping:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
      console.log('Navegador fechado.');
    }
  }
}

module.exports = { scrapeVagas };