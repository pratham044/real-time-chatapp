import React from 'react'
import ChatHeader from './ChatHeader'
import Messages from './Messages'
import { useChatContext } from '@/context/chatContext'
import ChatFooter from './ChatFooter'
import { useAuth } from '@/context/authContext'

const Chat = () => {

      const {currentUser} = useAuth();
      const {data , users} = useChatContext();
  
      const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find( u => u === data.user.uid )
  
      const IamBlocked = users[data.user.uid]?.blockedUsers?.find( u => u === currentUser.uid )
  return (
    <div className='flex flex-col p-5 grow '>
        <ChatHeader />
        { data.chatId &&  <Messages /> }
        {!IamBlocked && !isUserBlocked && <ChatFooter />}
        {isUserBlocked && (<div className='w-full text-center font-medium text-c3 py-5 bg-c1/[0.4] p-2 rounded-full'>This user has been blocked !</div>)}
        {IamBlocked && (<div className='w-full text-center font-medium text-c3 py-5 bg-c1/[0.4] p-2 rounded-full'>{`${data.user.displayName} has blocked you! `} </div>)}
    </div>
  )
}

export default Chat;