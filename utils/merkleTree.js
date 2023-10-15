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

function construyendoMerkleTree(){
  let elementosHasheados = walletAndIds.map(({id, address}) => {
    return hashToken(id, address )
  });
  merkleTree = new MerkleTree(elementosHasheados, keccak256, {
    sortPairs: true,
  });
  root = merkleTree.getHexRoot();

  
  console.log(root);


}
var hasheandoElementos, pruebas;
function cosntruyendoPruebas() {
  var id = 1002;
  var address = "0x007c5e822b66C5463a465ffC17BCf7E02aA9E1A4";
  hasheandoElementos = hashToken(id, address);
  pruebas = merkleTree.getHexProof(hasheandoElementos);
  console.log(pruebas);

  //verificacion off.chain
  var pertenece = merkleTree.verify(pruebas,hasheandoElementos, root);
  console.log(pertenece)
}

function getRootFromMT() {
  return "";
}

construyendoMerkleTree();
cosntruyendoPruebas();


module.exports = { getRootFromMT };

