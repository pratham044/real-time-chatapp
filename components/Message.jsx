import { useAuth } from '@/context/authContext'
import React, { useState } from 'react'
import Avatar from './Avatar';
import { useChatContext } from '@/context/chatContext';
import Image from 'next/image';
import ImageViewer from "react-simple-image-viewer";
import { Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { formatDate, wrapEmojisInHtmlTag } from '@/utils/helpers';
import Icon from './Icon';
import {GoChevronDown} from "react-icons/go";
import MessageMenu from './MessageMenu';
import DeleteMsgPopup from './popup/DeleteMsgPopup';
import { db } from '@/firebase/firebase';
import { DELETE_FOR_EVERYONE, DELETE_FOR_ME } from '@/utils/constants';


const Message = ({message}) => {
    const [showMenu , setShowMenu] = useState(false);
    const [showDeletePopup , setShowDeletePopup] = useState(false);
    const {currentUser} = useAuth();
    const {users , data ,  imageViewer , setImageViewer , editMsg , setEditMsg } = useChatContext();

    const self = message.sender === currentUser.uid ;
    
    const deletePopupHandler = () => { 
        setShowDeletePopup(true);
        setShowMenu(false);
    }
    
    const timestamp = new Timestamp(
        message.date?.seconds ,
        message.date?.nanoseconds
    )
    const date = timestamp.toDate();

    const deleteMessage = async (action) => {
        try {
            const messageId = message.id ;
            const chatRef = doc(db , "chats" , data.chatId );
            
            const chatDoc = await getDoc(chatRef);

            const updatedMessages = chatDoc.data().messages.map((message) => {
                if(message.id === messageId){
                    if( action === DELETE_FOR_ME){
                        message.deletedInfo = {
                            [currentUser.uid] : DELETE_FOR_ME
                        }
                    }
                    if( action === DELETE_FOR_EVERYONE ){
                        message.deletedInfo = {
                            deletedForEveryone : true  
                        }
                    }
                }
                return message ;
            })
             await updateDoc( chatRef , {messages: updatedMessages });
             setShowDeletePopup(false);
        } catch (error) {
            console.log(error);
        }
    }

  return (
         
    <div className={` mb-4 max-w-[75%]  ${self ? "self-end" : "" } `}>
        { showDeletePopup && ( <DeleteMsgPopup
        onHide={() => setShowDeletePopup(false)}
        noHeader={true}
        className="DeleteMsgPopup"
        shortHeight={true}
        self={self}
        deleteMessage={deleteMessage}
         />)}

         <div className={`flex items-end gap-3 mb-1 ${self ? "justify-start flex-row-reverse" : "" }`}>
         
         <Avatar 
         size="small" 
         user={ self ? currentUser : users[data?.user?.uid]}
         className = "mb-5"
         />
         <div className={` relative group flex flex-col gap-4 px-4 py-2 rounded-3xl  break-all ${self ? "rounded-br-sm bg-c5" : "rounded-bl-sm bg-c1"}`}>
           {
            message?.text && (
                <div className='text-sm'
                dangerouslySetInnerHTML={{__html:wrapEmojisInHtmlTag(message.text)}}
                ></div>
            )
           }
           {
            message?.img && (
                <>
                    <Image 
                    width={250}
                    height={250}
                    src={message.img}
                    alt={message?.text || "" }
                    className='rounded-xl max-w-[250px] overflow-hidden'
                    onClick={() =>{
                        setImageViewer({ msgId : message.id , url : message.img })
                    }}
                    />

                    {
                        imageViewer && imageViewer?.msgId === message?.id && <ImageViewer 
                            src={[imageViewer.url]}
                            currentIndex={0}
                            disableScroll={false}
                            closeOnClickOutside={true}
                            onClose={() => 
                            setImageViewer(null)
                            }
                        />
                    }
                </>
            )
           }

           <div className={`${showMenu ? "" : "hidden"}  absolute rounded-full group-hover:flex  top-0 ${self ? "left-0 bg-c5/[0.4]" : "right-0 bg-c1/[0.4]" } `}
           onClick={() => setShowMenu(true)}>
            <Icon
             size="medium"
             className="hover:bg-inherit "
             icon={<GoChevronDown size={15} className='text-white rounded-full '/>}
             />
             { showMenu && (<MessageMenu 
                
                self={self}
                setShowMenu={setShowMenu}
                showMenu={showMenu}
                deletePopupHandler = {deletePopupHandler}
                setEditMsg={() => setEditMsg(message)}
             />)}
           </div>
         </div>
         
         </div>
         <div className={`flex  items-end ${self ? "justify-start flex-row-reverse mr-12 " : "ml-12" } `}>
           <div className='text-xs text-c3'>
            {formatDate(date)}
           </div>
         </div>
    </div>

    
  )
}

export default Message