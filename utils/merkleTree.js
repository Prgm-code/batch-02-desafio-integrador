const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("hardhat");
const walletAndIds = require("../wallets/walletList");

var merkleTree, root;
function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}

var hasheandoElementos, pruebas;
function getProofs() {
   var id = 1001;
  var address = "0xBA3bf4CA212F841970ca38EA28117aDb6F881Aa9";
  hasheandoElementos = hashToken(id, address);
  pruebas = merkleTree.getHexProof(hasheandoElementos);
  console.log(pruebas);


  //verificacion off.chain
  var pertenece = merkleTree.verify(pruebas,hasheandoElementos, root);
  console.log(pertenece)
  return pruebas;
}

function getRootFromMT() {
  let elementosHasheados = walletAndIds.map(({id, address}) => {
    return hashToken(id, address )
  });
  merkleTree = new MerkleTree(elementosHasheados, keccak256, {
    sortPairs: true,
  });
  root = merkleTree.getHexRoot();

  
  console.log(root);

  return root;
}

getRootFromMT();
getProofs();


module.exports = { getRootFromMT, getProofs };

