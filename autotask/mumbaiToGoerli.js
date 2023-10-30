const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;
  const provider = new DefenderRelayProvider(data);

  const signer = new DefenderRelaySigner(data, provider, {
    speed: "fast"
  });
  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;
  var event = onlyEvents.filter((ev) => ev.signature.includes("Burn"));

  const { account, id } = event[0].params;

  //Ejecutar el mint de BBTKN en Goerli
  const BBTKN = "0x18a3CB0b9BA2A0821E6db9948a4FA5Ef0BC525c5";
  const amount = ethers.utils.parseUnits('10000', 18);
  const tokenAbi = ["function mint(address to, uint256 amount)"];
  const tokenContract = new ethers.Contract(BBTKN, tokenAbi, signer);
  const tx = await tokenContract.mint(account, amount);
  const res = await tx.wait();
  return res;


};
