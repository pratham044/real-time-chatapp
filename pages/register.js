import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase/firebase'; 
import {FcGoogle} from "react-icons/fc";
import {IoLogoFacebook , IoLogoGoogle} from "react-icons/io" ;
import {  GoogleAuthProvider , signInWithPopup , updateProfile , FacebookAuthProvider,createUserWithEmailAndPassword} from "firebase/auth";
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/router';
import ToastifyMessage from '@/components/ToastifyMessage';
import {  toast } from 'react-toastify';
import { doc, setDoc } from 'firebase/firestore';
import { profileColors } from '@/utils/constants';
import Loader from '@/components/Loader';

const gProvider = new GoogleAuthProvider();  
const fProvider = new FacebookAuthProvider();
const Register = () => {
    const router = useRouter();
    const {currentUser , isLoading } = useAuth();
    const [loading , setLoading] = useState(false);
    const handleClick = async () =>{
        setLoading(true);
    }

    useEffect(() => {
        if( !isLoading && currentUser ){
          //user has logged in
          router.push("/");
        }
      }, [currentUser , isLoading]);

      const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, gProvider  )
        } catch (error) {
            console.log(error);
        }
        }
        const signInWithFacebook = async () => {
        try {
            await signInWithPopup(auth, fProvider  )
        } catch (error) {
            console.log(error);
        }
        }
        const handleSubmit = async (e) =>{
                e.preventDefault();
                const displayName = e.target[0].value;
                const email = e.target[1].value ;
                const password = e.target[2].value ;
                const colorIndex = Math.floor(Math.random() * profileColors.length );

            try {
                //await matlab jab tak pura signin process nahi hojayega tab tk wait krega  
                const {user} = await createUserWithEmailAndPassword(auth, email, password);

                await setDoc(doc(db , "users" , user.uid ) , {
                    uid : user.uid,
                    displayName ,
                    email,
                    color : profileColors[colorIndex]
                });
                await setDoc(doc(db , "userChats" , user.uid ) , {});
                
                await updateProfile(user , {displayName})
                console.log(user);

            } catch (error) {
                console.log(error);
            }
        }
  return isLoading || (!isLoading && currentUser ) ? <Loader /> : (
    <div className="h-[100vh] flex justify-center items-center bg-c1">
        <div className="flex items-center flex-col">
            <div className="text-center">
                <div className="text-4xl font-bold">
                    Create New Account 
                </div>
                <div className="mt-3 text-gray-300 ">
                    Chat with anyone , anywhere , anytime !
                </div>
            </div>

            <div className="flex items-center gap-2 w-full mt-10 mb-5">

                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]  "
                onClick={signInWithGoogle} >
                <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md md:whitespace-nowrap">
                <FcGoogle size={22} /><span>Login with Google</span></div>               
                </div>

                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]"
                onClick={signInWithFacebook} >
                        <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md md:whitespace-nowrap m">
                            <IoLogoFacebook size={24} />
                            <span>Login with Facebook</span>
                        </div>
                    </div>
            </div>
            <div className="flex items-center gap-1">
                <span className="w-5 h-[1px] bg-c3"></span>
                <span className="text-c3 font-base">OR</span>
                <span className="w-5 h-[1px] bg-c3"></span>
            </div>
            <form className="flex flex-col items-center gap-3 w-[400px] mt-5 "
            onSubmit={handleSubmit}>
                <input 
                type="text"
                placeholder="Name"
                className="w-full h-14 bg-c5 rounded-md outline-none px-5 text-gray-200 "
                autoComplete="off"
                 />
                <input 
                type="email"
                placeholder="Email ID "
                className="w-full h-14 bg-c5 rounded-md outline-none px-5 text-gray-200 "
                autoComplete="off"
                 />
                 <input 
                type="password"
                placeholder="Password"
                className="w-full h-14 bg-c5 rounded-md outline-none px-5 text-gray-200 "
                autoComplete="off"
                 />
                 {/* <div className="text-right w-full text-c3 ">
                    <span className="cursor-pointer">Forgot Password ? </span>
                 </div> */}
                 <button className='mt-3 w-full h-14 rounded-full flex text-lg outline-none font-bold bg-blue-500 items-center justify-center gap-3 transition-transform active:scale-95'
                 onClick={handleClick}
                 >{loading && <img src='/spinner.svg' />} Sign Up </button>
            </form>
            <div className="flex justify-center gap-1 text-c3 mt-5 ">
            <span>Already have an account?</span>
            <Link href="/login" className="font-semibold text-white underline cursor-pointer hover:text-gray-300" >Login </Link></div>
        </div>
    </div>
  )
}

export default Register ;