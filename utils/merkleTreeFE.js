const MerkleTree = require('merkletreejs').MerkleTree;
const keccak256 = require('js-sha3').keccak256;
const ethers = require('ethers');
const buffer = require('buffer/').Buffer;
const walletAndIds = require('../wallets/walletList');

let merkleTree, root;

const hashToken = (tokenId, account) => {
  return buffer.from(
    keccak256( tokenId, account).slice(2),
    'hex'
  );
};
const getProofs = (id, address) => {
  const hashedElement = hashToken(id, address);
  console.log(hashedElement.toString('hex'));
  const proof = merkleTree.getHexProof(hashedElement);
  console.log(proof);
  
  const isValid = merkleTree.verify(proof, hashedElement, root);
  console.log(isValid);
  
  return proof;
};

const getRootFromMT = () => {
  const hashedElements = walletAndIds.map(({ id, address }) => {
    return hashToken(id, address);
  });
  console.log(hashedElements);
  
  merkleTree = new MerkleTree(hashedElements, keccak256, {
    sortPairs: true,
  });
  
  root = merkleTree.getHexRoot();
  console.log(root);
  
  return root;
};

getRootFromMT();
module.exports = { getRootFromMT, getProofs };
