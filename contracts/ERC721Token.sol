// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

library AddressUtils
{
  function isContract(address _addr)internal view returns (bool addressCheck)
  {
    uint256 size;
    assembly { size := extcodesize(_addr) } 
    addressCheck = size > 0;
  }
}

interface ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4);
}

interface ERC721 /* is ERC165 */ {
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    //safe assegura que o recebedor é um smart contract que sabe manipular o token
    //para que p nft não fique travado eternamente
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function approve(address _approved, uint256 _tokenId) external payable;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

contract ERC721Token is ERC721 {
    //atribuindo biblioteca ao tipo address
    using AddressUtils for address;
    mapping(address => uint) private ownerToTokenCount;
    mapping(uint => address) private idToOwner;
    mapping(uint => address) private idToApproved;
    mapping(address => mapping(address => bool)) private ownerToOperators;
    //keccak256 of onERC721Received(address,address,uint256,bytes) == 150b7a023d4804d13e8c85fb27262cb750cf6ba9f9dd3bb30d90f482ceeb4b1f
    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
    //address public admin;
    uint public nextTokenId;

    constructor()  {
      //admin = msg.sender;
    }

    function mint() external {
      //require(msg.sender == admin, 'only admin');
      ownerToTokenCount[msg.sender]++;
      idToOwner[nextTokenId] = msg.sender;
      emit Transfer(address(0), msg.sender, nextTokenId);
      nextTokenId++;
    }
    
    function balanceOf(address _owner) external view returns(uint) {
        return ownerToTokenCount[_owner];
    }
    
    function ownerOf(uint256 _tokenId) external view returns (address) {
        return idToOwner[_tokenId];
    }
    
    function safeTransferFrom(address _from, address _to, uint _tokenId, bytes calldata data) external payable {
        _safeTransferFrom(_from, _to, _tokenId, data);
    }

    function safeTransferFrom(address _from, address _to, uint _tokenId) external payable {
        _safeTransferFrom(_from, _to, _tokenId, ""); 
    }
    
    function transferFrom(address _from, address _to, uint _tokenId) external payable {
        _transfer(_from, _to, _tokenId);
    }
    
    function approve(address _approved, uint _tokenId) external payable {
        address owner = idToOwner[_tokenId];
        require(msg.sender == owner, 'Not authorized');
        idToApproved[_tokenId] = _approved;
        emit Approval(owner, _approved, _tokenId);
    }
    
    function setApprovalForAll(address _operator, bool _approved) external {
        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }
    
    function getApproved(uint _tokenId) external view returns (address) {
        return idToApproved[_tokenId];   
    }
    
    function isApprovedForAll(address _owner, address _operator) external view returns (bool) {
        return ownerToOperators[_owner][_operator];
    }
    
    function _safeTransferFrom(address _from, address _to, uint _tokenId, bytes memory data) internal {
        _transfer(_from, _to, _tokenId);
        
        if(_to.isContract()) {
          bytes4 response = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, data);
          require(response == MAGIC_ON_ERC721_RECEIVED, 'recipient Smart Contract cannot handle ERC721 tokens');
        }
    }
    
    function _transfer(address _from, address _to, uint _tokenId) internal canTransfer(_tokenId) {
        ownerToTokenCount[_from] -= 1; 
        ownerToTokenCount[_to] += 1;
        idToOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }
    
    modifier canTransfer(uint _tokenId) {
        address owner = idToOwner[_tokenId];
        require(owner == msg.sender 
            || idToApproved[_tokenId] == msg.sender
            || ownerToOperators[owner][msg.sender] == true, 'Transfer not authorized');
        _;
    }
}
