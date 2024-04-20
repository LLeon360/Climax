"use client"
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useUser, useFirestore, useFirestoreDocData } from 'reactfire'

const Page = () => {

    const [userCode, setUserCode] = useState<number|null>(null);

  const { data: user } = useUser();
  const firestore = useFirestore();
  const userRef = doc(firestore, 'accounts', user.uid);
  useEffect(() => {
    const setOrFetchCode = async () => {
        const docSnap = await getDoc(userRef);
        if(docSnap.exists()){
            if(!docSnap.data().code){
                //generate 4 random digits
                const code = Math.floor(1000 + Math.random() * 9000);
                await updateDoc(userRef, {code});
                setUserCode(code);
            }
            else{
                setUserCode(docSnap.data().code);
            }
        }
    }
    setOrFetchCode();
  }, [])



if(!user){
    return <div>Loading...</div>
}
  return (
    <div>
      {userCode && <p>Your unique code: {userCode}</p>}
    </div>
  )
}

export default Page