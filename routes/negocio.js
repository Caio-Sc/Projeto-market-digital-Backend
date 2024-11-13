const express = require('express');
const router = express.Router();
const negocioController = require('../controllers/negocioController');

// CRUD operações
router.get('/', negocioController.pegarLojas);
router.post('/vendedorLoja', negocioController.pegarVendedorToken);  
router.post('/compra', negocioController.compraCarrinho);
router.post('/registroProduto', negocioController.registrarProduto);
router.post('/registrarLoja', negocioController.registrarLoja);
router.put('/atualizarLoja', negocioController.atualizarLoja);
router.get('/:id', negocioController.pegarProdutos);
router.delete('/produto/:id', negocioController.deletarProduto);

module.exports = router;