import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(false)
  return (
    <div className = 'w-full h-screen'>
      <div className={`backdrop-blur-xl border-gray-600 overflow-hidden h-[100%] grid grid-cols-1 relative md:grid-cols-[0.5fr_1.5fr] ${selectedUser ? 'md:grid-cols-[0.87fr_1.8fr_0.8fr] xl-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <RightSidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </div>
    </div>
  )
}

export default Home