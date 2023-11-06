const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getRootFromMT } = require("../utils/newMerkletree.js");
const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const { addresses } = require("../utils/addresses.js");
const ADMIN_ROLE = getRole("ADMIN_ROLE");
const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");
const ROOT = getRootFromMT();

let cachedFixture = null;
async function loadPublicSaleFixture() {
    let eventEmitted = false;
    let emittedAddress = "";
    let emittedId = 0;

    const [owner, minterAddr, addr1] = await ethers.getSigners();
    const routerAddress = addresses.UNISWAP_ROUTER_ADDRESS;
    const factoryAddress = addresses.UNISWAP_FACTORY_ADDRESS;
    const bbitesToken = await deploySC("BBitesToken", []);
    const BBTKNProxyAddress = await bbitesToken.getAddress();
    const USDC = await deploySCNoUp("USDCoin", []);
    const USDCImplAdd = await USDC.getAddress();

    console.log(` deploying PublicSale with BBTKNProxyAddress: ${BBTKNProxyAddress} and USDCImplAdd: ${USDCImplAdd}`)

    const publicSale = await deploySC("PublicSale", [BBTKNProxyAddress, USDCImplAdd, routerAddress, factoryAddress]);

    console.log("Saldo de MSG.sender de USDC", await USDC.balanceOf(owner));
    console.log("Saldo de MSG.sender de BBTKN", await bbitesToken.balanceOf(owner));

    const liquidityProvider = await deploySCNoUp("LiquidityProvider", [
        routerAddress,
        factoryAddress,
        BBTKNProxyAddress,
        USDCImplAdd,
    ]);

    const liquidityProviderAddress = await liquidityProvider.getAddress();
    const amountADesired = pEth("1000000");  // Cantidad deseada para el BBTKN
    const amountBDesired = 500000 * (10 ** 6);  // Cantidad deseada para el USDC
    const to = await owner.getAddress();
    const deadline = new Date().getTime() + 60000;
    const txBBTKN = await bbitesToken.mint(liquidityProviderAddress, amountADesired);
    const resBBTKN = await txBBTKN.wait();

    console.log("hash tx send BBTKN", resBBTKN.hash);

    const txUSDC = await USDC.mint(liquidityProviderAddress, amountBDesired);
    const resUSDC = await txUSDC.wait();

    console.log("hash Tx send USDC", resUSDC.hash);

    const tx = await liquidityProvider.addLiquidity(
        amountADesired,
        amountBDesired,
        amountADesired,
        amountBDesired,
        to,
        deadline
    );
    const res = await tx.wait();

    console.log("Liquidez añadida con TX hash: ", res.hash);
    return {
        owner,
        minterAddr,
        addr1,
        bbitesToken,
        publicSale,
        USDC,
        eventEmitted,
        emittedAddress,
        emittedId

    };
}

before("Seteando contratos", async function () {
    if (!cachedFixture) {
        const fixtureData = await loadFixture(loadPublicSaleFixture);
        cachedFixture = fixtureData;
    }
    owner = cachedFixture.owner;
    minterAddr = cachedFixture.minterAddr;
    addr1 = cachedFixture.addr1;
    bbitesToken = cachedFixture.bbitesToken;
    publicSale = cachedFixture.publicSale;
    USDC = cachedFixture.USDC;
    eventEmitted = cachedFixture.eventEmitted;
    emittedAddress = cachedFixture.emittedAddress;
    emittedId = cachedFixture.emittedId;

    publicSale.on("PurchaseNftWithId", (addresses, id) => {
        eventEmitted = true;
        emittedAddress = addresses;
        emittedId = id;
        console.log(`Evento PurchaseNftWithId NFT a la billetera ${addresses} con id ${id} `)
    });
});

describe("Comprobanco el contrato PublicSale", function () {

    it("should be initialized with correct values", async function () {
        expect(await publicSale.routerAddress()).to.equal(addresses.UNISWAP_ROUTER_ADDRESS);
        expect(await publicSale.factoryAddress()).to.equal(addresses.UNISWAP_FACTORY_ADDRESS);
        expect(await publicSale.BBTKNaddress()).to.equal(await bbitesToken.getAddress());
        expect(await publicSale.USDCaddress()).to.equal(await USDC.getAddress());
    });
    it("shoud have enough BBTKN tokens", async function () {
        const balance = await bbitesToken.balanceOf(owner);
        console.log("balance", balance.toString());
        expect(balance).to.be.gte(ethers.parseEther("10000000"));
    });
    it("shoud have enough USDC tokens", async function () {
        const balance = await USDC.balanceOf(owner);
        console.log("balance", balance.toString());

        expect(balance).to.be.gte(ethers.parseUnits("10000000", 6));
    });

    it("should allow purchase of NFT with BBTKN tokens", async function () {
        const _id = 5;  // Example NFT ID
        const price = await publicSale.getPriceForId(_id);

        console.log("Precio del NFT", price.toString());

        let tx = await bbitesToken.connect(owner).approve(publicSale, price);
        await tx.wait();
        await publicSale.connect(owner).purchaseWithTokens(_id);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Espero 1 segundo para que se emita el evento
        expect(await publicSale.nftPurchased(_id)).to.be.true;
        expect(emittedId).to.equal(_id);
        expect(emittedAddress).to.equal(owner.address);
        expect(eventEmitted).to.be.true;
    });

    it("should allow purchase of NFT with USDC", async function () {
        const _id = 10;  // Example NFT ID
        const usdcAmount = ethers.parseUnits("1000000", 6);  // Example USDC amount
        const price = await publicSale.getPriceForId(_id);

        console.log("Precio del NFT", price.toString());

        let tx = await USDC.connect(owner).approve(publicSale, usdcAmount);


        console.log("Aprobacion de tokens USDC para la compra del NFT", tx.hash);

        await publicSale.connect(owner).purchaseWithUSDC(usdcAmount, _id);

        console.log("Compra de NFT con USDC", tx.hash);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Espero 1 segundo para que se emita el evento
        expect(await publicSale.nftPurchased(_id)).to.be.true;
        expect(emittedId).to.equal(_id);
        expect(emittedAddress).to.equal(owner.address);
        expect(eventEmitted).to.be.true;

    });


    it("should allow purchase of NFT with Ether", async function () {
        const _id = 750;  // Example NFT ID
        const etherAmount = ethers.parseEther("0.01");

        await publicSale.connect(addr1).purchaseWithEtherAndId(_id, { value: etherAmount });

        expect(await publicSale.nftPurchased(_id)).to.be.true;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Espero 1 segundo para que se emita el evento

        expect(emittedId).to.equal(_id);
        expect(emittedAddress).to.equal(addr1.address);
        expect(eventEmitted).to.be.true;
    });

    //this test works only with hardhat network forked from goerli
    // npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/c1oANXqAu408URmDw9WFiymFLKsYFYn- --fork-block-number 9615285

    it("should return the amount of USDC approximated to the amount of BBTKN", async function () {
        const _id = [10, 20, 50, 100, 300, 400, 500, 699];  // Example NFT ID
        for (let i = 0; i < _id.length; i++) {
            const price = await publicSale.getPriceForId(_id[i]);
            const parcePrice = ethers.formatUnits(price.toString(), 18);
            console.log(`Precio del NFT ${_id[i]} en BBTKN:`, parcePrice);

            const amountsIn = await publicSale.connect(owner).getAmountsIn(price);
            const amountInUSDC = amountsIn[0].toString();
            const parsedAmount = ethers.formatUnits(amountInUSDC, 6);
            console.log("USDC required for", parcePrice, "BBTKN:", parsedAmount, "USDC")
            expect(Number(parcePrice)).to.be.gte(Number(parsedAmount));

        }
    });

});




