"use client"
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useUser, useFirestore,  } from 'reactfire'
import ClimaxiPhone from "@/public/ClimaxiPhone.png"
import Watch from "@/public/Watch.png"
import Image from "next/image"

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
  <div className="flex flex-col md:flex-row items-center justify-center p-4">
    <div className="text-center md:text-left md:mr-8">
      <h1 className="text-2xl font-bold mb-2">Your code is:</h1>
      <p className="text-9xl font-semibold mb-4">{userCode}</p>      <div className="text-sm md:text-base">
        <p>Download the Climax app and enter your code on your phone!</p>
        <p>Then, join a room and your watch will automatically start tracking your heart rate!</p>
      </div>
    </div>
    <div className="flex flex-col items-center md:items-start">
      <Image src={Watch} alt="Watch" width={200} height={200} />
      <Image src={ClimaxiPhone} alt="Climax iPhone" width={200} height={200} className="mt-4" />
    </div>
  </div>
);
};


export default Page