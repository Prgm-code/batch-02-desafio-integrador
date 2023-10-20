require("dotenv").config();
const { ethers } = require("hardhat");
const pEth = ethers.parseEther;


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
  var relAddMumbai; // relayer mumbai
  var name = "Chose a name";
  var symbol = "Chose a symbol";

  // utiliza deploySC
  // utiliza printAddress
  // utiliza ex
  // utiliza ex
  // utiliza verify

  await verify(implAdd, "CUYNFT");
}

// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployGoerli() {
  var relAddGoerli; // relayer goerli para asignarle el rol de minter y burner lcon al funcion ex
  const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";  // Dirección del router Uniswap V2 
  const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";  // Dirección del factory Uniswap V2 
  const [deployer] = await hre.ethers.getSigners();


  // var psC Contrato proxy SC
  const BBitesToken = await deploySC("BBitesToken", []);
  const BBTKNProxyAddress = await BBitesToken.getAddress();
  const BBTKNimplAdd = await printAddress("BBitesToken", await BBitesToken.getAddress());
  await verify(BBTKNimplAdd, "BBitesToken");
  // deploySC ;
  const USDC = await deploySCNoUp("USDCoin", []);
  const USDCImplAdd = await USDC.getAddress();
  console.log("USDCoin", USDCImplAdd);
  await verify(USDCImplAdd, "USDCoin");

  // consultar el saldo de la cuenta del deployer
  console.log("Saldo de MSG.sender de USDC", await USDC.balanceOf(deployer.address));
  console.log("Saldo de MSG.sender de BBTKN", await BBitesToken.balanceOf(deployer.address));


  // await ex( BBitesToken , "grantRole", [MINTER_ROLE, relAddGoerli], "Error al asignar el rol de minter");

  // deploySC;
  const tokenAAddress = await BBitesToken.getAddress(); // Dirección del tokenA 
  const tokenBAddress = await USDC.getAddress();  // Dirección del tokenB 
  // var usdc Contrato+
  // publicar c ontrato liquidity




  console.log("deployando consttrato liquidity con ", BBTKNimplAdd, USDCImplAdd, routerAddress, factoryAddress)

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
}

async function addLiquidity() {
  const [deployer] = await hre.ethers.getSigners();
  const BBTKNProxyAddress = "0xFcEF0e23e7942185d6Cd0fCa5168fB3d1B0038A4"; // Dirección del proxy del BBTKN
  const USDCAddress = "0x07842f6260bF596e92dc80925881CF6E1AD00d9C";
  const liquidityProviderAddress = "0x1595D1D25d525D18dFCA75bfD5b26d387bfD9Bd3"
  const amountADesired = pEth("10000000");  // Cantidad deseada para el BBTKN
  const amountBDesired = 5000000 * (10 ** 6);  // Cantidad deseada para el USDC
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



  const txBBTKN = await bbitesToken.transfer(liquidityProviderAddress, amountADesired);

  const resBBTKN = await txBBTKN.wait();
  console.log("hash tx send BBTKN", resBBTKN.hash);


  const txUSDC = await usdc.transfer(liquidityProviderAddress, amountBDesired);
  const resUSDC = await txUSDC.wait();
  console.log("hash Tx send USDC", resUSDC.hash);

  //const liquidityProvider = LiquidityProvider.attach(liquidityProviderAddress);

  // añadiendo liquidez


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
  // deploySC;

  // var impPS = await printAddress("PublicSale", await psC.getAddress());
  // var impBT = await printAddress("BBitesToken", await bbitesToken.getAddress());

  // set up
  // script para verificacion del contrato
}

async function deployPublicSale() {
  const _BBTKNAddress = "0xFcEF0e23e7942185d6Cd0fCa5168fB3d1B0038A4"; // Dirección del BBTKN
  const _USDCAddress = "0x07842f6260bF596e92dc80925881CF6E1AD00d9C"; // Dirección del USDC
  

  const [deployer] = await hre.ethers.getSigners();
  const PublicSale = await deploySC("PublicSale", [
     _BBTKNAddress,
    _USDCAddress,
   ]);
   const publicSaleProxyAddress = await PublicSale.getAddress();
   console.log("PublicSaleproxy deployed to:", publicSaleProxyAddress);
   const publicSaleImpAddress = await printAddress("PublicSale", publicSaleProxyAddress); 
   console.log("PublicSaleImp deployed to:", publicSaleImpAddress); 
  await verify(publicSaleImpAddress, "PublicSale");
  
}

// deployMumbai()
 //deployGoerli()
//addLiquidity()
   deployPublicSale()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
