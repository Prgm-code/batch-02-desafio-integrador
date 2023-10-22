// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Pair {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function allowance(address owner, address spender) external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function decimals() external pure returns (uint8);
    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function totalSupply() external view returns (uint);
    function factory() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function kLast() external view returns (uint);
    function nonces(address owner) external view returns (uint);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IUniswapV2Router02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function getAmountIn(
        uint amountOut,
        uint reserveIn,
        uint reserveOut
    ) external returns (uint amountIn);
}

interface IUniswapV2Factory {
    function getPair(
        address tokenA,
        address tokenB
    ) external view returns (address pair);
}

contract LiquidityProvider {
    address public routerAddress;
    IUniswapV2Router02 public router;

    address public factoryAddress;
    IUniswapV2Factory public factory;

    IERC20 public tokenA;
    IERC20 public tokenB;

    event LiquidityAdded(
        uint256 amountA,
        uint256 amountB,
        uint256 amountLpTokens
    );

    constructor(
        address _routerAddress,
        address _factoryAddress,
        address _tokenA,
        address _tokenB
    ) {
        routerAddress = _routerAddress;
        router = IUniswapV2Router02(routerAddress);

        factoryAddress = _factoryAddress;
        factory = IUniswapV2Factory(factoryAddress);

        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(
        uint _amountADesired,
        uint _amountBDesired,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) public {
        tokenA.approve(routerAddress, _amountADesired);
        tokenB.approve(routerAddress, _amountBDesired);

        (uint amountA, uint amountB, uint amountLP) = router.addLiquidity(
            address(tokenA),
            address(tokenB),
            _amountADesired,
            _amountBDesired,
            _amountAMin,
            _amountBMin,
            _to,
            _deadline
        );

        emit LiquidityAdded(amountA, amountB, amountLP);
    }
    

    function getPair() public view returns (address) {
        return factory.getPair(address(tokenA), address(tokenB));
    }
}

