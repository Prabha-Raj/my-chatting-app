import React from 'react'
import { useAuth } from '../../context/AuthContext'
import Message from '../chat/Message'

const Home = () => {
    const {authUser} = useAuth()
  return (
    <div>
        <Message/>
    </div>
  )
}

export default Home
