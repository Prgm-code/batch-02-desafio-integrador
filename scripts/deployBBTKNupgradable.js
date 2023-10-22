const { ethers, upgrades } = require("hardhat");
const {
    ex,
    verify,
    getRole,
    printAddress,
    deploySC,
    deploySCNoUp,
    pEth,
} = require("../utils");

// Address del contrato proxy: 0x95821905e59E195C5232db0fC308991CE9581C5e
async function deployPublicSale () {
    const BBTKNAddress ="0x000"
    const USDCAddress = ""
    const bbitesToken = await deploySC("PublicSale", [ BBTKNAddress, USDCAddress ]);

}


async function main() {
    

    const bbitesToken = await deploySC("BBitesToken", [  ]);
    /*  const BBitesToken = await ethers.getContractFactory("BBitesToken");
     const bbitesToken =  await upgrades.deployProxy(BBitesToken, [],{
         kind: "uups"
     });
 
     const tx = await bbitesToken.waitForDeployment();
     await tx.deploymentTransaction().wait(5);
  */

    const implAdd = await printAddress("BBitesToken", await bbitesToken.getAddress());
    /* const implementationAddress = await upgrades.erc1967.getImplementationAddress(
       await bbitesToken.getAddress()
    );
    console.log("Address del Proxy es:", await bbitesToken.getAddress());
    console.log("Address de la implementacion", implementationAddress); */

    await verify(implAdd, "BBitesToken");

    /*     await hre.run("verify:verify", {
            address: implementationAddress,
            constructorArguments: [],
        }); */
}
async function upgrade() {

    const ProxyAddress = "0x54e9e4cf20fca3dFB5b51f7C0e131f3e8382E514";
    const BBitesToken = await ethers.getContractFactory("PublicSale");
    try {
        // Actualiza el contrato proxy
        const bBitesToken = await upgrades.upgradeProxy(ProxyAddress, BBitesToken);
        console.log(bBitesToken)

        // Imprime la dirección del proxy y la implementación
        const implV3 = await printAddress("PublicSale V3", ProxyAddress);

        // Verifica el contrato
        await verify(implV3, "PublicSale");

    } catch (e) {
        return console.error("Error actualizando el contrato", e);
    }

}

upgrade().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}
);
