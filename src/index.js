const { ethers, Contract } = require("ethers");
const getRootFromMT = require("../utils/merkleTreeFE").getRootFromMT;
const getProofs = require("../utils/merkleTreeFE").getProofs;
const addresses = require("../utils/addresses").addresses;

const usdcTknAbi = require("../artifacts/contracts/USDCoin.sol/USDCoin.json").abi;
const bbitesTokenAbi = require("../artifacts/contracts/BBitesToken.sol/BBitesToken.json").abi;
const publicSaleAbi = require("../artifacts/contracts/PublicSale.sol/PublicSale.json").abi;
const nftTknAbi = require("../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json").abi;


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

var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

function initSCsGoerli() {
  provider = new ethers.BrowserProvider(window.ethereum);

  usdcAddress = addresses.USDC_CONTRACT_ADDRESS;
  bbitesTknAdd = addresses.BBTKN_CONTRACT_ADDRESS;
  pubSContractAdd = addresses.PUBS_CONTRACT_ADDRESS;

  usdcTkContract = new Contract(usdcAddress, usdcTknAbi, provider); // = new Contract(...
  bbitesTknContract = new Contract(bbitesTknAdd, bbitesTokenAbi, provider); // = new Contract(...
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi, provider); // = new Contract(...
}

async function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);

  var nftAddress = addresses.CCNFT_CONTRACT_ADDRESS;

  nftContract = new Contract(nftAddress, nftTknAbi, provider); // = new Contract(...
}

async function setUpListeners() {
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
  const usdcUpdate = document.getElementById("usdcUpdate");
  const balanceElusdc = document.getElementById("usdcBalance");
  usdcUpdate.addEventListener("click", async function () {
    try {
      var balance = await bbitesTknContract.balanceOf(account);
      balanceElusdc.innerHTML = ethers.formatUnits(balance, 18);
    } catch (error) {
      console.log(error);
    }
  });

  // Bbites token Balance - balanceOf
  var bbitesTknUpdate = document.getElementById("bbitesTknUpdate");
  var bbitesTknBalance = document.getElementById("bbitesTknBalance");
  bbitesTknUpdate.addEventListener("click", async function () {
    try {
      var balance = await bbitesTknContract.balanceOf(account);
      bbitesTknBalance.innerHTML = ethers.formatUnits(balance, 18);
    } catch (error) {
      console.log(error);
    }
  });
  // APPROVE BBTKN
  const approveBbitesBtn = document.getElementById("approveButtonBBTkn");
  const approveInput = document.getElementById("approveInput");
  const approveError = document.getElementById("approveError");
  const approveSuccess = document.getElementById("approveSuccess");
  approveBbitesBtn.addEventListener("click", async function () {
    try {

      let amount = approveInput.value;
      let tx = await bbitesTknContract
        .connect(signer)
        .approve(pubSContractAdd, amount);
      let response = await tx.wait();
      console.log(response.hash);
      approveSuccess.innerHTML = `Transaccion exitosa con hash ${response.hash}`
    } catch (error) {
      approveError.innerHTML = `Error en la transaccion ${error.message}`;
      console.log(error);
    }


  });

  // APPROVE USDC
  // usdcTkContract.approve
  const approveUsdcBtn = document.getElementById("approveButtonUSDC");
  const approveInputUSDC = document.getElementById("approveInputUSDC");
  const approveSuccessUSDC = document.getElementById("approveSuccessUSDC");
  approveUsdcBtn.addEventListener("click", async function () {
    try {
      let amount = approveInputUSDC.value;
      let tx = await usdcTkContract
        .connect(signer)
        .approve(pubSContractAdd, amount);
      let response = await tx.wait();
      console.log(response.hash);
      approveSuccessUSDC.innerHTML = `Transaccion exitosa con hash ${response.hash}`
    } catch (error) {
      let approveErrorUSDC = document.getElementById("approveErrorUSDC");
      approveErrorUSDC.innerHTML = error.message;
    }
  });

  // purchaseWithTokens
  const purchaseButton = document.getElementById("purchaseButton");
  const purchaseInput = document.getElementById("purchaseInput");
  const purchaseSuccess = document.getElementById("purchaseSuccess");
  const purchaseError = document.getElementById("purchaseError");
  purchaseButton.addEventListener("click", async function () {
    try {
      let amount = purchaseInput.value;
      let tx = await pubSContract
        .connect(signer)
        .purchaseWithTokens(amount);;
      let response = await tx.wait();
      console.log(response.hash);
      purchaseSuccess.innerHTML = `Transaccion exitosa con hash ${response.hash}`
    } catch (error) {
      console.log(error);
      purchaseError.innerHTML = `Error en la transaccion ${error.message}`;
    }
  });



  // purchaseWithUSDC
  const purchaseButtonUSDC = document.getElementById("purchaseButtonUSDC");
  const purchaseInputUSDC = document.getElementById("purchaseInputUSDC");
  const amountInUSDCInput = document.getElementById("amountInUSDCInput");
  const purchaseSuccessUSDC = document.getElementById("purchaseSuccessUSDC");
  const purchaseErrorUSDC = document.getElementById("purchaseErrorUSDC");
  purchaseButtonUSDC.addEventListener("click", async function () {
    try {
      let id = purchaseInputUSDC.value;
      let amount = amountInUSDCInput.value;
      let tx = await pubSContract
        .connect(signer)
        .purchaseWithUSDC(id, amount);
      let response = await tx.wait();
      console.log(response.hash);
      purchaseSuccessUSDC.innerHTML = `Transaccion exitosa con hash ${response.hash}`
    } catch (error) {
      console.log(error);
      purchaseErrorUSDC.innerHTML = `Error en la transaccion ${error.message}`;
    }

  });


  // purchaseWithEtherAndId
  const purchaseButtonEtherId = document.getElementById("purchaseButtonEtherId");
  const purchaseInputEtherId = document.getElementById("purchaseInputEtherId");
  const purchaseSuccessEtherId = document.getElementById("purchaseSuccessEtherId");
  const purchaseEtherIdError = document.getElementById("purchaseEtherIdError");

  purchaseButtonEtherId.addEventListener("click", async function () {
    try {
      let idx = purchaseInputEtherId.value
      if (idx < 700 || idx >= 1000) throw new Error("Invalid ID");
      let id = parseInt(purchaseInputEtherId.value, 10);
      const priceInEther = ethers.parseEther("0.01"); // 0.01 Ether


      let tx = await pubSContract
        .connect(signer)
        .purchaseWithEtherAndId(id, { value: priceInEther });
      let res = await tx.wait();
      console.log(res.hash);
      purchaseSuccessEtherId.innerHTML = `Transaccion exitosa con hash ${res.hash}`
    } catch (error) {
      console.log(error);
      purchaseEtherIdError.innerHTML = `Error en la transaccion ${error.message}`
    }
  })


  // send Ether
  const sendEtherButton = document.getElementById("sendEtherButton");
  const sendEtherSuccess = document.getElementById("sendEtherSuccess");
  const sendEtherInput = ethers.parseEther("0.01"); // 0.01 Ether
  sendEtherButton.addEventListener("click", async function () {
    try {
      const amount = sendEtherInput;
      const tx = await pubSContract
        .connect(signer)
        .depositEthForARandomNft({ value: amount });
      const response = await tx.wait();
      console.log("Transacción confirmada:", response.transactionHash);
      sendEtherSuccess.innerHTML = `Transaccion exitosa con hash ${response.hash}`
    } catch (error) {
      const sendEtherError = document.getElementById("sendEtherError");
      sendEtherError.innerHTML = error.message;
      console.error("Error al enviar Ether:", error.message);
    }

  })

  // getPriceForId
  const getPriceNftByIdBttn = document.getElementById("getPriceNftByIdBttn");
  const priceNftIdInput = document.getElementById("priceNftIdInput");
  const priceNftByIdText = document.getElementById("priceNftByIdText");
  const getPriceNftError = document.getElementById("getPriceNftError");
  getPriceNftByIdBttn.addEventListener("click", async function () {
    try {
      let id = priceNftIdInput.value;
      let price = await pubSContract.getPriceForId(id);
      priceNftByIdText.innerHTML = price.toString();
    } catch (error) {
      getPriceNftError.innerHTML = error.message;
      console.log(error);
    }
  })



  // getProofs
  const getProofsButtonId = document.getElementById("getProofsButtonId");
  const showProofsTextId = document.getElementById("showProofsTextId");
  const inputIdProofId = document.getElementById("inputIdProofId");
  const inputAccountProofId = document.getElementById("inputAccountProofId");
  getProofsButtonId.addEventListener("click", async () => {
    let id = inputIdProofId.value;
    let address = inputAccountProofId.value;
    var proofs = getProofs(id, address);
    navigator.clipboard.writeText(JSON.stringify(proofs));
    showProofsTextId.innerHTML = JSON.stringify(proofs);
  });

  // safeMintWhiteList
  const safeMintWhiteListBttnId = document.getElementById("safeMintWhiteListBttnId");
  const whiteListToInputId = document.getElementById("whiteListToInputId");
  const whiteListToInputTokenId = document.getElementById("whiteListToInputTokenId");
  const whiteListToInputProofsId = document.getElementById("whiteListToInputProofsId");
  const whiteListErrorId = document.getElementById("whiteListErrorId");
  const safeMintWhiteListSuccessId = document.getElementById("safeMintWhiteListSuccessId");
  safeMintWhiteListBttnId.addEventListener("click", async () => {

    try {
      let proofs = whiteListToInputProofsId.value;
      let proofsBytes = JSON.parse(proofs).map(ethers.hexlify);
      let to = signer.address;
      let tokenId = whiteListToInputTokenId.value;
      let tx = nftContract
        .connect(signer)
        .safeMintWhiteList(to, tokenId, proofsBytes);;
      let res = await tx.wait();
      console.log(res.hash);
      safeMintWhiteListSuccessId.innerHTML = `Transaccion exitosa con hash ${res.hash}`
    } catch (error) {
      whiteListErrorId.innerHTML = error.message;
      console.log(error);
    }
  });


  // usar ethers.hexlify porque es un array de bytes
  // var proofs = document.getElementById("whiteListToInputProofsId").value;
  // proofs = JSON.parse(proofs).map(ethers.hexlify);

  // buyBack
  const buyBackBttn = document.getElementById("buyBackBttn");
  const buyBackInputId = document.getElementById("buyBackInputId");
  const buyBackErrorId = document.getElementById("buyBackErrorId");
  const buyBackSuccessId = document.getElementById("buyBackSuccessId");
  buyBackBttn.addEventListener("click", async () => {
    try {
      let tokenId = buyBackInputId.value;
      let tx = await pubSContract
        .connect(signer)
        .buyBack(tokenId);
      let res = await tx.wait();
      console.log(res.hash);
      buyBackSuccessId.innerHTML = `Transaccion exitosa con hash ${res.hash}`
    } catch (error) {
      buyBackErrorId.innerHTML = error.message;
      console.log(error);
    }
  });
}


async function setUpEventsContracts() {
  var pubSList = document.getElementById("pubSList");
  pubSContract.on("PurchaseNftWithId", (buyer, tokenId, value, event) => {
   pubSList.innerHTML = `Last Event: Buyer: ${buyer}, Token ID: ${tokenId.toString()}`;
  });

  var bbitesListEl = document.getElementById("bbitesTList");
  bbitesTknContract.on("Transfer", (from, to, amount, event) => {
   bbitesListEl.innerHTML = `Last Event: From: ${from}, To: ${to}, Amount: ${amount.toString()}`;
  });

  var nftList = document.getElementById("nftList");
  nftContract.on("Transfer", (from, to, tokenId, event) => {
    nftList.innerHTML = `Last Event: From: ${from}, To: ${to}, Token ID: ${tokenId.toString()}`;
  });

  var burnList = document.getElementById("burnList");
  nftContract.on("Burn", (owner, tokenId, event) => {
    burnList.innerHTML = `Last Event: Owner: ${owner}, Token ID: ${tokenId.toString()}`;
  });
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  await initSCsGoerli();

  await initSCsMumbai();

  await setUpListeners();

  await setUpEventsContracts();

  //buildMerkleTree();
}

setUp()
  .then()
  .catch((e) => console.log(e));
