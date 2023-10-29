// addresses.js

const fs = require('fs');
const path = require('path');

// Direcciones iniciales
const addresses = {
    BBTKN_CONTRACT_ADDRESS: "0x3AfE758525A7C5F534696Ecc606331D59F3071f0",
    USDC_CONTRACT_ADDRESS: "0xb2ad6FF2A089D8D3443037141092F3C1a7A12af1",
    PUBS_CONTRACT_ADDRESS: "0x0d0521d7af4202b83e0cEA56296D5C5a0Fae152E",
    CCNFT_CONTRACT_ADDRESS: "0x111F3C7984a09c751C203F83b1eD3DEd8691318D",
    LIQUIDITY_PROVIDER_CONTRACT_ADDRESS: "0x0ef03Ed6fDCAFb27433f62D6590a317687ae82De",
    UNISWAP_ROUTER_ADDRESS: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_FACTORY_ADDRESS: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    GOERLI_RELAY_ADDRESS: "0x21cb1753289b7A29EF38e63E6daA7d9c59dF584d",
    MUMBAI_RELAY_ADDRESS: "0x89709B96d95194FE305FF249883f77Ce0C679BdA"
};

// Función para actualizar las direcciones
function updateAddress(contractName, address) {
    const filePath = path.join(__dirname, 'addresses.js');
    let fileContent = fs.readFileSync(filePath, 'utf8');

    const regex = new RegExp(`${contractName}: ".*",`, 'g');
    const replacement = `${contractName}: "${address}",`;

    fileContent = fileContent.replace(regex, replacement);

    fs.writeFileSync(filePath, fileContent);
}

module.exports = {
    addresses,
    updateAddress
};

