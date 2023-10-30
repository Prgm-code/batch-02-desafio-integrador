const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;

  const provider = new DefenderRelayProvider(data);
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });
  // Filtrando solo eventos
  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;

  // Filtrando solo MintInAnotherChain
  var event = onlyEvents.filter((ev) => ev.signature.includes("PurchaseNftWithId"));
  // Mismos params que en el evento
  var { account, id } = event[0].params;

  // Ejecutar 'mint' en Mumbai del contrato MiPrimerToken
  var CuyCollectionNft = "0xc00c3EB9fa221e9ea7B9740F106b76B39559E663";
  var tokenAbi = ["function safeMint(address to, uint256 tokenId)"];
  var tokenContract = new ethers.Contract(CuyCollectionNft, tokenAbi, signer);
  var tx = await tokenContract.safeMint(account, id);
  var res = await tx.wait();
  return res;

};
