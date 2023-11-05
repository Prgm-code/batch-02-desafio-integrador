var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");
const { getRootFromMT, getProofs } = require("../utils/newMerkletree.js");
const randomWallets = require("../utils/randomWallets.js");

const accounts = require("../wallets/walletList.js");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const { hexlify } = require("ethers");
const { addresses } = require("../utils/addresses.js");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");
const ROOT = getRootFromMT();

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

async function createRandomWallets(num) {
    const walletsNumber = randomWallets(num);
    const walletList = []
    console.log("creando y asignando ethers a las billeteras random");
    const randomIdWallets = walletsNumber.map(num => num + 1000);
    const [deployer] = await ethers.getSigners();

    for (let i = 0; i < walletsNumber.length; i++) {
        let id = randomIdWallets[i];
        let privateKey = accounts.find(account => account.id === id).privateKey;
        let addressWallet = accounts.find(account => account.id === id).address;
        console.log("walletsNumber: ", id);
        walletList.push(await new ethers.Wallet(privateKey, ethers.provider));
        await deployer.sendTransaction({
            to: addressWallet,
            value: ethers.parseEther("0.09") // Enviar 1 Ether a cada billetera.
        });
    }
    return { walletList, randomIdWallets };
}

let cachedFixture = null;

async function loadCUYNFTFixture() {
    const [owner, minterAddr, addr1] = await ethers.getSigners();
    const cuyNFT = await deploySC("CuyCollectionNft", ["CuyCollection", "CCNFT", minterAddr.address]);

    const { walletList, randomIdWallets } = await createRandomWallets(5);

    return {
        owner,
        minterAddr,
        addr1,
        cuyNFT,
        walletList,
        randomIdWallets
    };
}

before("Seteando contratos", async function () {
    if (!cachedFixture) {
        const fixtureData = await loadFixture(loadCUYNFTFixture);
        cachedFixture = fixtureData;
    }

    owner = cachedFixture.owner;
    minterAddr = cachedFixture.minterAddr;
    addr1 = cachedFixture.addr1;
    cuyNFT = cachedFixture.cuyNFT;
    walletList = cachedFixture.walletList;
    randomIdWallets = cachedFixture.randomIdWallets;
});

describe("Testing Cuy Collection NFT", function () {
    it("Debe comprobar  el rol de minter a la cuenta minterAddr", async function () {
        console.log("minterAddr.address: ", minterAddr.address);
        expect(await cuyNFT.hasRole(MINTER_ROLE, minterAddr.address)).to.be.true;
    }
    );

    it("Debe comprobar el rol de minter a la cuenta addr1", async function () {
        expect(await cuyNFT.hasRole(MINTER_ROLE, addr1.address)).to.be.false;
    }
    );

    it("Debe mintear un NFT desde la cuenta minterAddr", async function () {
        const tx = await cuyNFT.connect(minterAddr).safeMint(minterAddr.address, 1);
        await tx.wait();
        expect(await cuyNFT.balanceOf(minterAddr.address)).to.equal(1);
    }

    );

    it("Debe intentar mintear un NFT fuera de la coleccion de ńft y fallar", async function () {
        const tx = await cuyNFT.connect(minterAddr).safeMint(minterAddr.address, 2001);
        await tx.wait();
        expect(await cuyNFT.balanceOf(addr1.address)).to.equal(0);
    });

});

describe("Minteo Whitelist", async function () {
    
    it("Asigna y el root del merkletree al contrato a traves de setMerkleRoot", async function () {
        const ROOT = getRootFromMT();
        const tx = await cuyNFT.connect(owner).setMerkleRoot(ROOT);
        await tx.wait();
        console.log("root: ", ROOT);
        expect(await cuyNFT.root()).to.equal(ROOT);
    });

    it("Mintea los nft de 5 billeteras random a traves de safemint whitelist con las proofs address e id", async function () {
        // testeo de minteo de nft a 5 billeteras random con las proofs address e id

        for (let i = 0; i < walletList.length; i++) {
            let id = randomIdWallets[i];
            let walletAddress = walletList[i].address
            let wallet = walletList[i];

            const proof = getProofs(id, walletAddress);
            let _proof = proof.map(ethers.hexlify);
            let _to = ethers.getAddress(walletAddress);
            let _id = parseInt(id, 10);
            //console.log("proof: ", _proof);
            //console.log("to: ", _to);
            //console.log("id: ", _id);
            console.log(`minteando NFT a la billetera ${walletAddress} con id ${id} `)
            const tx = await cuyNFT.connect(wallet).safeMintWhiteList(_proof, _to, _id);
            await tx.wait();
            expect(await cuyNFT.balanceOf(walletAddress)).to.equal(1);
        }
    });
    it("realiza el buyback de los nft de 5 billeteras random a traves de buyback con el id y espera el evento del contrato ", async function () {
        // testeo de buyBack de nft a 5 billeteras random con las proofs address e id
        for (let i = 0; i < walletList.length; i++) {
            let id = randomIdWallets[i];
            let walletAddress = walletList[i].address
            let wallet = walletList[i];

            let _id = parseInt(id, 10);
            let eventEmitted = false;
            let emittedAddress, emittedId;
            //suscribo a los eventos emitidiso por buy back 

            cuyNFT.on("Burn", (addresses, id) => {
                eventEmitted = true;
                emittedAddress = addresses;
                emittedId = id;
            });

            console.log(`Evento buyBack NFT a la billetera ${walletAddress} con id ${id} `)
            const tx = await cuyNFT.connect(wallet).buyBack(_id);
            await tx.wait();
            expect(await cuyNFT.balanceOf(walletAddress)).to.equal(0);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espero 1 segundo para que se emita el evento
            expect(emittedId).to.equal(_id);
            expect(emittedAddress).to.equal(walletAddress);
            expect(eventEmitted).to.be.true;

        }

    });
    it("realiza nuevameente buyback i debe fallar porque ya no hay nft en la billetera", async function () {

        let id = randomIdWallets[0];
        let walletAddress = walletList[0].address
        let wallet = walletList[0];

        let _id = parseInt(id, 10);

        try {
            const tx = await cuyNFT.connect(wallet).buyBack(_id);
            await tx.wait();
        } catch (e) {
            expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'ERC721: invalid token ID'");
        }
        expect(await cuyNFT.balanceOf(walletAddress)).to.equal(0);
    });



});
