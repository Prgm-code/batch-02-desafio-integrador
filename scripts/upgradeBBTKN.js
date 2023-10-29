const { ethers, upgrades } = require("hardhat");
const {
    verify,
    printAddress,
} = require("../utils");
const { addresses } = require("../utils/addresses");
async function upgrade() {

    const ProxyAddress = addresses.BBTKN_CONTRACT_ADDRESS;
    const BBitesToken = await ethers.getContractFactory("BBitesToken");
    try {
        // Actualiza el contrato proxy
        const bBitesToken = await upgrades.upgradeProxy(ProxyAddress, BBitesToken);
        console.log("Tx upgrade contract", bBitesToken.hash)

        // Imprime la dirección del proxy y la implementación
        const implV3 = await printAddress("BBitesToken upgraded", ProxyAddress);
        await verify(implV3, "BBitesToken");
        console.log("Upgrade contract", implV3.hash)

        // Verifica el contrato
        await verify(ProxyAddress, "BBitesToken");

    } catch (e) {
        return console.error("Error actualizando el contrato", e);
    }

}

upgrade().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}
);
