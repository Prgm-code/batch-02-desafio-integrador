const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;
  const provider = new DefenderRelayProvider(data);

  const signer = new DefenderRelaySigner(data, provider, {
    speed: "fast"  });
    const onlyEvents = payload[0].filter((e) => e.event === "event");
    if (onlyEvents.length === 0) return;
const event = onlyEvents.filter((ev) => ev.signature.includes("burn"));

const { account , tokenId } = event[0].params;

//completar el metodo para Ejecurtar el goerly


};
