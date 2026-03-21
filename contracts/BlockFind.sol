// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockFind {

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

        emit ItemRegistered(itemCount, _name, msg.sender);
    }

    function reportLost(uint _id) public {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(items[_id].owner == msg.sender, "Not owner");
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
        require(items[_id].owner == msg.sender, "Not owner");
        items[_id].status = Status.Returned;

        emit StatusUpdated(_id, Status.Returned);
    }

    function getItem(uint _id) public view returns (Item memory) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        return items[_id];
    }

    function verifyOwnership(uint _id, address _addr) public view returns (bool) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        return items[_id].owner == _addr;
    }

    function deleteItem(uint _id) public {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        require(items[_id].owner != address(0), "Item already deleted");
        require(items[_id].owner == msg.sender, "Not owner");

        // Free the QR hash so it could potentially be reused if needed, 
        // or just clear the record to maintain cleanliness
        delete qrHashExists[items[_id].qrHash];
        
        // Delete the item from state
        delete items[_id];

        emit ItemDeleted(_id);
    }
}