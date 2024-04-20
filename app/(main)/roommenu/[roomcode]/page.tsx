"use client";
import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import ReactPlayer from "react-player";
import { useFirestore } from "reactfire";

interface User {
  name: string;
  photoURL: string;
}

export default function Page({ params }: { params: { roomcode: string } }) {
  const firestore = useFirestore();
  const [users, setUsers] = useState<User[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const roomRef = doc(firestore, "rooms", params.roomcode);
    const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setVideoUrl(docSnap.data().videoUrl);
        const userIds = docSnap.data().users; // assuming the field that contains user IDs is named 'users'

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

          // Clean up this user's subscription when the component unmounts or the userIds change
          return unsubscribeUser;
        });
        console.log(users);
      }
    });

    // Clean up the room subscription when the component unmounts or the roomcode changes
    return () => {
      unsubscribeRoom();
    };
  }, [params.roomcode, firestore]);

  return (
    <div>
      <ReactPlayer url={videoUrl} />
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
