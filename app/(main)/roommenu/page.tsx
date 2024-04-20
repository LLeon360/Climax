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

export default function RoomMenuPage() {
	const { data: user } = useUser();
	const firestore = useFirestore();

	const router = useRouter();

	async function joinRoom(roomId: string) {
		console.log("Room ID: ", roomId);
		const roomRef = doc(firestore, "rooms", roomId);
		const docSnap = await getDoc(roomRef);

		if (docSnap.exists()) {
			//if exists swap into the room

      for(let i = 0; i < docSnap.data().users.length; i++) {
        if(docSnap.data().users[i] === user.uid) {
          router.push(`/roommenu/${roomId}`);
          return;
        }
      }
      docSnap.data().users.push(user.uid);
			router.push(`/roommenu/${roomId}`);
		}
	}

	async function createRoom(videoUrl: string) {
		// Create a new room object in Firestore with the video URL
		const newRoomRef = await addDoc(collection(firestore, "rooms"), {
			videoUrl: videoUrl,
			users: [user.uid],
			timestamp: 0,
		});

		// Navigate to the new room
		router.push(`/roommenu/${newRoomRef.id}`);
	}

	return (
		<div className="grow flex flex-col items-center justify-center">
			<section className="w-[32rem] space-y-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
					Select Room
				</h1>
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
							placeholder="Enter Video URL"
						/>
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
						>
							Create Room
						</button>
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
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
						>
							Join Room
						</button>
					</form>
				</div>
			</section>
		</div>
	);
}
