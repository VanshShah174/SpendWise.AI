import Guest from '@/components/Guest'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

const Home = async() => {

  const user = await currentUser()

  if(!user) {
    return <Guest />
  }

  return (
    <div className='bg-red'>Home</div>
  )
}

export default Home