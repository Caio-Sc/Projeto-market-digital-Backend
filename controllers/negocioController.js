const db = require('../db/db');
const auth = require('../services/autenticacao');
const servicoNegocio = require('../services/negocioService')

exports.pegarLojas = (req, res) => {
    const sql = "SELECT * FROM lojas";
    console.log("Requisição recebida Pegar lojas");
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log("Erro ao pegar lojas");
            return res.status(500).json({ "erro": err.message });
        }
        console.log("Lojas pegas: ", rows);
        res.json({ "lojas": rows });
    });
};

exports.pegarProdutos = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM produtos WHERE loja = ?';
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ "erro": err.message });
        }
        if (rows) {
            res.json({ "produtos": rows });
        } else {
            res.status(404).json({ "erro": "Loja não encontrada" });
        }
    });
}

exports.deletarProduto = (req, res) => {
    const token = req.headers['authorization'];
    const produtoId = req.params.id;

    try {
        // Verifica autenticação
        auth.autenticarJWT(token);
        const vendedorID = auth.getUserId(token);

        // Primeiro verifica se o produto pertence à loja do vendedor
        const checkProduto = `
            SELECT p.* 
            FROM produtos p 
            JOIN vendedores v ON p.loja = v.loja 
            WHERE p.id = ? AND v.usuario = ?
        `;

        db.get(checkProduto, [produtoId, vendedorID], (err, produto) => {
            if (err) {
                return res.status(500).json({ "erro": err.message });
            }
            
            if (!produto) {
                return res.status(403).json({ 
                    "erro": "Produto não encontrado ou não pertence à sua loja" 
                });
            }

            // Se o produto existe e pertence ao vendedor, deleta
            const deleteSql = 'DELETE FROM produtos WHERE id = ?';
            db.run(deleteSql, [produtoId], function(err) {
                if (err) {
                    return res.status(500).json({ "erro": err.message });
                }
                
                if (this.changes > 0) {
                    res.json({ "mensagem": "Produto deletado com sucesso" });
                } else {
                    res.status(404).json({ "erro": "Produto não encontrado" });
                }
            });
        });

    } catch(error) {
        return res.status(401).json({ "erro": error.message });
    }
};

exports.compraCarrinho = (req, res) => {
    const produtos = req.body.produtos; 
    const loja = req.body.loja; 
    const token = req.headers['authorization']; 
    if (!token) {
        return res.status(401).json({ "erro": "Token não fornecido" });
    }

    if (!Array.isArray(produtos)) {
        return res.status(400).json({ "erro": "A lista de produtos deve ser um array." });
    }
    if (!auth.autenticarJWT(token)) {
        return res.status(401).json({ "erro": "Token inválido" });
    }
    
    userid = auth.getUserId(token);
    //Calcula preço total da compra
    const precoTotal = servicoNegocio.calcularPreco(produtos);
    console.log("id loja " + loja.id);
    this.pegarVendedor(loja.id, (err, vendedor) => {
        if (err) {
            console.log(err)
            return res.status(err.status || 500).json({ "erro": err.message });
        }
        
        if (precoTotal > 0) {
            const sql = 'INSERT INTO compras (comprador, vendedor, loja, valor_total) VALUES (?, ?, ?, ?)';
            db.run(sql, [userid, vendedor.id, loja.id, precoTotal], function(err) {
                if (err) {
                    return res.status(500).json({ "erro": err.message });
                }
                res.json({ "mensagem": "Compra realizada", "id": this.lastID });
            });
        } else {
            return res.status(404).json({ "erro": "Carrinho vazio" });
        }
    });
}

// Modificado para receber um callback
exports.pegarVendedor = (lojaId, callback) => {
    const sql = 'SELECT * FROM vendedores WHERE loja = ?';
    db.get(sql, [lojaId], (err, row) => { 
        if (err) {
            return callback({ status: 500, message: err.message });
        }
        if (row) {
            return callback(null, row); 
        } else {
            return callback({ status: 404, message: "Loja não encontrada" });
        }
    });
}

exports.pegarVendedorToken = (req, res) => {
    const token = req.headers['authorization'];
    const vendedorID = auth.getUserId(token);
    auth.autenticarJWT(token);
    this.pegarVendedor(vendedorID, (err, vendedor) => {
        if (err) {
            return res.status(err.status || 500).json({ "erro": err.message });
        }
        if (vendedor) {
            res.json(vendedor);
        } else {
            res.status(404).json({ "erro": "Vendedor não encontrado" });
        }
    });
}

exports.pegarLoja = (vendedorID, callback) => {
    const sql = 'SELECT * FROM vendedores WHERE id = ?'; // Corrigido para buscar a loja pelo ID do vendedor
    db.get(sql, [vendedorID], (err, row) => { 
        if (err) {
            return callback({ status: 500, message: err.message });
        }
        if (row) {
            return callback(null, row); 
        } else {
            return callback({ status: 404, message: "Loja não encontrada" });
        }
    });
}

exports.registrarProduto = (req, res) => {
    const token = req.headers['authorization']; 

    if (!token) {
        return res.status(401).json({ "erro": "Token não fornecido" });
    }

    if (!auth.autenticarJWT(token)) {
        return res.status(401).json({ "erro": "Token inválido" });
    }

    const { produto, preco } = req.body;
    
    const vendedorID = auth.getUserId(token); 

    this.pegarLoja(vendedorID, (err, loja) => { 
        if (err) {
            return res.status(err.status || 500).json({ "erro": err.message });
        }

        const sql = 'INSERT INTO produtos (loja, produto, preco) VALUES (?, ?, ?)';
        db.run(sql, [loja.id, produto, preco], function(err) {
            if (err) {
                return res.status(500).json({ "erro": err.message });
            }
            res.json({ "mensagem": "Produto registrado com sucesso!", "id": this.lastID }); 
        });
    });
}

exports.registrarLoja = (req, res) => {
    const token = req.headers['authorization'];
    const { endereco, nome, info } = req.body;
    let vendedorID

    if (!token) {
        return res.status(401).json({ "erro": "Token não fornecido" });
    }

    if (nome == undefined || endereco == undefined || info == undefined) {
        return res.status(400).json({ "erro": "Todos os campos são obrigatórios" });
    }

    try {
        auth.autenticarJWT(token);
        vendedorID = auth.getUserId(token);
    } catch(error) {  
        return res.status(401).json({"erro": error.message})
    }

    // Verifica se o vendedor já tem uma loja
    const checkVendedor = 'SELECT * FROM vendedores WHERE usuario = ?';
    db.get(checkVendedor, [vendedorID], (err, vendedor) => {
        if (err) {
            return res.status(500).json({ "erro": err.message });
        }
        if (vendedor) {
            return res.status(400).json({ "erro": "Vendedor já possui uma loja registrada" });
        }

        // Verifica se já existe uma loja com o mesmo nome/endereço
        const checkLoja = 'SELECT * FROM lojas WHERE nome = ? OR endereco = ?';
        db.get(checkLoja, [nome, endereco], (err, loja) => {
            if (err) {
                return res.status(500).json({ "erro": err.message });
            }
            if (loja) {
                return res.status(400).json({ "erro": "Já existe uma loja com este nome ou endereço" });
            }

            // Insere a nova loja
            const sql = 'INSERT INTO lojas (endereco, nome, info) VALUES (?, ?, ?)';
            db.run(sql, [endereco, nome, info], function (err) {
                if (err) {
                    return res.status(500).json({ "erro": err.message });
                }
                const lojaid = this.lastID;

                // Insere o vendedor
                const sqlvendedor = 'INSERT INTO vendedores (usuario, loja) VALUES (?, ?)';
                db.run(sqlvendedor, [vendedorID, lojaid], function (err) {
                    if (err) {
                        return res.status(500).json({ "erro": err.message });
                    }

                    // Atualiza o tipo do usuário
                    const updateTipoUsuario = 'UPDATE usuarios SET tipo_usuario = 1 WHERE id = ?';
                    db.run(updateTipoUsuario, [vendedorID], function (err) {
                        if (err) {
                            return res.status(500).json({ "erro": err.message });
                        }
                        res.json({ "mensagem": "Loja e vendedor registrados com sucesso!", "id": lojaid });
                    });
                });
            });
        });
    });
}

exports.atualizarLoja = (req, res) =>{
    const token   = req.headers['authorization'];
    const { endereco, nome, info, imagem } = req.body;
    let vendedorid;
    if (auth.autenticarJWT(token) == true){
        try{
            vendedorid = auth.getUserId(token);
        }catch(error){
            res.status(401).json({"erro": error.message})
        }

        const sql = 'SELECT * FROM vendedores WHERE id = ?'; 
        db.get(sql, [vendedorid], (err, vendedor) => { 
            if (err) {
                return res.status(500).json({ "erro": err.message });
            }
            if (vendedor) {
                const sqlatualizar = 'UPDATE lojas SET endereco= ?, nome = ?, info = ?, imagem = ? WHERE id = ?';
                db.run(sqlatualizar, [endereco, nome, info, imagem, vendedor.loja], function(err) {
                    if (err) {
                        return res.status(500).json({ "erro": err.message });
                    }
                    if (this.changes > 0) {
                        res.json({ "mensagem": "Loja atualizada com sucesso" });
                    } else {
                        res.status(404).json({ "erro": "Loja não encontrada" });
                    }
                });
            } else {
                res.status(404).json({ "message": "Usuario não encontrado" });
            }
        });

    }

}