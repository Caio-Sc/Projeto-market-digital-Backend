# Projeto Market Digital Backend

Este repositório contém o backend de um sistema de marketplace de marketing digital inspirado no modelo do iFood. O sistema oferece funcionalidades como cadastro e autenticação de usuários, cadastro de vendedores, criação e remoção de produtos para venda, além de um sistema de carrinho de compras para adição e remoção de itens.

## Funcionalidades

- Cadastro de Usuário: Permite que novos usuários se cadastrem na plataforma.
- Login de Usuário: Autenticação segura com gerenciamento de sessões/token.
- Cadastro de Vendedor: Usuários podem registrar-se como vendedores para anunciar produtos.
- Criação e Remoção de Produtos: Vendedores podem adicionar e remover seus produtos disponíveis para venda.
- Carrinho de Compras: Usuários podem adicionar e remover produtos do carrinho antes de finalizar a compra.

## Tecnologias Utilizadas

- Node.js
- Express
- Banco de dados (configuração recomendada em /db)
- Arquitetura MVC (Controllers, Services, Routes)

## Instalação

1. Clone o repositório: git clone https://github.com/Caio-Sc/Projeto-market-digital-Backend.git
2. Acesse a pasta: cd Projeto-market-digital-Backend
3. Instale as dependências: npm install
4. Configure o banco de dados de acordo com o necessário no diretório /db.
5. Execute o servidor: npm start

## Estrutura de Pastas

- /controllers — Lógica das funcionalidades
- /services — Serviços auxiliares, como autenticação e manipulação de dados
- /routes — Rotas da aplicação (endpoints HTTP)
- /db — Configuração e scripts do banco de dados
- /tests — Testes automatizados

## Exemplos de Rotas

POST /register — Cadastro de usuário  
POST /login — Login de usuário  
POST /seller/register — Cadastro de vendedor  
POST /product — Adição de produto para venda  
DELETE /product/:id — Remoção de produto  
POST /cart — Adição de produto ao carrinho  
DELETE /cart/:productId — Remoção de produto do carrinho  

Observação: Os endpoints e nomenclaturas podem evoluir ao longo do desenvolvimento.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature: git checkout -b feature/nome-da-feature
3. Faça commit das suas alterações: git commit -m 'feat: adiciona nova feature'
4. Faça push para sua branch: git push origin feature/nome-da-feature
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob os termos do arquivo LICENSE.

Desenvolvido por [Caio-Sc](https://github.com/Caio-Sc). Para dúvidas ou sugestões, abra uma issue no repositório.

