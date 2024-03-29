import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'

import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { readContract } from '@wagmi/core'

import { ethers } from 'ethers'
import {config} from '../../config'

import axios from 'axios'

export default function ViewNFT() {

  const { data, isPending } = useReadContract({
    address: NFTMarketPlaceAddress,
    abi: NFTMarketPlaceABI,
    functionName: 'fetchMarketItems',
    args: [],
  })

  const { data: hash, writeContract, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const [nftItems, setNftItems] = useState([])

  const handleBuyNFT = (tokenId, price) => {

    try {

      const priceInEthers = ethers.parseUnits(price.toString(), "ether")

      writeContract({
        address: NFTMarketPlaceAddress,
        abi: NFTMarketPlaceABI,
        functionName: 'createMarketSale',
        args: [tokenId],
        value: priceInEthers
      })

    } catch (error) {

      console.log(error)
    }

  }

  useEffect(() => {

    if (!isPending && data) {

      console.log(data)

      const fetchTokenURIs = async () => {
        const updatedItems = await Promise.all(data.map(async (item) => {

          const price = ethers.formatUnits(item.price.toString(), 'ether')
          const seller = item.seller
          const owner = item.owner

          const tokenURI = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'tokenURI',
            args: [item.tokenId],
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
        setNftItems(updatedItems)
      }

      try {
        fetchTokenURIs()
      } catch (e) {
        console.log(e)
      }
    }
  }, [data, isPending])


  return (
    <>
      <Navbar />
      <div className="container mx-auto">
        <h3> NFTs Avialable for sale </h3>
        {isPending ? <p>Loading...</p> :
          (
            <div className="row">
              {nftItems?.map((item, index) => {
                return (
                  <div className='card col-md-3 mx-4' key={index}>
                    <div className="" style={{ width: '18rem' }}>
                      <img src={item.tokenURI} className="card-img-top" alt="..." />
                      <div className="card-body">
                        <h5 className="card-title">{item?.name}</h5>
                        <p className="card-text">{item?.description}</p>
                        <p className="card-text">{item?.price} ETH</p>
                        <p className="card-text">{item?.seller}</p>
                        {/* Button trigger modal */}
                        <button type="button" className="btn btn-dark" onClick={() => handleBuyNFT(item?.tokenId, item?.price)}>
                          Buy NFT
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && (
          <div>Error: {(error).shortMessage || error.message}</div>
        )}
      </div>
    </>
  )
}
