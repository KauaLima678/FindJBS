// backend/index.js
const express = require('express');
const cors = require('cors');
const { scrapeVagas } = require('./scraper'); // Importamos nosso robô

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.send('<h1>API do FindJBS está no ar!</h1><p>Acesse /api/vagas para buscar vagas.</p>');
});

// Transformamos a rota em 'async' para poder usar 'await'
app.get('/api/vagas', async (req, res) => {
  console.log("Recebida requisição de busca de vagas com filtros:", req.query);

  try {
    // Chamamos nossa função de scraping e esperamos o resultado
    const vagasEncontradas = await scrapeVagas(req.query);

    // Retornamos os dados reais que o robô coletou
    res.json(vagasEncontradas);
  } catch (error) {
    console.error('Erro na rota /api/vagas:', error);
    // Em caso de erro no servidor, enviamos uma resposta de erro
    res.status(500).json({ message: 'Ocorreu um erro ao buscar as vagas.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});