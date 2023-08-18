// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



contract Token is ERC721 {
    using Counters for Counters.Counter; 
    Counters.Counter private _tokenIds;

    constructor() ERC721("FocusedFoxes","BFF") {}


    function mint(address to)public returns(uint256){
        uint256 newTokenId = _tokenIds.current();
        _safeMint(to, newTokenId);
        _tokenIds.increment();
        
        return newTokenId;
    }

        function getTokenIds() public view returns (uint256) {
        return _tokenIds.current();
    }
}