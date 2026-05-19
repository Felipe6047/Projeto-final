const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = { credentials: true };
if (process.env.FRONTEND_URL) {
  corsOptions.origin = process.env.FRONTEND_URL.split(',').map((s) => s.trim());
} else {
  corsOptions.origin = true;
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada. Use /api' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}/api`);
  if (process.env.FRONTEND_URL) {
    console.log(`CORS liberado para: ${process.env.FRONTEND_URL}`);
  } else {
    console.log('CORS: qualquer origem (modo desenvolvimento)');
  }
});
