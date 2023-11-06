var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deploySC } = require("../utils");
const { addresses } = require("../utils/addresses.js");
const MAX_PRICE_NFT = "90000";
const MAX_MULTIPLIER = ethers.parseEther(MAX_PRICE_NFT) // 90000 * 10**18
const startDate = 1696032000; // 30 de septiembre de 2023 en UNIX timestamp
const routerAddress = addresses.UNISWAP_ROUTER_ADDRESS;
const factoryAddress = addresses.UNISWAP_FACTORY_ADDRESS;
const BBTKNProxyAddress = addresses.BBTKN_CONTRACT_ADDRESS;
const USDCImplAdd = addresses.USDC_CONTRACT_ADDRESS;

before("Load Public Sale contract", async () => {
    publicSale = await deploySC("PublicSale", [BBTKNProxyAddress, USDCImplAdd, routerAddress, factoryAddress]);
});

describe("PublicSale tests with time manipulation starting in Block (9615286)", function () {
    it("should return the correct price for multiple ids over time, reaching max price", async function () {
        const id = 500; // exapmle id (_id >= 500 && _id <= 699)
        const increment = 86400; // Days in seconds
        let currentTime = startDate;
        let price;
        let days = 0;

        while (days < 364) { // seting 365 days as max time
            await time.setNextBlockTimestamp(currentTime);
            // Mine a new block with the new timestam
            await ethers.provider.send("evm_mine");
            const newBlock = await ethers.provider.getBlock("latest");
            console.log(`New block timestamp after mine: ${newBlock.timestamp}`);
            expect(newBlock.timestamp).to.equal(currentTime);

            price = await publicSale.getPriceForId(id);
            console.log(`Price for id ${id} at time ${new Date(currentTime * 1000).toISOString()}: ${ethers.formatUnits(price, 'ether')} USDC`);
            if (price >= MAX_MULTIPLIER) {
                break;
            }
            currentTime += increment;
            days++;
        }
        console.log(`total of days to get max price ${days}`);
        expect(price).to.equal(MAX_MULTIPLIER);
    });
});

/*
this should be completed before in hardhat.config.js 
networks: {
    hardhat: {
      forking: {
        url: process.env.GOERLI_TESNET_URL,
        blockNumber: 9615285 // Block Before the contract starts Sale (Block 9615286)
      }
    }, 

    or 

 npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/c1oANXqAu408URmDw9WFiymFLKsYFYn- --fork-block-number 9615285

*/