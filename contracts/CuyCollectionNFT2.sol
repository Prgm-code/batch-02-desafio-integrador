// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyNFT is Initializable, ERC721EnumerableUpgradeable, OwnableUpgradeable {
    function initialize() public initializer {
        __ERC721_init("MyNFT", "MNFT");
        __ERC721Enumerable_init();
        __Ownable_init();
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._setTokenURI(tokenId, _tokenURI);
    }

    function _baseURI() internal view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super._baseURI();
    }

    function _setBaseURI(string memory baseURI_) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._setBaseURI(baseURI_);
    }

    uint256[50] private __gap;
}
