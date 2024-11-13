const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Modulo de api

const secretKey = 'chave-secreta'; // Use uma chave mais segura em produção


// Registrar novo usuário
exports.protegerSenha = async (senha) => {
    const senhaHash = await bcrypt.hash(senha, 10);
    return senhaHash
};

exports.verificarSenha = async (senha, usuario) =>{
    const isPasswordValid = await bcrypt.compare(senha, usuario.senha);

    if (!isPasswordValid) throw new Error('Senha incorreta');

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, secretKey, { expiresIn: '1h' });
    return { token };
  
};

exports.autenticarJWT = (token) => {
    if (!token) {
        throw new Error('Faça login novamente');  // Sem token
    }

    try {
        
        const tokenSemBearer = token.split(' ')[1]; // Remove "Bearer "

        // Verifica o token de forma síncrona
        const decoded = jwt.verify(tokenSemBearer, secretKey);
        return true;  // Token válido
    } catch (err) {
        throw new Error('Token inválido ou expirado');  // Erro de token
    }
};

exports.getUserId = (token) => {
    // Verifique se o token começa com "Bearer " e extraia o token
    if (!token || !token.startsWith('Bearer ')) {
        throw new Error('Token inválido');
    }

    const tokenSemBearer = token.split(' ')[1]; // Remove "Bearer "

    try {
        // Decodifica o token e extrai o payload
        const decoded = jwt.verify(tokenSemBearer, secretKey);
        return decoded.id; // Supondo que o ID do vendedor esteja no campo 'id'
    } catch (error) {
        throw new Error('Token inválido ou expirado');
    }
};

exports.verificarEmail = (email) =>{
    // Expressão regular para validar o formato do e-mail
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}