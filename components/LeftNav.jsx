import React, { useState } from 'react'
import {BiCheck, BiEdit} from "react-icons/bi";
import Avatar from './Avatar';
import { useAuth } from '@/context/authContext';
import Icon from './Icon';
import {IoLogOutOutline , IoClose} from "react-icons/io5"
import {MdPhotoCamera , MdAddAPhoto, MdDeleteForever} from "react-icons/md"
import {HiPlus} from "react-icons/hi";
import {BsFillCheckCircleFill} from "react-icons/bs";
import { profileColors } from '@/utils/constants';
import {  toast } from 'react-toastify';
import ToastifyMessage from '@/components/ToastifyMessage';
import { updateDoc , doc } from 'firebase/firestore';
import { db , auth, storage } from '@/firebase/firebase';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import UsersPopup from './popup/UsersPopup';
import ClickAwayListener from 'react-click-away-listener';

const LeftNav = () => {
    const [usersPopup , setUsersPopup] = useState(false);
    const [editProfile , setEditProfile ] = useState(false);

    const {currentUser , signOut , setCurrentUser } = useAuth();
    const [nameEdited , setNameEdited ] = useState(false);
    const authUser = auth.currentUser ;

    const uploadImageToFirestore = (file) => {
        try {
            if(file){
                const storageRef = ref(storage , currentUser.displayName );

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
            (snapshot) => {
               
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                console.log(error) ;
            }, 
            () => {
                
                getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
                    console.log('File available at', downloadURL);
                    handleUpdateProfile("photo" , downloadURL);
                    await updateProfile(authUser , {
                        photoURL : downloadURL 
                    });
                });
            }
            );
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleUpdateProfile = async (type , value) => {
        //name , color , pic , remove_pic
        let obj = {...currentUser} 
        switch (type) {
            case "color":
                obj.color = value ;
                break;
            case "name":
                obj.displayName = value ;
                break;
            case "photo":
                obj.photoURL = value ;
                break;
            case "photo-remove":
                obj.photoURL = null ;
                break;        
            default:
                break;
        }
        try {
                toast.promise( async () => {
                
                const userDocRef = doc(db , "users" , currentUser.uid)
                await updateDoc(userDocRef , obj);
                setCurrentUser(obj);

                if(type === "photo-remove"){
                    console.log("hh");
                    await updateProfile(authUser , {
                        photoURL : null 
                    });
                }
                if(type === "name"){
                    await updateProfile(authUser , {
                        displayName : value 
                    });
                }
               
                setNameEdited(false);

            } , {
                pending: 'Updating Profile...',
                success: 'Profile updated successfully!!',
                error: 'Profile update failed!!'
            },{
                autoClose:3000 
            })
        } catch (error) {
            console.log(error);
        }
    }
    const onKeyUp = (event) => {
        if(event.target.innerText.trim() !== currentUser.displayName ){
            //name is edited
            setNameEdited(true);
        }
        else{
            // name is not edited
            setNameEdited(false);
        }
    }
    const onKeyDown = (event) => {
        if(event.key === "Enter" && event.keyCode === 13 ){
            event.preventDefault();
        }
    }
    const editProfileContainer = () => {
        return (
            <div className="relative flex flex-col items-center">
            <ToastifyMessage />
                <Icon 
                    size="small"
                    className="absolute top-0 right-5 hover:bg-gray-600"
                    icon={<IoClose size={20} />}
                    onClick={() => setEditProfile(false)}
                />
                <div className="relative group cursor-pointer">
                    <Avatar size="xx-large" user={currentUser} />
                    <div className="w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex">
                       <label htmlFor='fileUpload'>
                       {currentUser.photoURL ? (
                            <MdPhotoCamera size={34} />
                  
                        ) : (
                            <MdAddAPhoto size={34} />
                        )
                       }
                       </label>
                       <input 
                            id='fileUpload'
                            type='file'
                            onChange={(e) => {
                                uploadImageToFirestore(e.target.files[0])
                            }}
                            style={{display : "none"}}
                             />
                    </div>
                       {currentUser.photoURL && (
                            <div className="w-6 h-6 rounded-full bg-red-500 flex justify-center items-center absolute right-0 bottom-0"
                            onClick={() => {
                                handleUpdateProfile("photo-remove");
                            }}>
                                <MdDeleteForever size={14} />
                            </div>
                        )
                       }
                </div>
                <div className="mt-5 flex flex-col items-center">
                    <div className="flex items-center gap-2 ">
                    {
                        !nameEdited && <BiEdit className="text-c3 "
                         />
                    }
                    {
                        nameEdited && (
                            <BsFillCheckCircleFill 
                                className="text-green-300 cursor-pointer"
                                onClick={ () =>{
                                    handleUpdateProfile("name", document.getElementById("displayNameEdit").innerText )
                                }}
                            />
                        )
                    }
                        <div contentEditable={true}
                         className="bg-transparent outline-none border-none text-center"
                         id='displayNameEdit'
                         onKeyUp={onKeyUp}
                         onKeyDown={onKeyDown}>
                            {currentUser?.displayName}
                        </div>
                    </div>
                    <span className="text-c3 text-sm">{currentUser?.email}</span>
                </div>
                <div className="grid grid-cols-5 gap-4 mt-5">
                    {
                        profileColors?.map((color , index) => (
                            <span key={index}
                            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125" 
                            style={{backgroundColor : color}}
                            onClick={() =>{
                                handleUpdateProfile("color", color )
                            }}
                            >
                                {color === currentUser.color && <BiCheck size={24}/>}
                            </span>
                        ))
                    }
                </div>
            </div>
        )
    }
  return (
    <div className={` ${editProfile ? "w-[350px]" :"w-[80px] items-center"} flex flex-col justify-between py-5 shrink-0 transition-all`} >
       {editProfile ? editProfileContainer() : ( 
            <div className="relative group cursor-pointer"
            onClick={() => setEditProfile(true)} >
            <Avatar size="large" user={currentUser} />
            <div className="w-full h-full rounded-full bg-black/[0.5]
            absolute top-0 left-0 justify-center items-center hidden group-hover:flex">
                <BiEdit size={14} />
            </div>
        </div>
        )}
        <div className={`flex gap-5 ${editProfile ? "ml-5" : "flex-col items-center" }`} >
            <Icon size="x-large" 
                className="bg-blue-500 hover:bg-gray-400 "
                icon={<HiPlus size={24} />} onClick={() => setUsersPopup(!usersPopup)}
            />
            <Icon className="hover:bg-gray-600" 
                size="x-large"
                icon={<IoLogOutOutline size={24} />}
                onClick={signOut}
            />
        </div>
        
        { usersPopup && <ClickAwayListener onClickAway={() => setUsersPopup(false)}>
        <UsersPopup onHide={() =>setUsersPopup(false) } title="Find Users"  />
       </ClickAwayListener>}
      
       
    </div>
  )
}

export default LeftNav