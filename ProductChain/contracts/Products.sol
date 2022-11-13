pragma solidity ^0.8.13;
pragma experimental ABIEncoderV2;
// SPDX-License-Identifier: MIT
// @description Smart Contract for "Product Chain"

contract Products {
    // Product Details
    struct Product {
        uint256 ProductID;
        //string imageIPFS;
        uint256 weight;     //in grams
        string catogery;
        
        address manufacturer;//0x00651F32858f0541e44Dc3385665EAc8177c7362
        uint256 manuTime;
        string manuLocation;
        uint256 manuFees;
        
        address transporter;//0x26abaa55F545089e9d5974aEF57C0D3F0a16D45D
        uint256 transportTime;
        uint256 transportFees;
        
        address buyer; //0xa87da3902C4569baCB81027ED32d90a6112c3b00
                        //
        bool payementDone;
    }
    
    // Store Products Details
    Product[] public Products;
    
    // Manufacturer Registers New Product
    function newProduct(string calldata _catogery, uint256 _weight, string calldata _manuLocation, uint256 _manuFees, address _transporter) external {
        Product memory m = Product(Products.length, _weight, _catogery, msg.sender, block.timestamp, _manuLocation, _manuFees, _transporter, 0, 0, address(0), false);
        Products.push(m);

    }
    
    // Transporter confirms delivery
    function deliver(uint256 _ProductID, uint256 _transportFees) external {
        // can only be called by authorized transporter
        require(Products[_ProductID].transporter == msg.sender, "Err: Not Authorized");
        
        Products[_ProductID].transportTime = block.timestamp;
        Products[_ProductID].transportFees = _transportFees;
    }
    
    function pay(uint256 _ProductID) external payable {
        // check payment is for correct amount
        require(msg.value == Products[_ProductID].manuFees + Products[_ProductID].transportFees, "Err: Incorrect Amount");
        
        // Pay to respective addresses of Manufacturer and Transporter
        (bool success1, ) = Products[_ProductID].manufacturer.call{value: Products[_ProductID].manuFees}("");
        (bool success2, ) = Products[_ProductID].transporter.call{value: Products[_ProductID].transportFees}("");
        
        require(success1 && success2, "Err: Transferring Funds");
        Products[_ProductID].payementDone = true;
    }
    
    function getProductsCount() external view returns(uint256) {
        return Products.length;
    }

    function getProductInfo(uint _ProductID) external view returns(Product memory) {
        return Products[_ProductID];
    } 
}