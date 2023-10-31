const {StandardMerkleTree} = require('@openzeppelin/merkle-tree')
const walletAndIds = require('../wallets/walletList')
const values = walletAndIds.map(({id, address}) => {
   return [id, address]
})

const tree = StandardMerkleTree.of(values, ['uint256', 'address']);
console.log("Root MerkleTree  :", tree.root)
//console.log("Obteniendo las proof de " , values[1])
//const proof = tree.getProof(values[1])
// console.log("Proof MerkleTree :", proof)

function getRootFromMT() {
   return tree.root
}
function getProofs(id, address) {
   return tree.getProof([id, address])
}
module.exports = {getRootFromMT, getProofs}