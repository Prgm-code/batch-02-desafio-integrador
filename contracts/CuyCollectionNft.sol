// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @custom:security-contact patricio@prgmdev.com
contract CuyCollectionNft is
    ERC721Upgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ERC721BurnableUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 public root;
    event Burn(address account, uint256 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        address _relAddMumbai
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __Pausable_init();
        __AccessControl_init();
        __ERC721Burnable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _relAddMumbai);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmXwM46ErPm8LCpnmJUdd52zQLz3ccLRfKYRZ3BEapNEZN/";
    }

    function setMerkleRoot(bytes32 _root) public onlyRole(DEFAULT_ADMIN_ROLE) {
        root = _root;
    }

    //mappping para llevar la contabiolidad de los NFTs emitidos y quiemados
    mapping(uint256 => bool) public burnedNft;

    function VerifyMerkleProof(
        bytes32[] memory proof,
        address addr,
        uint256 id
    ) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(id, addr))));
        if (!MerkleProof.verify(proof, root, leaf)) {
            return false;
        }
        return true;
    }

    function safeMint(
        address to,
        uint256 tokenId
    ) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
    }

    function safeMintWhiteList(
        bytes32[] memory proofs,
        address to,
        uint256 tokenId
    ) public {
        //aplicar merkle treee para la lista de billeteras de la 1000 a al 1999
        // Verificar que el tokenId esté en el rango de 1000 a 1999
        require(tokenId >= 1000 && tokenId <= 1999, "TokenId not in range");
        require(VerifyMerkleProof(proofs, to, tokenId), "Invalid proof for mint");
        _safeMint(to, tokenId);
    }

    function buyBack(uint256 tokenId) public {
        require(tokenId >= 1000 && tokenId <= 1999, "TokenId not in range");

        // Verificar que el usuario es dueño del NFT que desea quemar
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        // todo verificar que el NFT se encuentre dentro de la lista whitelist de NFTs (1000 a 1999)
        require(!burnedNft[tokenId], "Token already burned");
        _burn(tokenId);
        burnedNft[tokenId] = true; // Marcar este NFT como inactivo para este usuario
        emit Burn(msg.sender, tokenId);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function version() public pure returns (uint256) {
        return 1;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
