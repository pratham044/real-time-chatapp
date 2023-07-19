import { useChatContext } from '@/context/chatContext'
import { db } from '@/firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import Message from './Message';
import { DELETE_FOR_ME } from '@/utils/constants';
import { useAuth } from '@/context/authContext';
import { Fade } from 'react-awesome-reveal';

const Messages = () => {
  const {data , setIsTyping } =  useChatContext();
  const [ messages , setMessages] = useState([]);
  const ref = useRef();
  const {currentUser} = useAuth();

  useEffect(() => {
    const unsub = onSnapshot(doc(db , "chats" , data.chatId) , (doc) => {
      if(doc.exists()){
        setMessages(doc.data().messages);
        setIsTyping(doc.data()?.typing?.[data.user.uid] || false);
      }
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    });
    return () => unsub() ;
  } , [data.chatId])

  const scrollToBottom = () => {
    const chatContainer = ref.current ;
    chatContainer.scrollTop = chatContainer.scrollHeight ;
  }

  return (
    <div 
    ref={ref}
    className='grow p-5 overflow-auto scrollbar flex flex-col '>
      {messages?.filter((m) => {
        return (m?.deletedInfo?.[currentUser.uid] !== DELETE_FOR_ME && !m?.deletedInfo?.deletedForEveryone && !m?.deleteChatInfo?.[currentUser.uid] );
      })?.map((m)=>{
        return (
          <Message message={m} key={m.id} />)
        
      })}
    </div>
  )
}

export default Messages