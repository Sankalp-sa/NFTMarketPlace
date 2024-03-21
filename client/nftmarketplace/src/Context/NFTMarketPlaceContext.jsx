import React, { useState, useEffect, useContext } from 'react'
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import { NFTMarketPlaceAddress, NFTMarketPlaceABI } from './constants';

// wagmi imports

import { useAccount } from 'wagmi'
import { useWriteContract, useReadContract } from 'wagmi'


// const fs = require('fs');
// const pinataSDK = require('@pinata/sdk');
// const pinata = new pinataSDK({ pinataJWTKey: import.meta.env.VITE_PINATA_JWT });

import axios from 'axios'

const NFTMarketPlaceContext = React.createContext();

const NFTMarketPlaceProvider = ({ children }) => {

    const title = "NFT Marketplace";

    const { writeContract } = useWriteContract();

    // upload image to ipfs

    // const uploadToIPFS = async (file) => {

    //     try {

    //         const stream = fs.createReadStream(file);
    //         const res = await pinata.pinFileToIPFS(stream)


    //     } catch (error) {
    //         console.log("Error while uploading to ipfs", error)
    //     }

    // }




    const { address, isConnecting, isDisconnected } = useAccount();


    return (
        <NFTMarketPlaceContext.Provider value={{
            title,
            address,
            isConnecting,
            isDisconnected,
        }}>
            {children}
        </NFTMarketPlaceContext.Provider>
    )

}

const useNFTMarketPlace = () => useContext(NFTMarketPlaceContext);

export { NFTMarketPlaceProvider, useNFTMarketPlace };

