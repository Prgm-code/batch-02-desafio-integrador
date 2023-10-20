const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";  // Dirección del router Uniswap V2 
  const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";  // Dirección del factory Uniswap V2 
  const tokenAAddress = "0x...";  // Dirección del tokenA (Ejemplo)
  const tokenBAddress = "0x...";  // Dirección del tokenB (Ejemplo)
  const amountADesired = 100;  // Cantidad deseada para el token A (Ejemplo)
  const amountBDesired = 100;  // Cantidad deseada para el token B (Ejemplo)
  const amountAMin = 90;  // Cantidad mínima para el token A (Ejemplo)
  const amountBMin = 90;  // Cantidad mínima para el token B (Ejemplo)

  const LiquidityProvider = await hre.ethers.getContractFactory("LiquidityProvider");
  const liquidityProvider = await LiquidityProvider.deploy(
    routerAddress,
    factoryAddress,
    tokenAAddress,
    tokenBAddress,
    amountADesired,
    amountBDesired,
    amountAMin,
    amountBMin
  );

  await liquidityProvider.deployed();

  console.log("LiquidityProvider deployed to:", liquidityProvider.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
