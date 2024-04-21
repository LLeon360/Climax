"use client";
import React, { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import ReactPlayer from "react-player";
import { useFirestore, useUser } from "reactfire";
import { socket } from "../../../socket";
import Peer from "simple-peer";
import { CopyToClipboard } from "react-copy-to-clipboard";
import HeartRate from "@/components/heartrate";

import { fetchGemini } from "./fetchGemini";

interface User {
  name: string;
  photoURL: string;
}

export default function Page({ params }: { params: { roomcode: string } }) {
  const { data: user } = useUser();
  const firestore = useFirestore();
  const playerRef = useRef<ReactPlayer>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isDone, setIsDone] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(0);
  const roomRef = doc(firestore, "rooms", params.roomcode);
  const [stream, setStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [peers, setPeers] = useState<
    { socketId: string; peer: Peer.Instance; stream?: MediaStream }[]
  >([]);
  const peersRef = useRef<
    { socketId: string; peer: Peer.Instance; stream?: MediaStream }[]
  >([]);
  const userVideo = useRef();

  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    if (socket.connected) {
      console.log("Connected to server");
      onConnect();
    } else {
      console.log("Not connected to server");
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          if (userVideo.current) {
            userVideo.current.srcObject = currentStream;
          }
          console.log("about to emit");
          socket.emit("joinRoom", {
            roomcode: params.roomcode,
            userId: user?.uid,
          });
        });

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const createPeer = (socketId, initiator, stream) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("signal", {
        to: socketId,
        signalData: data,
        from: socket.id,
      });
    });

    peer.on("stream", (currentStream) => {
      console.log("got stream", currentStream, socketId);
      // Update the peers state to include the new stream for the peer
      setPeers((prevPeers) =>
        prevPeers.map((p) => {
          if (p.socketId === socketId) {
            return { ...p, stream: currentStream };
          }
          return p;
        })
      );
    });

    return peer;
  };

  useEffect(() => {
    socket.on("userJoined", ({ socketId, userId }) => {
      console.log("got user joined", userId, "with socketId", socketId);
      const peer = createPeer(socketId, true, stream);
      const newPeerObject = {
        socketId,
        peer,
        userId,
      };
      setPeers((prevPeers) => [...prevPeers, newPeerObject]);
    });

    socket.on("receiving signal", ({ signalData, from }) => {
      console.log("got signal", signalData, from);
      const item = peersRef.current.find((p) => p.socketId === from);
      if (item) {
        item.peer.signal(signalData);
      } else {
        const peer = createPeer(from, false, stream);
        peer.signal(signalData);
        setPeers((prevPeers) => [...prevPeers, { socketId: from, peer }]);
      }
    });

    socket.on("userLeft", (userId) => {
      const updatedPeers = peersRef.current.filter((p) => p.userId !== userId);
      setPeers(updatedPeers);
      const peerObj = peersRef.current.find((p) => p.userId === userId);
      if (peerObj) {
        peerObj.peer.destroy();
      }
    });

    return () => {
      socket.off("userJoined");
      socket.off("receiving signal");
      socket.off("userLeft");
    };
  }, [socket, stream]);

  // Sync room state with Firestore
  useEffect(() => {
    let unsubscribeUsers = () => {};

    const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoUrl(data.videoUrl);
        setPlaying(data.isPlaying);
        setIsDone(data.isDone || 0);
        setTimestamp(data.timestamp);
        const userIds = data.users; // assuming the field that contains user IDs is named 'users'

        // Clear the current users data
        setUsers([]);

        // Subscribe to each user's document

        unsubscribeUsers = userIds.map((userId: string) => {
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
      unsubscribeUsers();
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

  const handleEndSession = async () => {
    await updateDoc(roomRef, {
      isDone: 2,
    });
  };

  // Seek to the current timestamp whenever it changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp, "seconds");
    }
  }, [timestamp]);

  return (
    <div className="flex flex-row items-start justify-start pt-4 -mb-[200px] pl-[150px] pr-[50px]">
      <div className="flex flex-col w-3/4">
        <p className="text-lg font-normal">
          Room Code:
          <span className="font-semibold"> {params.roomcode}</span>
          <CopyToClipboard text={params.roomcode}>
            <button className="ml-2 text-blue-500 hover:text-blue-700 font-normal">
              Copy
            </button>
          </CopyToClipboard>
        </p>

        <div className="w-full h-[900px] mt-2">
          {/* only render react player if isDone is not 2 */}
          {isDone !== 2 && (
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={playing}
              onPlay={() => updateDoc(roomRef, { isPlaying: true })}
              onPause={() => updateDoc(roomRef, { isPlaying: false })}
              onSeek={(e) => updateDoc(roomRef, { timestamp: e })}
              controls={true}
              className="react-player rounded"
              width="100%"
              height="80%"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col w-1/4 ml-[50px]">
        <p className="-mb-[30px] font-semibold">Users</p>
        <div className="flex flex-col mt-10">
          {users.map((user, index) => (
            <div key={index} className="flex items-center mb-2">
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="ml-2 text-sm font-medium">{user.name}</p>
            </div>
          ))}
        </div>
        <button
          onClick={handlePlayPause}
          className={`py-2 px-4 rounded-lg font-medium text-white mt-4 self-start ${
            playing
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {playing ? "Pause" : "Play"}
        </button>
        {/* only render end session if isDone is not 2 */}
        {isDone !== 2 && (
          <button
            onClick={handleEndSession}
            className={
              "py-2 px-4 rounded-lg font-medium text-white mt-4 self-start bg-red-600"
            }
          >
            End Session
          </button>
        )}
      </div>
      <p>{params.roomcode}</p>
      <video ref={userVideo} muted autoPlay playsInline />

      {peers.map((peer, index) =>
        peer.stream ? (
          <PeerVideo key={index} stream={peer.stream} />
        ) : (
          <div key={index}>
            <h1 className="text-3xl font-bold">{`${peer.socketId} has no stream`}</h1>
          </div>
        )
      )}
      {isDone === 2 && <HeartRate />}
    </div>
  );
}

function PeerVideo({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }

    return () => {
      if (ref.current) {
        ref.current.srcObject = null;
      }
    };
  }, [stream]);

  return <video playsInline autoPlay ref={ref} />;
}
