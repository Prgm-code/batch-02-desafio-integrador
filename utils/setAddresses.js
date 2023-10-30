// addresses.js

const fs = require('fs');
const path = require('path');

// Direcciones iniciales
const addresses = {
    BBTKN_CONTRACT_ADDRESS: "0x18a3CB0b9BA2A0821E6db9948a4FA5Ef0BC525c5",
    USDC_CONTRACT_ADDRESS: "0xc8296973777132DA02A2E77958215ef5A00e6169",
    PUBS_CONTRACT_ADDRESS: "0x64672C1560C7c37f979A17ebCb7FBcFe1423Fb07",
    CCNFT_CONTRACT_ADDRESS: "0xfE5eB98c7f63a31ac21AB632DD08123463973Fbc",
    LIQUIDITY_PROVIDER_CONTRACT_ADDRESS: "0xDCE41150a6690e028e4DF78bB20E96D6A1Df9D82",
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

