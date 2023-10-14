// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CuyCollectionNft is ERC721, Pausable, AccessControl, ERC721Burnable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 public root;

    event Burn(address account, uint256 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmTWvm55znTX6NmgopdUpJX8CJsNzhGJY4bJVmMvoJP5hA/";
    }

    function setMerkleRoot(bytes32 _root) public onlyRole(DEFAULT_ADMIN_ROLE) {
        root = _root;
    }

    //mappping para llevar la contabiolidad de los NFTs emitidos y quiemados
    mapping(uint256 => mapping(address => bool)) public mintedNft;

    function VerifyMerkleProof(
        bytes32 leaf,
        bytes32[] memory proof
    ) public view returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function safeMint(
        address to,
        uint256 tokenId
    ) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
        mintedNft[tokenId][to] = true;
    }

    function safeMintWhiteList(
        address to,
        uint256 tokenId,
        bytes32[] calldata proofs
    ) public {
        //aplicar merkle treee para la lista de billeteras de la 1000 a al 1999
        // Verificar que el tokenId esté en el rango de 1000 a 1999
        require(tokenId >= 1000 && tokenId <= 1999, "TokenId not in range");

        // Construir el leaf a partir del tokenId y la dirección
        bytes32 leaf = keccak256(abi.encodePacked(tokenId, to));

        // Verificar que la prueba sea válida
        require(VerifyMerkleProof(leaf, proofs), "Invalid proof");

        safeMint(to, tokenId);
    }

    function buyBack(uint256 tokenId) public {
        // Verificar que el usuario es dueño del NFT que desea quemar
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        // doble chequeo para cpomprobaciones fuera del ERC721
        require(mintedNft[tokenId][msg.sender], "Token already burned");
        // Quemar el NFT
        _burn(tokenId);
        mintedNft[tokenId][msg.sender] = false; // Marcar este NFT como inactivo para este usuario

        // Emitir evento Burn para indicar que el NFT fue quemado
        emit Burn(msg.sender, tokenId);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
