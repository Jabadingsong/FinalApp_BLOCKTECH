// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract BlockFind is ERC721 {
    using Strings for uint256;

    uint public itemCount;

    enum Status { Registered, Lost, Found, Returned }

    struct Item {
        uint id;
        string name;
        string description;
        address owner;
        string contactInfo;
        Status status;
        uint256 timestamp;
        string qrHash;
    }

    mapping(uint => Item) public items;
    mapping(string => bool) private qrHashExists;

    event ItemRegistered(uint id, string name, address owner);
    event StatusUpdated(uint id, Status status);
    event ItemDeleted(uint id);

    constructor() ERC721("BlockFind Item", "BFI") {}

    function registerItem(
        string memory _name,
        string memory _description,
        string memory _contactInfo,
        string memory _qrHash
    ) public {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_qrHash).length > 0, "QR hash required");
        require(!qrHashExists[_qrHash], "QR hash already registered");

        itemCount++;
        qrHashExists[_qrHash] = true;

        items[itemCount] = Item(
            itemCount,
            _name,
            _description,
            msg.sender,
            _contactInfo,
            Status.Registered,
            block.timestamp,
            _qrHash
        );

        _mint(msg.sender, itemCount);

        emit ItemRegistered(itemCount, _name, msg.sender);
    }

    function reportLost(uint _id) public {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(ownerOf(_id) == msg.sender, "Not owner");
        items[_id].status = Status.Lost;

        emit StatusUpdated(_id, Status.Lost);
    }

    function markFound(uint _id) public {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        items[_id].status = Status.Found;

        emit StatusUpdated(_id, Status.Found);
    }

    function markReturned(uint _id) public {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(ownerOf(_id) == msg.sender, "Not owner");
        items[_id].status = Status.Returned;

        emit StatusUpdated(_id, Status.Returned);
    }

    function getItem(uint _id) public view returns (Item memory) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        return items[_id];
    }

    function verifyOwnership(uint _id, address _addr) public view returns (bool) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        return _ownerOf(_id) == _addr;
    }

    function deleteItem(uint _id) public {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(ownerOf(_id) == msg.sender, "Not owner");

        delete qrHashExists[items[_id].qrHash];
        delete items[_id];

        _burn(_id);

        emit ItemDeleted(_id);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        Item memory item = items[tokenId];

        string memory statusStr;
        if (item.status == Status.Registered) statusStr = "Registered";
        else if (item.status == Status.Lost) statusStr = "Lost";
        else if (item.status == Status.Found) statusStr = "Found";
        else if (item.status == Status.Returned) statusStr = "Returned";

        // Generate a URL to dynamically render the QR code using a free API
        string memory qrUrl = string(abi.encodePacked(
            "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=",
            item.qrHash
        ));

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', item.name, '",',
                '"description": "', item.description, '",',
                '"image": "', qrUrl, '",',
                '"attributes": [',
                    '{"trait_type": "Status", "value": "', statusStr, '"}',
                ']',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }
}