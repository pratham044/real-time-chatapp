import Image from 'next/image'
import React from 'react'

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
    <Image 
        src="/loader2.gif" 
        alt='loading..'
        width={300}
        height={300}
    />
    </div>
  )
}

export default Loader