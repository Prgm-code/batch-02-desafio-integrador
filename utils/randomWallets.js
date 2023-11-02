function obtenerNumerosAleatoriosUnicos(num) {
    const numeros = new Set();

    while (numeros.size < num) {
        numeros.add(Math.floor(Math.random() * 1000));
    }

    return [...numeros];
}

module.exports = obtenerNumerosAleatoriosUnicos;