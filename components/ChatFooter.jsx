import React, { useState } from 'react'
import Icon from './Icon'
import {CgAttachment} from "react-icons/cg";
import {BsEmojiSmile} from "react-icons/bs";
import Composebar from './Composebar';
import EmojiPicker from 'emoji-picker-react';
import ClickAwayListener from 'react-click-away-listener';
import { useChatContext } from '@/context/chatContext';
import { IoClose } from 'react-icons/io5';
import {TiDelete} from "react-icons/ti";
import { MdDeleteForever } from 'react-icons/md';


const ChatFooter = () => {
    const [ showEmojiPicker , setShowEmojiPicker ] = useState(false);

    const onEmojiClick = (emojiData , event) => {
        let text = inputText ;
        setInputText( (text += emojiData.emoji ))
    }

    const {isTyping , editMsg , setEditMsg , inputText ,data , setInputText , setAttachment ,setAttachmentPreview ,attachmentPreview } = useChatContext();

    const onFileChange = (e) => {
         const file = e.target.files[0]
         setAttachment(file);
         if(file){
            const blobUrl = URL.createObjectURL(file)
            setAttachmentPreview(blobUrl);
         }
    }
  return (
    <div className='flex items-center bg-c1/[0.7] p-2 rounded-full relative'>
        {
            attachmentPreview && (
            <div className='absolute w-[100px] h-[100px] bottom-16 left-0 bg-c1 p-2 rounded-md overflow-hidden '>
            <img  src={attachmentPreview} />
            <div className='w-6 h-6 rounded-full bg-red-500 flex justify-center  items-center absolute -right-1 -top-1 cursor-pointer '
            onClick={() =>{
                setAttachment(null);
                setAttachmentPreview(null);
            }}>
                <MdDeleteForever size={14}/>
            </div>
        </div>
            )
        }
        {/* file upload icon */}
        <div className='shrink-0 pl-1'>
            <input 
                type='file'
                id='fileUploader'
                className='hidden'
                onChange={onFileChange}
            />
            <label htmlFor='fileUploader'>
                <Icon
                    size="large"
                    icon={<CgAttachment />}
                    className="text-c3 hover:bg-gray-800/[0.9] "
                />
            </label>
        </div>

        <div className='shrink-0 relative'>
        <Icon 
            size="large"
            // className={``}
            icon={<BsEmojiSmile />}
            onClick={() => {
                setShowEmojiPicker(true);
            }}
            className="text-c3 hover:bg-gray-800/[0.9] "
            />
        { showEmojiPicker && (
                <ClickAwayListener 
                onClickAway={() => setShowEmojiPicker(false)}>    
            <div className='absolute bottom-12 left-0 shadow-lg  '>
            <EmojiPicker 
            emojiStyle='native'
            theme='light'
            onEmojiClick={onEmojiClick}
            autoFocusSearch={false}
            />
            </div>
            </ClickAwayListener>)
        }
        </div>
        {
            isTyping &&( <div className='absolute -top-6 left-4 bg-c2 w-full h-6'>
            <div className='flex gap-2 w-full h-full opacity-50 text-sm text-white '>
                {`${data?.user?.displayName} is typing`}
                <img src='/typing.svg'/>
            </div>
        </div>)
        }
        {
            editMsg && (
                <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-c4 flex items-center gap-2 py-2 px-4 pr-2 rounded-full text-sm font-semibold cursor-pointer shadow-lg' onClick={() =>setEditMsg(null) }>
            <span>Undo Edit</span>
            <IoClose size={20} className='text-white' />
        </div>
            )
        }
        <Composebar />
    </div>
  )
}

export default ChatFooter