import React from 'react'
import PopupWrapper from './PopupWrapper'
import { useAuth } from '@/context/authContext'
import { useChatContext } from '@/context/chatContext'
import { RiErrorWarningLine } from 'react-icons/ri'
import { DELETE_FOR_EVERYONE, DELETE_FOR_ME } from '@/utils/constants'

const DeleteMsgPopup = (props) => {
  const {currentUser} = useAuth();
  const {users , dispatch } = useChatContext();

  return <PopupWrapper {...props} >
      
        <div className="mt-10 mb-5 ">
        <div className='flex items-center justify-center gap-3'>
            <RiErrorWarningLine 
                size={24}
                className='text-red-700'
            />
            <div className='text-lg' >Are you sure , you want to delete this message ?</div>
        </div>
        <div className='flex items-center justify-center gap-2 mt-10'>
            { props.self && (<button 
            onClick={() => props.deleteMessage(DELETE_FOR_ME)}
            className='border-[2px] border-red-600 py-2 px-3 text-sm rounded-full  hover:bg-red-600 '>Delete for me</button>)}
            
            <button  
            onClick={() => props.deleteMessage(DELETE_FOR_EVERYONE) }
            className='border-[2px] border-red-600 py-2 px-3 text-sm rounded-full  hover:bg-red-600 '>Delete for everyone</button>

            <button 
            onClick={props?.onHide}
            className='border-[2px] border-blue-500 py-2 px-3 text-sm rounded-full  hover:bg-white hover:text-blue-600 '>Cancel</button>
        </div>
        </div>
    </PopupWrapper>

}

export default DeleteMsgPopup;
