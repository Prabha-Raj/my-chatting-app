import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom';

const VeryfiUser = () => {
    const {authUser} = useAuth();
  return authUser ? <Outlet/> : <Navigate to='/login'/>
}

export default VeryfiUser
