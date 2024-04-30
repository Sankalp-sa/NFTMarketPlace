import React, { useEffect, useState } from 'react'
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import Navbar from '../Components/Navbar';
import { readContract } from '@wagmi/core'
import { config } from '../../config';
import { useNavigate } from 'react-router-dom';

const ViewCollection = () => {

    const [collection, setCollection] = useState();
    const navigate = useNavigate();

    const getCollection = async () => {
        const data = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'getAllCollections'
        });
        setCollection(data);
        console.log(data);
    }

    useEffect(() => {
        getCollection();
    },
    []);

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="row">
                    {collection?.map((item, index) => (
                        <div key={index} className="col-md-4 mb-4">
                            <div className="card">
                                <img src={item.image} className="card-img-top" alt={item.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{item.name}</h5>
                                    <p className="card-text">{item.description}</p>
                                    <button onClick={() => {navigate(`/showNFTsinOneCollection/${item.collectionId}`)}} className="btn btn-primary">View More</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ViewCollection
