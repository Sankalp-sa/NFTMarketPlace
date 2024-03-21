import React, { useEffect, useState } from 'react'

import { readContract } from '@wagmi/core'
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'
import config from '../../config'
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext'
import Navbar from '../Components/Navbar'
import { ethers } from 'ethers'

export default function MyNFT() {

    const { address } =  useNFTMarketPlace()  

    const [myNFTs, setMyNFTs] = useState([])

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
            
            setMyNFTs(data)

        }
        catch (error) {

            console.log(error)
        }

    }

    const fetchTokenURIs = async () => {
        const updatedItems = await Promise.all(myNFTs.map(async (item) => {

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
        setMyNFTs(updatedItems)
      }

    useEffect(() => {
        getMyNFT();
    }, [])

    useEffect(() => {
        fetchTokenURIs()
    }, [myNFTs])

    return (
        <>
            <Navbar />
            {myNFTs?.map((item, index) => {
                return (
                  <>
                    <div className="card col-md-3 mx-4" style={{ width: '18rem' }}>
                      <img src={item.tokenURI} className="card-img-top" alt="..." />
                      <div className="card-body">
                        <h5 className="card-title">{item?.name}</h5>
                        <p className="card-text">{item?.description}</p>
                        <p className="card-text">{item?.price} ETH</p>
                        <p className="card-text">{item?.owner}</p>
                        {/* Button trigger modal */}
                        <button type="button" className="btn btn-dark" onClick={() => handleBuyNFT(item?.tokenId, item?.price)}>
                          Buy NFT
                        </button>
                      </div>
                    </div>
                  </>
                )
              })}
        </>
    )
}
