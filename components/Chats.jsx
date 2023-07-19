import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext'
import { db } from '@/firebase/firebase';
import { Timestamp, collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import {RiSearch2Line} from "react-icons/ri";
import Avatar from './Avatar';
import { formatDate } from '@/utils/helpers';
import { Fade } from 'react-awesome-reveal';

const Chats = () => {
    const {
        users , setUsers , chats , setChats ,
        selectedChat , setSelectedChat , dispatch , data , resetFooterStates
    } = useChatContext();

    const [ search , setSearch ]= useState("");
    const [ unreadMsgs , setUnreadMsgs ]= useState({});
    const {currentUser} = useAuth();

    const isBlockExecutedRef = useRef(false);
    const isUsersFetchedRef = useRef(false);

    useEffect(()=>{
        resetFooterStates();
    }, [data?.chatId])

    
     useEffect(() => {
        onSnapshot(collection(db , "users") ,
        (snapshot) => {
            const updatedUsers = {};
            snapshot.forEach((doc) => {
                updatedUsers[doc.id] = doc.data();
                console.log(doc.data());
            });
            setUsers(updatedUsers);

            if( !isBlockExecutedRef.current){
                isUsersFetchedRef.current = true ;
            }
        } )
     }, []);

     useEffect(() => {
        const documentIds = Object.keys(chats);
        if( documentIds.length === 0) return ;

        const q = query(
            collection(db , "chats") ,where("__name__" , "in" , documentIds)
        )

        const unsub = onSnapshot(q , (snapshot) => {
            let msgs = {}
            snapshot.forEach((doc) => {
                if( doc.id !== data.chatId){
                    msgs[doc.id] = doc.data().messages.filter((m)=> m?.read === false && m?.sender !== currentUser.uid)
                }

                Object.keys(msgs || {})?.map((c) => {
                    if(msgs[c]?.length < 1 ){
                        delete msgs[c];
                    }
                })
            })
            setUnreadMsgs(msgs);
        })
        return () => unsub();
     }, [chats , selectedChat ])
     
     useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db , "userChats" , currentUser.uid) , (doc) => {
                if(doc.exists()){
                    // where chats are preavailable
                    const data = doc.data();
                    setChats(data);

                    if( !isBlockExecutedRef.current && isUsersFetchedRef.current && users ){
                        const firstChat = Object.values(data)?.filter( chat => !chat.hasOwnProperty("chatDeleted"))?.sort((a,b) => b.date - a.date)[0];
                        
                        if(firstChat){
                            const user = users[firstChat?.userInfo?.uid];
                            handleSelect(user);

                            const chatId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid ;

                            readChat(chatId);

                        }
                        isBlockExecutedRef.current = true ;

                    }
                }
            });
        }
        currentUser.uid && getChats();
     }, [isBlockExecutedRef.current , users])
     
     // convert chats in array .. it is in object form so we cant access it & sort acc to time 
     const filteredChats = Object.entries(chats || {}).filter( ([, chat])=> !chat.hasOwnProperty("chatDeleted"))
     .filter( ([, chat]) => 
            chat?.userInfo?.displayName.toLowerCase().includes(search.toLocaleLowerCase()) || chat?.lastMessage?.text.toLowerCase().includes(search.toLocaleLowerCase()) )
     .sort( (a,b) => b[1].date - a[1].date )

     console.log(filteredChats);
     
     const readChat = async (chatId) => {
        const chatRef = doc(db , "chats" , chatId );
        const chatDoc = await getDoc(chatRef);

        let updatedMessages = chatDoc.data().messages.map(m => {
            if(m?.read === false){
                m.read = true ;
            }
            return m;
        })

        await updateDoc(chatRef , {
            messages : updatedMessages 
        })


     }
     const handleSelect = ( user , selectedChatId ) => {
        setSelectedChat(user) ;
        dispatch({ type: "CHANGE_USER", payload: user });
        if(unreadMsgs?.[selectedChatId]?.length > 0 ){
            readChat(selectedChatId);
        }
     }
  return (
    <div className='flex flex-col h-full'>
        <div className='shrink-0 sticky -top-[20px] z-10 flex justify-center w-full bg-c2 py-3'>
            <RiSearch2Line className='absolute left-5 top-[24px] text-c3' size={18}/>
            <input 
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search your friend...'
                className='w-full h-12 rounded-full bg-c1/[0.9] pl-11  pr-5 placeholder:text-gray-300/[0.6] outline-none text-base'
            />
        </div>
        <ul className='flex flex-col w-full my-3 gap-[3px]'>
        { Object.keys(users || {}).length > 0 && 
                filteredChats?.map((chat) =>{
                    
                    const timestamp = new Timestamp(
                        chat[1]?.date?.seconds , 
                        chat[1]?.date?.nanoseconds
                    )

                    const date = timestamp.toDate();
                    console.log(date);
                    const user = users[chat[1].userInfo.uid];
                    return(
                <li key={chat[0]} 
                onClick={() => handleSelect(user , chat[0]) }
                className={`h-[70px] flex items-center gap-4 rounded-full hover:bg-c1  p-4 cursor-pointer ${selectedChat?.uid === user.uid ? "bg-c1"  : "bg-c1/[0.4]" }`}>
                    
                <Avatar size="large" user={user} />
                <div className='flex flex-col gap-1 grow relative'>
                    <span className='text-base text-white flex items-center justify-between'>
                        <div className='font-medium'>
                            {user?.displayName}
                        </div>
                        <div className='text-c3 text-xs p-2'>
                            {formatDate(date)}
                        </div>
                    </span>
                    <p className='text-sm text-c3 line-clamp-1 break-all mt-1 '>
                        {chat[1]?.lastMessage?.text || (chat[1]?.lastMessage?.img && "image..." || "Send your first msg...")}
                    </p>
                    { !!unreadMsgs?.[chat[0]]?.length  && (<span className='absolute right-1 top-7 min-w-[20px] h-5 p-1 rounded-full bg-green-500 flex justify-center items-center text-sm '>
                        {unreadMsgs?.[chat[0]]?.length}
                    </span>)}
                </div>
                
            </li>
                    )
                })
            }
            
        </ul>
    </div>
  )
}

export default Chats