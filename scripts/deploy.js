require("dotenv").config();
const { ethers } = require("hardhat");
const pEth = ethers.parseEther;
const { addresses, updateAddress } = require("../utils/addresses");

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const { getRootFromMT } = require("../utils/merkleTree");


var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");




// Publicar NFT en Mumbai
async function deployMumbai() {
  const root = getRootFromMT();
  var relAddMumbai = addresses.MUMBAI_RELAY_ADDRESS; // relayer mumbai
  var name = "CuyCollection";
  var symbol = "CCNFT";

  const CUYNFT = await deploySCNoUp("CuyCollectionNft", [name, symbol]);
  const CUYNFTAdd = await CUYNFT.getAddress();
  console.log("CUYNFT", CUYNFTAdd);

  console.log("asignando el rol de minter al relayer")
  const res = await ex(CUYNFT, "grantRole", [MINTER_ROLE, relAddMumbai], "Error al asignar el rol de minter");
  console.log("TX Asignando Rol de Minter al Relayer. HASH: ", res.hash);

  const res2 = await ex(CUYNFT, "setMerkleRoot", [root], "Errro al establecer el root");
  console.log("establecinedo ROOT " + root);
  console.log("TX estableciondo el ROOT del MerkleTree. HASH: ", res2.hash);


  await verify(CUYNFTAdd, "CUYNFT", [name, symbol])
  await updateAddress('CCNFT_CONTRACT_ADDRESS', CUYNFTAdd);



}

// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployGoerli() {
  const relAddGoerli = addresses.GOERLI_RELAY_ADDRESS; // relayer goerli para asignarle el rol de minter y burner lcon al funcion ex
  const routerAddress = addresses.UNISWAP_ROUTER_ADDRESS;  // Dirección del router Uniswap V2 
  const factoryAddress = addresses.UNISWAP_FACTORY_ADDRESS; // Dirección del factory Uniswap V2 
  const [deployer] = await hre.ethers.getSigners();


  // var psC Contrato proxy SC
  const BBitesToken = await deploySC("BBitesToken", []);
  const BBTKNProxyAddress = await BBitesToken.getAddress();
  const BBTKNimplAdd = await printAddress("BBitesToken", await BBitesToken.getAddress());
  const resGrantRole = await ex(BBitesToken, "grantRole", [MINTER_ROLE, relAddGoerli], "Error al asignar el rol de minter");
  console.log("Asignando Rol minter a Relayer", resGrantRole.hash);
  await verify(BBTKNimplAdd, "BBitesToken");
  await updateAddress('BBTKN_CONTRACT_ADDRESS', BBTKNProxyAddress);
  // deploySC ;
  const USDC = await deploySCNoUp("USDCoin", []);
  const USDCImplAdd = await USDC.getAddress();
  console.log("USDCoin", USDCImplAdd);
  await verify(USDCImplAdd, "USDCoin");
  await updateAddress('USDC_CONTRACT_ADDRESS', USDCImplAdd);

  // consultar el saldo de la cuenta del deployer
  console.log("Saldo de MSG.sender de USDC", await USDC.balanceOf(deployer.address));
  console.log("Saldo de MSG.sender de BBTKN", await BBitesToken.balanceOf(deployer.address));


  // await ex( BBitesToken , "grantRole", [MINTER_ROLE, relAddGoerli], "Error al asignar el rol de minter");



  console.log("deployando consttrato liquidity con ", BBTKNProxyAddress, USDCImplAdd, routerAddress, factoryAddress)

  const liquidityProvider = await deploySCNoUp("LiquidityProvider", [

    routerAddress,
    factoryAddress,
    BBTKNProxyAddress,
    USDCImplAdd,
  ]);

  const liquidityProviderAddress = await liquidityProvider.getAddress();
  await verify(liquidityProviderAddress, "LiquidityProvider",
    [
      routerAddress,
      factoryAddress,
      BBTKNProxyAddress,
      USDCImplAdd,
    ]);
  await updateAddress('LIQUIDITY_PROVIDER_CONTRACT_ADDRESS', liquidityProviderAddress);
}

async function addLiquidity() {
  const [deployer] = await hre.ethers.getSigners();
  const BBTKNProxyAddress = addresses.BBTKN_CONTRACT_ADDRESS; // Dirección del proxy del BBTKN
  const USDCAddress = addresses.USDC_CONTRACT_ADDRESS; // Dirección del USDC
  const liquidityProviderAddress = addresses.LIQUIDITY_PROVIDER_CONTRACT_ADDRESS; // Dirección del contrato LiquidityProvider
  const amountADesired = pEth("1000000");  // Cantidad deseada para el BBTKN
  const amountBDesired = 500000 * (10 ** 6);  // Cantidad deseada para el USDC
  const amountAMin = pEth("1000000"); // 1.000.000 
  const amountBMin = 500000 * (10 ** 6); // revisar decimales de USCD
  const to = await deployer.address;
  const deadline = new Date().getTime() + 60000;



  const USDC = await ethers.getContractFactory("USDCoin");
  const usdc = await USDC.attach(USDCAddress);
  const BBitesToken = await ethers.getContractFactory("BBitesToken");
  const bbitesToken = await BBitesToken.attach(BBTKNProxyAddress);
  const LiquidityProvider = await ethers.getContractFactory("LiquidityProvider");
  const liquidityProvider = await LiquidityProvider.attach(liquidityProviderAddress);


  //const liquidityProvider = LiquidityProvider.attach(liquidityProviderAddress);

  const txBBTKN = await bbitesToken.transfer(liquidityProviderAddress, amountADesired);
  const resBBTKN = await txBBTKN.wait();
  console.log("hash tx send BBTKN", resBBTKN.hash);


  const txUSDC = await usdc.transfer(liquidityProviderAddress, amountBDesired);
  const resUSDC = await txUSDC.wait();
  console.log("hash Tx send USDC", resUSDC.hash);





  console.log("Deploying contracts with the account:", deployer.address);


  // const liquidityProvider = await hre.ethers.getContractFactory("LiquidityProvider");
  console.log("agregando liquidez con los sgtes prams: ",

    amountADesired,
    amountBDesired,
    amountADesired,
    amountBDesired,
    to,
    deadline);

  const tx = await liquidityProvider.addLiquidity(
    amountADesired,
    amountBDesired,
    amountADesired,
    amountBDesired,
    to,
    deadline
  );

  const res = await tx.wait();
  console.log("hash tx add liquidity ", res.hash);
  console.log("LiquidityProvider deployed to:", await liquidityProvider.address);
  console.log(`hash: ${res.transactionHash}`);

}

async function deployPublicSale() {
  const _BBTKNAddress = addresses.BBTKN_CONTRACT_ADDRESS; // Dirección del BBTKN
  const _USDCAddress = addresses.USDC_CONTRACT_ADDRESS; // Dirección del USDC


  const [deployer] = await hre.ethers.getSigners();
  const PublicSale = await deploySC("PublicSale", [
    _BBTKNAddress,
    _USDCAddress,
  ]);

  const publicSaleProxyAddress = await PublicSale.getAddress();
  console.log("PublicSaleproxy deployed to:", publicSaleProxyAddress);
  await updateAddress('PUBS_CONTRACT_ADDRESS', publicSaleProxyAddress);
  const publicSaleImpAddress = await printAddress("PublicSale", publicSaleProxyAddress);
  console.log("PublicSaleImp deployed to:", publicSaleImpAddress);
  await verify(publicSaleImpAddress, "PublicSale");

}

async function deploy() {
//  await deployMumbai()
  await deployGoerli()
  await addLiquidity()
  await deployPublicSale()
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
// conssole . log de verificar los contratos proxy 
console.log("Verificar los contratos proxy BBTKN ", addresses.BBTKN_CONTRACT_ADDRESS);
console.log("Verificar los contratos proxy PublicSale ", addresses.PUBS_CONTRACT_ADDRESS);
console.log("Verificar los contratos proxy CuyCollection ", addresses.CCNFT_CONTRACT_ADDRESS);

});

