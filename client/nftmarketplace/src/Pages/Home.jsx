import React, { useEffect } from 'react'

import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext'
import Navbar from '../Components/Navbar';

export default function Home() {

    const {title, address} = useNFTMarketPlace();

  return (
    <>
      <Navbar />
    </>
  )
}
