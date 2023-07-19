import React, { useEffect, useRef } from 'react'
import ClickAwayListener from 'react-click-away-listener'

    const MessageMenu = ( {showMenu , setShowMenu , self , deletePopupHandler , setEditMsg  } ) => {
        
    const handleClickAway = () => { 
        setShowMenu(false);
    }

    const ref = useRef();
    useEffect(() => {
        ref?.current?.scrollIntoViewIfNeeded();
    } , [showMenu])
    
  return (
    <ClickAwayListener 
    onClickAway={handleClickAway}>
    <div  ref={ref}
    className={`w-[200px] absolute z-20 bg-c0 rounded-2xl overflow-hidden top-8 ${self ? "right-4" : "left-4" }`}>
         <ul className='flex flex-col gap-1'>
            { self && (<li className='flex items-center py-3 px-5 hover:bg-black cursor-pointer rounded-full '
            onClick={(e) =>{
                e.stopPropagation();
                setEditMsg(); 
                setShowMenu(false);
        }} >
                Edit Message
            </li>)}
            <li className='flex items-center py-3 px-5 hover:bg-black rounded-full cursor-pointer'
            onClick={(e) =>{ e.stopPropagation();
                    deletePopupHandler();
            }}>
                Delete Message 
            </li>
         </ul>
    </div>
    </ClickAwayListener>
  )
}

export default MessageMenu