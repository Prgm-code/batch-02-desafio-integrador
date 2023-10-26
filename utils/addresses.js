// addresses.js

const fs = require('fs');
const path = require('path');

// Direcciones iniciales
const addresses = {
    BBTKN_CONTRACT_ADDRESS: "0x9bCe072437F38979894e8e89690A3CC13405832c",
    USDC_CONTRACT_ADDRESS: "0xFc01F25A87C4dDcF8B6c12fb5Ce44B75Cc56CB82",
    PUBS_CONTRACT_ADDRESS: "0x3Fcca8648651E5b974DD6d3e50F61567779772A8",
    CCNFT_CONTRACT_ADDRESS: "0x3Fcca8648651E5b974DD6d3e50F61567779772A8",
    LIQUIDITY_PROVIDER_CONTRACT_ADDRESS: "0x55671493844AC3D2A9C5849f7dad9236C9BE3d86",
    UNISWAP_ROUTER_ADDRESS: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_FACTORY_ADDRESS: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    GOERLI_RELAY_ADDRESS: "0x21cb1753289b7A29EF38e63E6daA7d9c59dF584d",
    MUMBAI_RELAY_ADDRESS: "0x89709B96d95194FE305FF249883f77Ce0C679Bd"
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

