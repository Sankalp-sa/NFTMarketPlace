import React, { useEffect, useState } from 'react'
import { readContract, writeContract } from '@wagmi/core'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'
import { config } from '../../config'
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext'
import Navbar from '../Components/Navbar'
import { ethers } from 'ethers'
import ViewMyCollections from './ViewMyCollections'

export default function MyNFT() {

  const { address } = useNFTMarketPlace()

  const [myNFTs, setMyNFTs] = useState([])
  const [resalePrice, setResalePrice] = useState()

  const listingData = useReadContract({
    address: NFTMarketPlaceAddress,
    abi: NFTMarketPlaceABI,
    functionName: 'getListingPrice',
    args: [],
  })

  const listingPrice = listingData.data

  const getMyNFT = async () => {

    try {

      console.log(address)

      const data = await readContract(config, {
        abi: NFTMarketPlaceABI,
        address: NFTMarketPlaceAddress,
        functionName: 'fetchMyNFTs',
        args: [],
        account: address
      })

      console.log(data)

      fetchTokenURIs(data)

    }
    catch (error) {

      console.log(error)
    }

  }

  const fetchTokenURIs = async (data) => {

    // console.log("Hello")

    const updatedItems = await Promise.all(data.map(async (item) => {

      const price = ethers.formatEther(item?.price.toString())
      const seller = item?.seller
      const owner = item?.owner

      const tokenURI = await readContract(config, {
        abi: NFTMarketPlaceABI,
        address: NFTMarketPlaceAddress,
        functionName: 'tokenURI',
        args: [item?.tokenId],
      })

      // trim ipfs hash from the tokenURI

      const IpfsHash = tokenURI.split('/ipfs/')[1]

      // console.log(IpfsHash)

      const res = await fetch(
        "https://api.pinata.cloud/data/pinList?status=pinned",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
        }
      );
      // console.log(nftName, nftDescription)


      const resData = await res.json();
      console.log(resData)

      // find th data from the resData array whose ipfs hash matches the IpfsHash

      const nftData = resData.rows.find((row) => row.ipfs_pin_hash === IpfsHash)

      console.log(nftData)

      // console.log(nftData?.metadata?.keyvalues?.nftName, nftData?.metadata?.keyvalues?.description)

      return {
        ...item,
        tokenURI,
        price,
        seller,
        owner,
        name: nftData?.metadata?.keyvalues?.nftName,
        description: nftData?.metadata?.keyvalues?.description
      }
    }))
    setMyNFTs(updatedItems)
  }

  useEffect(() => {
    getMyNFT();
  }, [])

  const handleResaleNFT = async (tokenId) => {

    console.log(tokenId)

    try {

      console.log(resalePrice)

      const price = ethers.parseUnits(resalePrice.toString(), 'ether');

      console.log(tokenId)

      const result = await writeContract(config, {
        abi: NFTMarketPlaceABI,
        address: NFTMarketPlaceAddress,
        functionName: 'resellToken',
        args: [tokenId, price],
        account: address,
        value: listingPrice.toString()
      });
      console.log(result);
    } 
    catch (error) {
      console.log("Error occured in resale nft " + error);
    }

  }

  return (
    <>
      <Navbar />
      <div className='row m-3'>
        {myNFTs?.map((item, index) => {
          return (
            <>
              <div key={index} className="card col-md-3 mx-4" style={{ width: '18rem' }}>
                <img src={item?.tokenURI} className="card-img-top" alt="..." />
                <div className="card-body">
                  <h5 className="card-title">{item?.name}</h5>
                  <p className="card-text">{item?.description}</p>
                  {/* <p className="card-text">{item?.price} ETH</p> */}
                  {/* <p className="card-text">{item?.owner}</p> */}
                  {/* Button trigger modal */}
                  <div>
                    <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target={`#modal${index}`}>
                      Resale NFT
                    </button>
                    {/* Modal */}
                    <div className="modal fade" id={`modal${index}`} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Resale NFT</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                          </div>
                          <div className="modal-body">
                            <h3>NFT name: {item?.name}</h3>
                            <div className="mb-3">
                              <label className="form-label">Enter the Resale price below</label>
                              <input type="text" className="form-control" placeholder="enter price in ether" onChange={(e) => setResalePrice(e.target.value)} />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-dark" onClick={() => handleResaleNFT(item?.tokenId)}>Resale</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </>
          )
        })}
        {/* {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {error && (
        <div>Error: {error.message}</div>
      )} */}
      
      </div>

      <ViewMyCollections />
    </>
  )
}
