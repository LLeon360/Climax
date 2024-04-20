"use client";
import React, { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import ReactPlayer from "react-player";
import { useFirestore } from "reactfire";

interface User {
  name: string;
  photoURL: string;
}

export default function Page({ params }: { params: { roomcode: string } }) {
  const firestore = useFirestore();
  const playerRef = useRef<ReactPlayer>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(0);
  const roomRef = doc(firestore, "rooms", params.roomcode);

  // Sync room state with Firestore
  useEffect(() => {
    const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoUrl(data.videoUrl);
        setPlaying(data.isPlaying);
        setTimestamp(data.timestamp);
        const userIds = data.users; // assuming the field that contains user IDs is named 'users'

        // Clear the current users data
        setUsers([]);

        // Subscribe to each user's document
        userIds.forEach((userId: string) => {
          const userRef = doc(firestore, "accounts", userId);
          const unsubscribeUser = onSnapshot(userRef, (userDoc) => {
            if (userDoc.exists()) {
              const userData: User = {
                name: userDoc.data().name,
                photoURL: userDoc.data().photoURL,
              };
              // Update the state with the new user's data
              setUsers((prevUsers) => {
                const newUsers = prevUsers.filter(
                  (u) => u.name !== userData.name
                );
                return [...newUsers, userData];
              });
            }
          });
          return unsubscribeUser;
        });
      }
    });
    return () => {
      unsubscribeRoom();
    };
  }, [firestore, params.roomcode]);

  // Update Firestore when the video is played or paused
  const handlePlayPause = () => {
    updateDoc(roomRef, {
      isPlaying: !playing,
      timestamp: playerRef.current?.getCurrentTime() || 0,
    });
  };

  // Seek to the current timestamp whenever it changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp, "seconds");
    }
  }, [timestamp]);

  return (
    <div>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        onPlay={() => updateDoc(roomRef, { isPlaying: true })}
        onPause={() => updateDoc(roomRef, { isPlaying: false })}
        onSeek={(e) => updateDoc(roomRef, { timestamp: e })}
        controls={true}
      />
      <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
      <div>
        {users.map((user, index) => (
          <div key={index}>
            <img
              src={user.photoURL}
              alt={user.name}
              style={{ width: "50px", height: "50px" }}
            />
            <p>{user.name}</p>
          </div>
        ))}
      </div>
      <p>{params.roomcode}</p>
    </div>
  );
}
