import { Contract, ethers } from "ethers";
import { getRootFromMT, getProofs } from "../utils/merkleTree";
import { addresses } from "../utils/addresses";

import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bbitesTokenAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import nftTknAbi from "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json";

// import publicSaleAbi
// import nftTknAbi

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
//import buffer from "buffer/";
//import walletAndIds from "../wallets/walletList";
//import { MerkleTree } from "merkletreejs";
//var Buffer = buffer.Buffer;

/* function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
    .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
    .slice(2),
    "hex"
    );
  } */
// function buildMerkleTree() {
//   var elementosHasheados;
//   merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
//     sortPairs: true,
//   });
// }

var merkleTree;
var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

function initSCsGoerli() {
  provider = new ethers.BrowserProvider(window.ethereum);

  usdcAddress = addresses.USDC_CONTRACT_ADDRESS;
  bbitesTknAdd = addresses.BBTKN_CONTRACT_ADDRESS;
  pubSContractAdd = addresses.PUBLIC_SALE_CONTRACT_ADDRESS;

  usdcTkContract = new Contract(usdcAddress, usdcTknAbi, provider); // = new Contract(...
  bbitesTknContract = new Contract(bbitesTknAdd, bbitesTokenAbi, provider); // = new Contract(...
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi, provider); // = new Contract(...
}

function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);

  var nftAddress = addresses.NFT_CONTRACT_ADDRESS;

  nftContract = new Contract(nftAddress, nftTknAbi, provider); // = new Contract(...
}

function setUpListeners() {
  // Connect to Metamask
  var bttn = document.getElementById("connect");
  var walletIdEl = document.getElementById("walletId");
  bttn.addEventListener("click", async function () {
    if (window.ethereum) {
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Billetera metamask", account);
      walletIdEl.innerHTML = account;
      signer = await provider.getSigner(account);
    }
  });

  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await usdcTkContract.balanceOf(account);
    var balanceEl = document.getElementById("usdcBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 6);
  });

  // Bbites token Balance - balanceOf
  var bbitesBtn = document.getElementById("bbitesUpdate");
  bbitesBtn.addEventListener("click", async function () {
    var balance = await bbitesTknContract.balanceOf(account);
    var balanceEl = document.getElementById("bbitesBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 18);
  });
  // APPROVE BBTKN
  const approveBbitesBtn = document.getElementById("approveButtonBBTkn");
  approveBbitesBtn.addEventListener("click", async function () {
    let amount = approveBbitesBtn.value;
    await bbitesTknContract.approve(pubSContractAdd, amount);
  });

  // APPROVE USDC
  // usdcTkContract.approve
  const approveUsdcBtn = document.getElementById("approveButtonUSDC");
  approveUsdcBtn.addEventListener("click", async function () {
    let amount =approveUsdcBtn.value;
    await usdcTkContract.approve(pubSContractAdd, amount);
  });

  // purchaseWithTokens
  var bttn = document.getElementById("purchaseButton");

  // purchaseWithUSDC
  var bttn = document.getElementById("purchaseButtonUSDC");

  // purchaseWithEtherAndId
  var bttn = document.getElementById("purchaseButtonEtherId");

  // send Ether
  var bttn = document.getElementById("sendEtherButton");

  // getPriceForId
  var bttn = document.getElementById("getPriceNftByIdBttn");

  // getProofs
  var bttn = document.getElementById("getProofsButtonId");
  bttn.addEventListener("click", async () => {
    var id;
    var address;
    var proofs = getProofs(id, address);
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  var bttn = document.getElementById("safeMintWhiteListBttnId");
  // usar ethers.hexlify porque es un array de bytes
  // var proofs = document.getElementById("whiteListToInputProofsId").value;
  // proofs = JSON.parse(proofs).map(ethers.hexlify);

  // buyBack
  var bttn = document.getElementById("buyBackBttn");
}

function setUpEventsContracts() {
  var pubSList = document.getElementById("pubSList");
  pubSContract.on("PurchaseNftWithId", (buyer, tokenId, value, event) => {
    var li = document.createElement("li");
    li.textContent = `Buyer: ${buyer}, Token ID: ${tokenId.toString()}, Value: ${ethers.formatEther(value)}`;
    pubSList.appendChild(li);
  });

  var bbitesListEl = document.getElementById("bbitesTList");
  bbitesTknContract.on("Transfer", (from, to, amount, event) => {
    var li = document.createElement("li");
    li.textContent = `From: ${from}, To: ${to}, Amount: ${amount.toString()}`;
    bbitesListEl.appendChild(li);
  });

  var nftList = document.getElementById("nftList");
  nftContract.on("Transfer", (from, to, tokenId, event) => {
    var li = document.createElement("li");
    li.textContent = `From: ${from}, To: ${to}, Token ID: ${tokenId.toString()}`;
    nftList.appendChild(li);
  });

  var burnList = document.getElementById("burnList");
  nftContract.on("Burn", (owner, tokenId, event) => {
    var li = document.createElement("li");
    li.textContent = `Owner: ${owner}, Burned Token ID: ${tokenId.toString()}`;
    burnList.appendChild(li);
  });
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  initSCsGoerli();

  // initSCsMumbai

  // setUpListeners

  // setUpEventsContracts

  // buildMerkleTree
}

setUp()
  .then()
  .catch((e) => console.log(e));
