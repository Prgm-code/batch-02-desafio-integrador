const { ethers, upgrades } = require("hardhat");
const {
    verify,
    printAddress,
} = require("../utils");
const { addresses } = require("../utils/addresses");
async function upgrade() {

    const ProxyAddress = addresses.PUBS_CONTRACT_ADDRESS;
    const PublicSale = await ethers.getContractFactory("PublicSale");
    try {
        // Actualiza el contrato proxy
        const publicSale = await upgrades.upgradeProxy(ProxyAddress, PublicSale);
        console.log("Tx upgrade contract", publicSale.hash)

        // Imprime la dirección del proxy y la implementación
        const implV3 = await printAddress("PublicSale upgraded", ProxyAddress);
        await verify(implV3, "PublicSale");
        console.log("Upgrade contract", implV3)

        // Verifica el contrato
        await verify(ProxyAddress, "PublicSale");

    } catch (e) {
        return console.error("Error actualizando el contrato", e);
    }

}

upgrade().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}
);

//npx hardhat --network goerli run scripts/upgradePS.js 
