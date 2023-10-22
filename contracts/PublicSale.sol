// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {IUniSwapV2Router02} from "./Interfaces.sol";

contract PublicSale is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    /*     address _BBTKNAddress =  0x2Ddd80BF329A5bC0fF11707d2A579A70d740ae95;
    address USDCAddress; */

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    event PurchaseNftWithId(address account, uint256 id);

    IERC20 BBTKN;
    IERC20 USDC;
    address routerAddress;
    IUniSwapV2Router02 router;

    mapping(uint256 => bool) public nftPurchased;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _BBTKNaddress,
        address _USDCaddress
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        BBTKN = IERC20(_BBTKNaddress);
        USDC = IERC20(_USDCaddress);
        routerAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        router = IUniSwapV2Router02(routerAddress);
    }

    function purchaseWithTokens(uint256 _id) public whenNotPaused {
        require(!nftPurchased[_id], "NFT already purchased");
        require(_id >= 0 && _id <= 699, "Invalid NFT ID");

        uint256 price = getPriceForId(_id);
        require(
            BBTKN.balanceOf(msg.sender) >= price,
            "Insufficient BBTKN tokens"
        );
        //dar aprove al contrato para que pueda usar los tokens del usuario

        BBTKN.approve(address(this), price); //revisar el aprove que debe reALIZAErce desde BBTKN

        BBTKN.transferFrom(msg.sender, address(this), price);

        nftPurchased[_id] = true;

        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithUSDC(
        uint256 usdcAmount,
        uint256 _id
    ) public whenNotPaused {

        // el aprove se realiza desde el front end donde se llama a usdc.aprove (publicSaleAddress , usdcAmount)
        require(!nftPurchased[_id], "NFT already purchased");
        require(_id >= 0 && _id <= 699, "Invalid NFT ID");
        require(USDC.allowance(msg.sender, address(this)) >= usdcAmount, "Aprove insufficient");


        //dar aprove de los usdc para que el contrato los tranfiera al router

        // Transferir USDC al contrato
        USDC.transferFrom(msg.sender, address(this), usdcAmount);
        USDC.approve(routerAddress, usdcAmount);
        uint256 priceInBBTKN = getPriceForId(_id);
        // Definir la ruta de USDC a BBTKN
        address[] memory path = new address[](2);
        path[0] = address(USDC); //
        path[1] = address(BBTKN); //

        uint256 deadline = block.timestamp + 3000; //  5 minutos para la transacción

    
        // Intercambiar USDC por BBTKN
        uint256[] memory amounts = router.swapTokensForExactTokens(
            priceInBBTKN,
            usdcAmount,
            path,
            address(this),
            deadline
        );

        // Si no se utilizaron todos los USDC, devolver la diferencia al comprador
        if (usdcAmount > amounts[0]) {
            USDC.transfer(msg.sender, usdcAmount - amounts[0]);
        }

        nftPurchased[_id] = true;
        emit PurchaseNftWithId(msg.sender, _id);
    }

    /*     function purchaseWithUSDC(uint256 usdcAmount , uint256 _id) external {
        require(!nftPurchased[_id], "NFT already purchased");
        require(_id >= 0 && _id <= 699, "Invalid NFT ID");
        
        // Lee llamaala metodo comparr con USDC 
        // Lee tiene que dar un aprove al public sale opara que maneje sus usdc
        //este aprove se llama desde el contrato USDC 

        //una ves que se ha dado el aproove se puede llamar a trasnfer_From
        // USDC.transferFrom(msg.sender, address(this), price);
        // internamente, en transferFrom el msg.sender == PublicSale Sc , que es el spender 

        // el SC PublicSale tiene un  sldo en usdc, en usdcAmount

        // antes de llamar al router, el SC PublicSale tiene que darle allowance router 
        // como publicsale le da allowande al conrtato router 

        // usdc.apove (ruteraddress ,usdcAmount)
        // internameinte en el metodo aprove el msg.sender == SC PubvlicSale , que es el dueño de los tokens 


        //el SC PublñicSale antes de llamar al router debe poseer un balance en USDC (en la canbtidad de UsdcAmoun)

        // llla ma al riuter con router.swapTokensForExactTokens(amountOut, amountInMax, path, to, deadline);
        //el router sustrae los usdc  desde public salñe a cambio de lo s BBtokens que son entregado s l sc Pubicsale
        // uint [ ] amount= router.swapTokensForExactTokens(amountOut, amountInMax, path, to, deadline);
        // uint[0] = cantidad de Usdc realmente utilizados 
        // if ( usdcAmopunt > amount[0] ){
            //usdc.transfer(msg.sender , usdcAmount - amount[0]);
            // en este caso los 

        }
        //finalemente emite el ev3ento de lla compra con usdc para que sea cpturado con el sentinel
    } */

    /*     function _swapExactTokensForTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) internal   {
        address origenToken = path[0];
        IERC20(origenToken).approve(routerAddress, amountInMax);

        uint[] memory _amounts = router.swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );
    
    } */

    function purchaseWithEtherAndId(uint256 _id) public payable {
        uint256 priceInEther = 0.01 ether;
        require(msg.value >= priceInEther, "Insufficient Ether sent");
        require(!nftPurchased[_id] && _id >= 700 && _id < 1000, "invalid ID");
        nftPurchased[_id] = true;

        emit PurchaseNftWithId(msg.sender, _id);
        if (msg.value > priceInEther) {
            payable(msg.sender).transfer(msg.value - priceInEther);
        }
    }

    function depositEthForARandomNft() public payable whenNotPaused {
        uint256 maxAttempts = 300; // Esto representa la cantidad de IDs aleatorios posibles (999 - 700 + 1)
        uint256 attempts = 0;
        uint256 randomId;
        bool isValid = false;

        while (attempts < maxAttempts && !isValid) {
            randomId = generateRandomId();
            if (!nftPurchased[randomId]) {
                isValid = true;
            }
            attempts++;
        }

        require(isValid, "No more available random IDs");

        uint256 priceInEther = 0.01 ether;
        require(msg.value >= priceInEther, "Insufficient Ether sent");

        nftPurchased[randomId] = true;

        //emite el evento para defender
        emit PurchaseNftWithId(msg.sender, randomId);

        // Devolver cualquier exceso de Ether al remitente
        if (msg.value > priceInEther) {
            payable(msg.sender).transfer(msg.value - priceInEther);
        }
    }

    // Función auxiliar para generar un ID aleatorio
    function generateRandomId() internal view returns (uint256) {
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % 300;
        return 700 + random;
    }

    receive() external payable {
        depositEthForARandomNft();
    }

    function getPriceForId(uint256 _id) public view returns (uint256) {
        if (_id >= 0 && _id <= 199) return 1000 * 10 ** 18;
        if (_id >= 200 && _id <= 499) return _id * 20 * 10 ** 18;
        if (_id >= 500 && _id <= 699) {
            uint256 daysPassed = (block.timestamp - startDate) / 86400;
            return
                (10_000 + (2_000 * daysPassed)) * 10 ** 18 < MAX_PRICE_NFT
                    ? (10_000 + (2_000 * daysPassed)) * 10 ** 18
                    : MAX_PRICE_NFT;
        }
        revert("Invalid ID");
    }

    function version() public pure returns (uint256) {
        return 4;
    }

    function withdrawEther() public onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawTokens() public onlyRole(DEFAULT_ADMIN_ROLE) {
        BBTKN.transfer(msg.sender, BBTKN.balanceOf(address(this)));
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
