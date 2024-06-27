import React from 'react'
import FolderList from '../components/FolderList'
import Header from '../components/Header'; 
import "./Home.css"
function Home() {
  return (
		<div>
			<Header />
            <FolderList />
		</div>
    )
}

export default Home