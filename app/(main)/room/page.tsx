"use client"
import React, { useEffect, useRef, useState} from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import ReactPlayer from 'react-player';
import { useUser, useFirestore } from 'reactfire';

const Page = () => {
    const [timestamp, setTimestamp] = useState<number|null>(null);
    const { data: user } = useUser();
    const firestore = useFirestore();
    const playerRef = useRef<ReactPlayer>(null);
    // if(user){
    const userRef = doc(firestore, 'rooms', user.uid);

    useEffect(() => {
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists() && playerRef.current) {
                const firestoreTimestamp = docSnap.data().timestamp;
                const playerCurrentTime = playerRef.current.getCurrentTime();

                if (firestoreTimestamp !== playerCurrentTime) {
                    playerRef.current.seekTo(firestoreTimestamp, 'seconds');
                    updateDoc(userRef, {timestamp}).then(() => {
                        setTimestamp(timestamp);
                    })
                }
            }
        });

        return () => unsubscribe();
    }, [userRef]);
    // }

    return (
        <div>
            <ReactPlayer ref={playerRef} url='https://www.youtube.com/watch?v=LXb3EKWsInQ' />
        </div>
    );
};

export default Page;
