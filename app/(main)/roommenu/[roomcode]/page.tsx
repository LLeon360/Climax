"use client";
import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../../socket";
import Peer from "simple-peer";

export default function Page({ params }: { params: { roomcode: string } }) {
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

	return (
		<div className="flex flex-row items-start justify-start pt-4 -mb-[200px] pl-[150px] pr-[50px]">
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
