const db = require('../db/db');
const auth = require('../services/autenticacao');

// Modulo de banco de dados

// Listar todos os usuários
exports.listarUsuarios = (req, res) => {
    const sql = "SELECT * FROM usuarios";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ "erro": err.message });
        }
        res.json({ "usuarios": rows });
    });
};

exports.obterUsuarioPorToken = (req, res) => {
    const jwt = req.headers['authorization'];
    console.log("jwt: ", jwt);
    console.log("Tentando obter usuário por token");
    if (!auth.autenticarJWT(jwt)) {
        return res.status(401).json({ "erro": "Token inválido" });
    }
    console.log("Autenticado");
    id = auth.getUserId(jwt);
    console.log("id: ", id);
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ "erro": err.message });
        }
        if (row) {
            console.log("Usuário encontrado");
            console.log(row);
            res.json({ "usuario": row });
        } else {
            res.status(404).json({ "erro": "Usuário não encontrado" });
        }
    });
};

// Criar novo usuário
exports.criarUsuario = async (req, res) => {
    console.log("Requisição recebida para criar usuário:", req.body);
    
    try {
        const { nome, email, senha, endereco } = req.body;
        
        // Validação dos campos obrigatórios
        if (!nome || !email || !senha || !endereco) {
            return res.status(400).json({ 
                "erro": "Todos os campos são obrigatórios" 
            });
        }

        if (!auth.verificarEmail(email)) {
            return res.status(400).json({ 
                "erro": "Email inválido" 
            });
        }

        const senhaProtegida = await auth.protegerSenha(senha);
        
        const sql = 'INSERT INTO usuarios (nome, email, senha, endereco, tipo_usuario) VALUES (?, ?, ?, ?, 0)';
        
        db.run(sql, [nome, email, senhaProtegida, endereco], function(err) {
            if (err) {
                // Se for erro de email duplicado
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ 
                        "erro": "Email já cadastrado" 
                    });
                }
                return res.status(500).json({ 
                    "erro": "Erro ao criar usuário" 
                });
            }
            res.status(201).json({ 
                "mensagem": "Usuário criado com sucesso", 
                "id": this.lastID 
            });
        });

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return res.status(500).json({ 
            "erro": "Erro interno do servidor" 
        });
    }
};



// Obter usuário por ID
exports.obterUsuarioPorId = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ "erro": err.message });
        }
        if (row) {
            res.json({ "usuario": row });
        } else {
            res.status(404).json({ "erro": "Usuário não encontrado" });
        }
    });
};

// Login de usuario
exports.logarUsuario = async (req, res) => {
    console.log("Requisição recebida para logar usuário:", req.body);
    const { nome, email, senha } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    try {
        // Envolvendo db.get em uma Promise
        const row = await new Promise((resolve, reject) => {
            db.get(sql, [email], (err, row) => {
                if (err) {
                    return reject(err); // Rejeita a Promise em caso de erro
                }
                resolve(row); // Resolve com a linha encontrada
            });
        });

        if (row) {
            const { token } = await auth.verificarSenha(senha, row);
            res.json({ "token": token });
        } else {
            res.status(404).json({ "erro": "Usuário não encontrado" });
        }
    } catch (error) {
        res.status(401).json({ "erro": error.message });
    }
};


// Atualizar usuário
exports.atualizarUsuario = (req, res) => {
    const { email, nome, endereco, tipo_usuario} = req.body;
    const jwt  = req.headers['authorization'];
    if (auth.autenticarJWT(jwt) == true){
        id = auth.getUserId(jwt);

        const sql = 'UPDATE usuarios SET nome = ?, email = ?, endereco = ?, tipo_usuario = ? WHERE id = ?';
        db.run(sql, [nome, email, endereco, tipo_usuario, id], function(err) {
            if (err) {
                return res.status(500).json({ "erro": err.message });
            }
            if (this.changes > 0) {
                res.json({ "mensagem": "Usuário atualizado com sucesso" });
            } else {
                res.status(404).json({ "erro": "Usuário não encontrado" });
            }
        });
    }
};

// Atualizar Senha de usuario
exports.atualizarSenhaUsuario = async (req, res) => {
    const jwt  = req.headers['authorization'];
    let id;

    if (auth.autenticarJWT(jwt) == true){

        try{
            id = auth.getUserId(jwt);
        }catch(error){
            res.status(401).json({"erro": error.message})
        }

        const { senha } = req.body;
        const senhaProtegida = await auth.protegerSenha(senha);

        const sql = 'UPDATE usuarios SET senha = ? WHERE id = ?';
        db.run(sql, [senhaProtegida, id], function(err) {
            if (err) {
                return res.status(500).json({ "erro": err.message });
            }
            if (this.changes > 0) {
                res.json({ "mensagem": "Usuário atualizado com sucesso" });
            } else {
                res.status(404).json({ "erro": "Usuário não encontrado" });
            }
        });
    }
};

// Deletar usuário
exports.deletarUsuario = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ "erro": err.message });
        }
        if (this.changes > 0) {
            res.json({ "mensagem": "Usuário deletado com sucesso" });
        } else {
            res.status(404).json({ "erro": "Usuário não encontrado" });
        }
    });
};