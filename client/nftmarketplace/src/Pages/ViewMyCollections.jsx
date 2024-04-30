import React, { useEffect, useState } from 'react';
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import { readContract } from '@wagmi/core'
import { config } from '../../config';
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext';
import { Link, useNavigate } from 'react-router-dom';

const ViewMyCollections = () => {

    const [mycollections, setMyCollections] = useState();
    const { address } = useNFTMarketPlace();

    const navigate = useNavigate();

    const getCollection = async () => {
        const data = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'getMyCollections',
            account: address
        });
        setMyCollections(data);
        // console.log("MyCollections: ");
        // console.log(data);
    }

    useEffect(() => {
        getCollection();
    },
    []);

    return (
        <>
            <div className="container mt-4">
                <h3>My Collections</h3>
                <div className="row">
                    {mycollections?.map((item, index) => (
                        <div key={index} className="col-md-4 mb-4">
                            <div className="card">
                                <img src={item.image} className="card-img-top" alt={item.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{item.name}</h5>
                                    <p className="card-text">{item.description}</p>
                                    <button onClick={() => {
                                        navigate(`/addnfttoCollection/${item.collectionId}`);
                                    }} className="btn btn-primary">Add NFTs</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ViewMyCollections
