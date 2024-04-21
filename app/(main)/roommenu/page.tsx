"use client";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useUser, useFirestore, useFirestoreDocData } from "reactfire";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RoomMenuPage() {
  const { data: user } = useUser();
  const firestore = useFirestore();

  const router = useRouter();
  const setOrUpdateRoom = async (roomId: string) => {
    const userRef = doc(firestore, "accounts", user.uid);
    const docSnap = await getDoc(userRef);
    console.log("Trying Room ID: ", roomId);
    if (docSnap.exists()) {
      console.log("User doc exists");
      //check if roomId exists
      if (docSnap.data().roomId) {
        console.log("Updating Room ID: ", roomId);
        //if exists, update it
        await updateDoc(userRef, { roomId: roomId });
      } else {
        //if not, create it
        console.log("Setting Room ID: ", roomId);
        await setDoc(
          doc(firestore, "accounts", user.uid),
          { roomId: roomId },
          { merge: true }
        );
      }
    }
  };

  async function joinRoom(roomId: string) {
    const roomRef = doc(firestore, "rooms", roomId);
    const docSnap = await getDoc(roomRef);

    if (docSnap.exists()) {
      //if exists swap into the room

      for (let i = 0; i < docSnap.data().users.length; i++) {
        if (docSnap.data().users[i] === user.uid) {
          router.push(`/roommenu/${roomId}`);
          return;
        }
      }
      console.log(docSnap.data().users);
      let users = docSnap.data().users;
      users.push(user.uid);
      updateDoc(roomRef, { users: users });

      await setOrUpdateRoom(roomId);
    }
  }

  async function createRoom(videoUrl: string) {
    // Create a new room object in Firestore with the video URL
    const newRoomRef = await addDoc(collection(firestore, "rooms"), {
      videoUrl: videoUrl,
      users: [user.uid],
      name: `${user.displayName}'s Room`
      timestamp: 0,
      isPlaying: false,
      stage: 1,
    });

    await setOrUpdateRoom(newRoomRef.id);

    // Navigate to the new room
    router.push(`/roommenu/${newRoomRef.id}`);
  }

  return (
    <div className="grow flex flex-col items-center justify-center">
      <section className="w-[32rem] space-y-4">
        <div className="flex flex-row">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Select Room
          </h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-10 w-10 ml-2.5 mt-1.8 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          {"     "}
        </div>
        {/* Create a button for create room and join room */}
        <div className="flex flex-col space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createRoom(
                (e.currentTarget.elements[0] as HTMLInputElement).value
              );
            }}
            className="flex flex-col"
          >
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Enter Youtube Video URL"
            />
            <Button
              type="submit"
              className="hover:bg-blue-700 font-bold py-2 px-4 rounded mt-2 w-full"
            >
              Create Room
            </Button>
          </form>

          {/* Input form with a room id and a join room button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinRoom((e.currentTarget.elements[0] as HTMLInputElement).value);
            }}
            className="flex flex-col"
          >
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Enter Room ID"
            />
            <Button
              type="submit"
              className="hover:bg-blue-700 font-bold py-2 px-4 rounded mt-2 w-full"
            >
              Join Room
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
