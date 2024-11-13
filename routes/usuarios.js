const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Modulo de API

// CRUD operações
router.get('/', usuariosController.listarUsuarios);
router.post('/', usuariosController.criarUsuario);
router.get('/perfil', usuariosController.obterUsuarioPorToken); // Nova rota GET por Token
router.post('/login', usuariosController.logarUsuario);  // Nova rota GET por Senha
router.get('/:id', usuariosController.obterUsuarioPorId);  // Nova rota GET por ID
router.put('/atualizar', usuariosController.atualizarUsuario);   // Nova rota PUT para atualização
router.put('/atualizarsenha', usuariosController.atualizarSenhaUsuario);   // Nova rota PUT para atualização
router.delete('/:id', usuariosController.deletarUsuario);  // Nova rota DELETE para exclusão

module.exports = router;