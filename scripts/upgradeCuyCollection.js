const { ethers, upgrades } = require("hardhat");
const {
    verify, printAddress,
} = require("../utils");
const { addresses } = require("../utils/addresses");
async function upgrade() {

    const CCNFTProxyAddress = addresses.CCNFT_CONTRACT_ADDRESS;
    const CCNFT = await ethers.getContractFactory("CuyCollectionNft");
    try {
        // Actualiza el contrato proxy
        const ccnft = await upgrades.upgradeProxy(CCNFTProxyAddress, CCNFT);
        console.log("Tx upgrade contract",ccnft.hash)

        // Imprime la dirección del proxy y la implementación
        const implV3 = await printAddress("CuyCollectionNft Upgraded", CCNFTProxyAddress);  
        await verify(implV3, "CuyCollectionNft");
        console.log("Upgrade contract", implV3.hash)

        // Verifica el contrato
        await verify(CCNFTProxyAddress, "CuyCollectionNft");

    } catch (e) {
        return console.error("Error actualizando el contrato", e);
    }

}

upgrade().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}
);
