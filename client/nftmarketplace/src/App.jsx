import { useState } from 'react'
import './App.css'
import {Routes, Route} from 'react-router-dom';
import Home from './Pages/Home';
import CreateNFT from './Pages/CreateNFT';

import ViewNFT from './Pages/ViewNFT';
import MyNFT from './Pages/MyNFT';
import ViewAuctions from './Pages/ViewAuctions';
import AddCollections from './Pages/AddCollections';
import AddNFTstoCollection from './Pages/AddNFTstoCollection';
import ViewCollection from './Pages/ViewCollection';
import ViewMyCollections from './Pages/ViewMyCollections';
import ShowNFTsinOneCollection from './Pages/ShowNFTsinOneCollection';
import DeatilofNFT from './Pages/DeatilofNFT';
import ViewSingleAuction from './Pages/ViewSingleAuction';
// import MyNFT from './Pages/MyNFT';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/createNFT" element={<CreateNFT />} />
      <Route path="/viewNFTs" element={<ViewNFT />} />
      <Route path='/myNFT' element={<MyNFT />} />
      <Route path="/createCollection" element={<AddCollections />} />
      <Route path="/addnfttoCollection/:collectionId" element={<AddNFTstoCollection />} />
      <Route path='/viewCollection' element={<ViewCollection />} />
      <Route path='/viewMyCollection' element={<ViewMyCollections />} />
      <Route path='/showNFTsinOneCollection/:collectionId' element={<ShowNFTsinOneCollection /> } />
      <Route path='/detailofNFT/:nftId' element={<DeatilofNFT /> } />
      <Route path="/viewAuctions" element={<ViewAuctions />} />
      <Route path="/viewAuction/:auctionId" element={<ViewSingleAuction />} />
    </Routes>
  )
}

export default App
