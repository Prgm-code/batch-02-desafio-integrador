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
  var event = onlyEvents.filter((ev) =>
    ev.signature.includes("PurchaseNftWithId")
  );
  // Mismos params que en el evento
  var { account, id } = event[0].params;

  // Ejecutar 'mint' en Mumbai del contrato MiPrimerToken
  var miPrimerTokenAdd = "0x4A16D22ae3A53E30ef0519F845511A990B0300B8";
  var tokenAbi = ["function mint(address to, uint256 amount)"];
  var tokenContract = new ethers.Contract(miPrimerTokenAdd, tokenAbi, signer);
  var tx = await tokenContract.mint(account, tokens);
  var res = await tx.wait();
  return res;

};
