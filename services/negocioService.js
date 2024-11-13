exports.calcularPreco = (produtos) =>{
    var precoTotal = 0;
    produtos.forEach(item => {
        precoTotal += item.subtotal;
    });
    return precoTotal;
}