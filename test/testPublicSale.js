var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");
const { getRootFromMT, getProofs } = require("../utils/newMerkletree.js");


const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const { addresses } = require("../utils/addresses.js");

const ADMIN_ROLE = getRole("ADMIN_ROLE"); 
const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");
const ROOT = getRootFromMT();


// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

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
});



describe("Comprobanco el contrato PublicSale", function () {



    it("should be initialized with correct values", async function () {
        expect(await publicSale.routerAddress()).to.equal(addresses.UNISWAP_ROUTER_ADDRESS);
        expect(await publicSale.factoryAddress()).to.equal(addresses.UNISWAP_FACTORY_ADDRESS);
        expect(await publicSale.BBTKNaddress()).to.equal(await bbitesToken.getAddress());
        expect(await publicSale.USDCaddress()).to.equal(await USDC.getAddress());
    });
    it ("shoud have enough BBTKN tokens", async function () {
        const balance = await bbitesToken.balanceOf(owner);
        console.log ("balance", balance.toString());
        expect(balance).to.be.gte(ethers.parseEther("10000000"));
    });
    it ("shoud have enough USDC tokens", async function () {
        const balance = await USDC.balanceOf(owner);
        console.log ("balance", balance.toString());

        expect(balance).to.be.gte(ethers.parseUnits("10000000", 6));
    });


    it("should allow purchase of NFT with BBTKN tokens", async function () {
        const _id = 5;  // Example NFT ID
        const price = await publicSale.getPriceForId(_id);

        console.log("Precio del NFT", price.toString());

        // Approve transfer
        const tx = await bbitesToken.connect(owner).approve(publicSale, price);
        await tx.wait();
        //console.log("Aprobacion de tokens BBTKN para la compra del NFT", tx.hash);

        await publicSale.connect(owner).purchaseWithTokens(_id);
        expect(await publicSale.nftPurchased(_id)).to.be.true;
    });

    it("should allow purchase of NFT with USDC", async function () {
        const _id = 10;  // Example NFT ID
        const usdcAmount = ethers.parseUnits("1000000", 6);  // Example USDC amount
        const price = await publicSale.getPriceForId(_id);
        console.log("Precio del NFT", price.toString());
  /*       try {
            const priceInUSDC = await publicSale.getAmountsIn(price);
            console.log("Precio aprox del NFT en USDC", priceInUSDC);
        } catch (error) {
            console.error("Error calling getAmountsIn: ", error);
        }
         */


        // Approve transfer
        let tx = await USDC.connect(owner).approve(publicSale, usdcAmount);
        await tx.wait();
        console.log("Aprobacion de tokens USDC para la compra del NFT", tx.hash);
       try {

        const tx =await publicSale.connect(owner).purchaseWithUSDC(usdcAmount, _id);
        await tx.wait();
        console.log("Compra de NFT con USDC", tx.hash);
        expect(await publicSale.nftPurchased(_id)).to.be.true;        
       }
         catch (error) {
          console.error("Error calling purchaseWithUSDC: ", error);
         }
    });


    it("should allow purchase of NFT with Ether", async function () {
        const _id = 750;  // Example NFT ID
        const etherAmount = ethers.parseEther("0.01");
        publicSale.on("PurchaseNftWithId", (addresses, id) => {
            eventEmitted = true;
            emittedAddress = addresses;
            emittedId = id;
            console.log(`Evento PurchaseNftWithId NFT a la billetera ${addresses} con id ${id} `)
        });
    
        await publicSale.connect(addr1).purchaseWithEtherAndId(_id, { value: etherAmount });
        expect(await publicSale.nftPurchased(_id)).to.be.true;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Espero 1 segundo para que se emita el evento

        expect(emittedId).to.equal(_id);
        expect(emittedAddress).to.equal(addr1.address);
        expect(eventEmitted).to.be.true;
    });



});
