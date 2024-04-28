import React from 'react'
import Navbar from '../Components/Navbar'

const AddCollections = () => {
  return (
    <>
            <Navbar />
            <div className="container-fluid" style={{ padding: "5% 12%" }}>
                <form className='border border-2 border-black rounded-3' style={{ padding: "5% 5%" }}>
                    <div>
                        <div className="mb-3">
                            <label className="form-label">Enter the name of Collections:</label>
                            <input type="text" className="form-control" placeholder='Enter name of Collections here' onChange={(e) => setNftName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Enter the description of the Collections</label>
                            <textarea style={{height: "100px"}} type="text" className="form-control" placeholder='Write your description here' onChange={(e) => setNftDescription(e.target.value)} >
                            </textarea>
                        </div>
                        <button className="btn btn-dark">Submit</button>
                    </div>
                </form>
            </div>
        </>
  )
}

export default AddCollections
