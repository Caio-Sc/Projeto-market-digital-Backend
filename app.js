// const express = require('express');
// const app = express();
// const cors = require('cors');
// const usuariosRoutes = require('./routes/usuarios');
// const negocioRoutes = require('./routes/negocio')
// // Middleware para processar JSON
// app.use(express.json());
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));

// // Configuração de rotas
// app.use('/usuarios', usuariosRoutes);
// app.use('/negocio', negocioRoutes);

// // Rodando o servidor
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Servidor rodando na porta ${PORT}`);
// });


// Testes
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const negocioRoutes = require('./routes/negocio');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/usuarios', usuariosRoutes);
app.use('/negocio', negocioRoutes);

// Função para criar servidor
function createServer() {
    return app.listen(0);
}

module.exports = { app, createServer };