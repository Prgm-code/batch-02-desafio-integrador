// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IUniSwapV2Router02} from "./Interfaces.sol";

contract PublicSale is Pausable, AccessControl {
    IUniSwapV2Router02 router;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    event PurchaseNftWithId(address account, uint256 id);

    IERC20 public BBTKN;
    IERC20 public USDC;

    mapping(uint256 => bool) public nftPurchased;

    constructor(address _BBTKNAddress, address _USDCAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        BBTKN = IERC20(_BBTKNAddress);
        USDC = IERC20(_USDCAddress);
    }

    function purchaseWithTokens(uint256 _id) public whenNotPaused {
        require(!nftPurchased[_id], "NFT already purchased");
        require(_id >= 0 && _id <= 699, "Invalid NFT ID");

        uint256 price = getPriceForId(_id);
        require(
            BBTKN.balanceOf(msg.sender) >= price,
            "Insufficient BBTKN tokens"
        );

        BBTKN.transferFrom(msg.sender, address(this), price);

        nftPurchased[_id] = true;

        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithUSDC(uint256 _id) external {
        require(!nftPurchased[_id], "NFT already purchased");
        require(_id >= 0 && _id <= 699, "Invalid NFT ID");

        uint256 price = getPriceForId(_id);
        require(USDC.balanceOf(msg.sender) >= price, "Insufficient USDC tokens");

        USDC.transferFrom(msg.sender, address(this), price);

        nftPurchased[_id] = true;

        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithEtherAndId(uint256 _id) public payable {
        // Implementación pendiente
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function depositEthForARandomNft() public payable {
        // Implementación pendiente
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
