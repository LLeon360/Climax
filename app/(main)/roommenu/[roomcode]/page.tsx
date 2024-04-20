"use client";
import React, { useEffect, useRef, useState} from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import ReactPlayer from 'react-player';
import { useUser, useFirestore } from 'reactfire';

export default function Page({ params }: { params: { roomcode: string } }) {
	const [timestamp, setTimestamp] = useState<number|null>(null);
	const { data: user } = useUser();
	const firestore = useFirestore();
	const playerRef = useRef<ReactPlayer>(null);

	//get the current room
	const roomRef = doc(firestore, 'rooms', params.roomcode);

	const [isHost, setIsHost] = useState(false);
	const [videoUrl, setVideoUrl] = useState('');

	useEffect(() => {
		const unsubscribe = onSnapshot(roomRef, (docSnap) => {
			if (docSnap.exists() && playerRef.current) {
				const firestoreTimestamp = docSnap.data().timestamp;
				const playerCurrentTime = playerRef.current.getCurrentTime();
				
				if (Math.abs(firestoreTimestamp - playerCurrentTime) > 1) {
					playerRef.current.seekTo(firestoreTimestamp, 'seconds');
					updateDoc(roomRef, {timestamp}).then(() => {
						setTimestamp(timestamp);
					})
				}

				setIsHost(docSnap.data().host === user.uid);
				setVideoUrl(docSnap.data().videoUrl);
			}
		});

		return () => unsubscribe();
	}, [roomRef]);
	// }

	return (
		<div>
			<ReactPlayer ref={playerRef} url={videoUrl} />
		</div>
	);
}
