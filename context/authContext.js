import { createContext ,useContext, useEffect, useState } from "react";
import { onAuthStateChanged , signOut as authSignOut } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const UserContext  = createContext();

export const UserProvider = ({children}) => {
    const [currentUser , setCurrentUser ] = useState(null);
    const [isLoading , setIsLoading] = useState(true);

    //just to get back states in default value 
    const clear = async () => {
        try {
            if(currentUser){
                await updateDoc(doc(db , "users" , currentUser.uid) , {
                    isOnline : false 
                })
            }
            setCurrentUser(null);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    const authStateChange = async (user) => {
        setIsLoading(true);
        if(!user){
            //case of logout
            clear();
            return ;
        }
        const userDocExist  = await getDoc(doc(db , "users" , user.uid));
        if( userDocExist.exists()){
            await updateDoc(doc(db , "users" , user.uid) , {
                isOnline : true 
            })
        }
        const userDoc = await getDoc(doc( db , "users" , user.uid ));

        setCurrentUser(userDoc.data());
        setIsLoading(false);
    }

    const signOut = () => {
        authSignOut(auth).then(() => {
            clear();
          }).catch((error) => {
            console.log(error) ;
          })
    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth , authStateChange)
        return () => unsubscribe();
    }, [])
    

    return(
        <UserContext.Provider 
        value={{currentUser , setCurrentUser , isLoading , setIsLoading , signOut }}>
            {children}
        </UserContext.Provider>
    )
}
export const useAuth = () => useContext(UserContext);
