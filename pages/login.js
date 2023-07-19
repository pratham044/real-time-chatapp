import { auth } from '@/firebase/firebase';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import {FcGoogle} from "react-icons/fc";
import {IoLogoFacebook , IoLogoGoogle} from "react-icons/io" ;
import {signInWithEmailAndPassword , GoogleAuthProvider , signInWithPopup , FacebookAuthProvider , sendPasswordResetEmail} from "firebase/auth";
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/router';
import ToastifyMessage from '@/components/ToastifyMessage';
import {  toast } from 'react-toastify';
import Loader from '@/components/Loader';

const gProvider = new GoogleAuthProvider();  
const fProvider = new FacebookAuthProvider();

const Login = () => {
    const router = useRouter();
    const {currentUser , isLoading } = useAuth(false);
    const [email , setEmail] = useState("");

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

    const handleSubmit = async (e) =>{
        e.preventDefault();
            const email = e.target[0].value;
            const password = e.target[1].value ;
        try {
            //await matlab jab tak pura signin process nahi hojayega tab tk wait krega  
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
        }
    }

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

    const resetPassword = async () => {
        try {
            toast.promise( async () => {
                await sendPasswordResetEmail(auth , email)
            } , {
                pending: 'Generating reset link',
                success: 'Reset email has been send to your registered email ',
                error: 'Wrong Email ID entered !! '
            },{
                autoClose:5000 
            })
        } catch (error) {
            console.log(error);
        }
    }
    //showing loader screen in these 2 cases ... 
  return  isLoading || (!isLoading && currentUser ) ? <Loader /> : (
    <div className="h-[100vh] flex justify-center items-center bg-c1"
    > <ToastifyMessage />
        <div className="flex items-center flex-col">
            <div className="text-center">
                <div className="text-4xl font-bold">
                    Login to Your Account 
                </div>
                <div className="mt-3 text-gray-300 ">
                    Chat with anyone , anywhere , anytime !
                </div>
            </div>

            <div className="flex items-center gap-2 w-full mt-10 mb-5">

                <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]"
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
            <form 
            className="flex flex-col items-center gap-3 w-[400px] mt-5 "
            onSubmit={handleSubmit}>
                <input 
                type="email"
                placeholder="Email ID "
                className="w-full h-14 bg-c5 rounded-md outline-none px-5 text-gray-200 "
                autoComplete="off"
                onChange={(e) => {
                    setEmail(e.target.value)
                    console.log(email) ;
                }}
                 />
                 <input 
                type="password"
                placeholder="Password"
                className="w-full h-14 bg-c5 rounded-md outline-none px-5 text-gray-200 "
                autoComplete="off"
                 />
                 <div className="text-right w-full text-c3 ">
                    <span className="cursor-pointer  hover:underline hover:text-gray-100" onClick={resetPassword}>Forgot Password ? </span>
                 </div>
                 <button className='mt-3 w-full h-14 rounded-full flex text-lg outline-none font-bold bg-blue-500 items-center justify-center gap-3 transition-transform active:scale-95'
                 onClick={handleClick}
                 >{loading && <img src='/spinner.svg' />} Login to Your Account</button>
            </form>
            <div className="flex justify-center gap-1 text-c3 mt-5 ">
            <span>Not a Member Yet?</span>
            <Link href="/register" className="font-semibold text-white underline cursor-pointer hover:text-gray-300" >Register Now</Link></div>
        </div>
    </div>
  )
}

export default Login