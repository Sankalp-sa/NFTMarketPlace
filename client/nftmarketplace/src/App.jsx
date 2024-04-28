import { useState } from 'react'
import './App.css'
import {Routes, Route} from 'react-router-dom';
import Home from './Pages/Home';
import CreateNFT from './Pages/CreateNFT';

import ViewNFT from './Pages/ViewNFT';
import MyNFT from './Pages/MyNFT';
import AddCollections from './Pages/AddCollections';
// import MyNFT from './Pages/MyNFT';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/createNFT" element={<CreateNFT />} />
      <Route path="/viewNFTs" element={<ViewNFT />} />
      <Route path='/myNFT' element={<MyNFT />} />
      <Route path="/addCollections" element={<AddCollections /> } />
    </Routes>
  )
}

export default App
