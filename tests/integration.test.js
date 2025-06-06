const { app, createServer } = require('../app');
const request = require('supertest');
const db = require('../db/db');

let server;
let token;
let userId;

beforeAll(async () => {
  server = createServer();
});

afterAll(async () => {
  server.close();
  await new Promise((resolve) => {
    db.run("DELETE FROM usuarios", resolve);
    db.run("DELETE FROM lojas", resolve);
    db.run("DELETE FROM produtos", resolve);
    db.run("DELETE FROM compras", resolve);
    db.run("DELETE FROM vendedores", resolve);
  });
});

describe('Validações de Usuário', () => {
  test('Deve falhar ao registrar usuário sem nome', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({
        email: 'test@test.com',
        senha: 'test123',
        endereco: 'Test Address'
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Todos os campos são obrigatórios');
  });

  test('Deve falhar ao registrar usuário com email inválido', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({
        nome: 'Test User',
        email: 'emailinvalido',
        senha: 'test123',
        endereco: 'Test Address'
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Email inválido');
  });

  test('Deve falhar ao fazer login com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({
        email: 'naoexiste@test.com',
        senha: 'senha123'
      });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe('Usuário não encontrado');
  });

  test('Deve registrar um usuário válido com sucesso', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({
        nome: 'Test User',
        email: 'test@test.com',
        senha: 'test123',
        endereco: 'Test Address'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  test('Deve falhar ao registrar email duplicado', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({
        nome: 'Test User 2',
        email: 'test@test.com',
        senha: 'test123',
        endereco: 'Test Address'
      });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe('Email já cadastrado');
  });
});

describe('Validações de Loja', () => {
  beforeAll(async () => {
    // Fazer login para obter token
    const login = await request(app)
      .post('/usuarios/login')
      .send({
        email: 'test@test.com',
        senha: 'test123'
      });
    token = login.body.token;
  });

  test('Deve falhar ao registrar loja sem nome', async () => {
    const res = await request(app)
      .post('/negocio/registrarLoja')
      .set('Authorization', "Bearer " + token)
      .send({
        endereco: 'Endereço Teste',
        info: 'Informações da Loja'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  test('Deve falhar ao registrar loja sem autorização', async () => {
    const res = await request(app)
      .post('/negocio/registrarLoja')
      .send({
        nome: 'Loja Teste',
        endereco: 'Endereço Teste',
        info: 'Informações da Loja'
      });

    expect(res.status).toBe(401);
  });

  test('Deve registrar loja com dados válidos', async () => {
    const res = await request(app)
      .post('/negocio/registrarLoja')
      .set('Authorization', "Bearer " + token)
      .send({
        nome: 'Loja Teste',
        endereco: 'Endereço Teste',
        info: 'Informações da Loja Teste'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  test('Deve falhar ao tentar registrar segunda loja para mesmo vendedor', async () => {
    const res = await request(app)
      .post('/negocio/registrarLoja')
      .set('Authorization', "Bearer " + token)
      .send({
        nome: 'Loja Teste 2',
        endereco: 'Endereço Teste 2',
        info: 'Informações da Loja Teste 2'
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Vendedor já possui uma loja registrada');
  });
});

describe('Validações de Produto', () => {
  test('Deve falhar ao registrar produto sem preço', async () => {
    const res = await request(app)
      .post('/negocio/registroProduto')
      .set('Authorization', "Bearer " + token)
      .send({
        produto: 'Produto Teste'
      });

    expect(res.status).toBe(500);
  });

  test('Deve falhar ao registrar produto sem nome', async () => {
    const res = await request(app)
      .post('/negocio/registroProduto')
      .set('Authorization', "Bearer " + token)
      .send({
        preco: 99.99
      });

    expect(res.status).toBe(500);
  });

  test('Deve registrar produto com dados válidos', async () => {
    const res = await request(app)
      .post('/negocio/registroProduto')
      .set('Authorization', "Bearer " + token)
      .send({
        produto: 'Produto Teste',
        preco: 99.99
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});

describe('Validações de Compra', () => {
  test('Deve falhar ao tentar comprar sem produtos', async () => {
    const res = await request(app)
      .post('/negocio/compra')
      .set('Authorization', "Bearer " + token)
      .send({
        produtos: [],
        loja: {
          id: 1
        }
      });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe('Carrinho vazio');
  });

  test('Deve falhar ao tentar comprar sem token', async () => {
    const res = await request(app)
      .post('/negocio/compra')
      .send({
        produtos: [{
          id: 1,
          quantidade: 1,
          preco_unitario: 99.99,
          subtotal: 99.99
        }],
        loja: {
          id: 1
        }
      });

    expect(res.status).toBe(401);
  });

  test('Deve falhar ao tentar comprar com loja inexistente', async () => {
    const res = await request(app)
      .post('/negocio/compra')
      .set('Authorization', "Bearer " + token)
      .send({
        produtos: [{
          id: 1,
          quantidade: 1,
          preco_unitario: 99.99,
          subtotal: 99.99
        }],
        loja: {
          id: 99999
        }
      });

    expect(res.status).toBe(404);
  });

  test('Deve realizar compra com dados válidos', async () => {
    const res = await request(app)
      .post('/negocio/compra')
      .set('Authorization', "Bearer " + token)
      .send({
        produtos: [{
          id: 1,
          quantidade: 1,
          preco_unitario: 99.99,
          subtotal: 99.99
        }],
        loja: {
          id: 1
        }
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});