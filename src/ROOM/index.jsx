import {
  ChevronDown,
  ChevronLeft,
  Mic,
  MicOff,
  ShieldCheck,
  SwitchCamera,
  Video,
  Volume2,
  Phone,
  EllipsisVertical,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ToastAlert from "../TOAST";
import axios from "axios";
import { AllContext } from "../CONTEXT";
import { useNavigate, useParams } from "react-router-dom";

const Room = () => {
  const videoRef = useRef(null);
  const remoteRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [rearCam, setRearCam] = useState(false);
  const [mute, setMute] = useState(false);
  const [roomPayload, setRoomPayload] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = AllContext();
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Initialize local stream once on component mount
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        const constraints = { video: true, audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        console.log("Local stream initialized:", stream.getTracks());
      } catch (err) {
        ToastAlert.error("Error accessing Camera and Microphone: " + err.message);
      }
    };
    initLocalStream();
  }, []);

  // Handle camera switch
  useEffect(() => {
    const switchCamera = async () => {
      try {
        // Stop existing tracks to avoid conflicts
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        const constraints = {
          video: rearCam
            ? { facingMode: { exact: "environment" } }
            : { facingMode: "user" },
          audio: true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Update tracks in peer connection
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          senders.forEach((sender) => peerConnectionRef.current.removeTrack(sender));
          stream.getTracks().forEach((track) => {
            peerConnectionRef.current.addTrack(track, stream);
          });
        }
        console.log("Camera switched, new tracks:", stream.getTracks());
      } catch (err) {
        ToastAlert.error("Error switching camera: " + err.message);
      }
    };
    switchCamera();
  }, [rearCam]);

  // Handle mute/unmute
  const handleMute = () => {
    setMute((prev) => !prev);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !mute;
        console.log("Audio track enabled:", audioTrack.enabled);
      }
    }
  };

  // Handle sharing room link
  const handleShare = (platform) => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    let shareLink = "";
    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=Join%20my%20room:%20${encodeURIComponent(roomUrl)}`;
        break;
      case "sms":
        shareLink = `sms:?body=Join%20my%20room:%20${encodeURIComponent(roomUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roomUrl)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=Join%20my%20room:%20${encodeURIComponent(roomUrl)}`;
        break;
      case "clipboard":
        navigator.clipboard.writeText(roomUrl);
        ToastAlert.info("Link copied to clipboard");
        return;
      default:
        return;
    }
    window.open(shareLink, "_blank");
    setIsOpen(false);
  };

  // Fetch room details
  useEffect(() => {
    axios
      .get(`https://syncall-server-1.onrender.com/api/v1/user/get-room/${roomId}`)
      .then((res) => {
        console.log("Room details:", res.data.data);
        setRoomPayload(res.data.data);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 404) {
            ToastAlert.error("Room does not exist");
            navigate("/");
          } else if (err.response.status === 400) {
            ToastAlert.error("Room ID is needed");
            navigate("/");
          } else {
            ToastAlert.error("Something went wrong. Try again later");
          }
        }
      });
  }, [roomId, navigate]);

  // Create peer connection
  const createPeerConnection = async () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Use a valid TURN server for testing (replace with your own in production)
        {
          urls: "turn:numb.viagenie.ca",
          username: "your-username", // Replace with valid credentials
          credential: "your-password",
        },
      ],
    });
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
        console.log("Added local track:", track);
      });
    } else {
      console.error("No local stream available");
    }

    // Set up remote stream
    const remoteStream = new MediaStream();
    if (remoteRef.current) {
      remoteRef.current.srcObject = remoteStream;
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log("Received remote tracks:", event.streams[0].getTracks());
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      if (remoteRef.current) {
        remoteRef.current.srcObject = remoteStream; // Reassign to ensure update
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    // Monitor connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === "failed") {
        console.error("ICE connection failed");
      }
    };

    return peerConnection;
  };

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    socket.emit("join-room", { roomId });
    console.log("Emitted join-room for room:", roomId);

    socket.on("user-joined", async ({ initiator }) => {
      console.log("User joined, initiator:", initiator);
      await createPeerConnection();
      if (initiator) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit("offer", { offer, roomId });
        console.log("Sent offer:", offer);
      }
    });

    socket.on("offer", async ({ offer }) => {
      console.log("Received offer:", offer);
      await createPeerConnection();
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, roomId });
      console.log("Sent answer:", answer);
    });

    socket.on("answer", async ({ answer }) => {
      console.log("Received answer:", answer);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("Added ICE candidate:", candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket, roomId]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <nav className="flex items-center justify-between px-4 md:px-4 h-20 md:h-40 bg-gradient-to-r from-slate-700 lg:hidden via-black to-gray-900">
        <div className="flex items-center gap-5 md:gap-7">
          <ChevronLeft size={30} className="text-gray-200 md:h-14 md:w-14" />
          <SwitchCamera
            onClick={() => setRearCam((prev) => !prev)}
            size={30}
            className="text-gray-300 md:h-14 md:w-14"
          />
          <Volume2 size={25} className="text-gray-300 md:h-14 md:w-14" />
        </div>
        <div className="flex items-center justify-center gap-1 pr-9">
          <ShieldCheck size={20} fill="green" className="md:h-14 md:w-14" />
          <span className="text-gray-200 font-medium text-lg md:text-4xl">Syncall</span>
          <ChevronDown size={20} className="text-gray-300 md:h-14 md:w-14" />
        </div>
        <div className="bg-red-500 h-5 w-5 rounded md:h-8 md:w-8"></div>
      </nav>
      <main className="flex flex-grow w-full overflow-hidden relative">
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute w-1/3 h-1/3 top-4 right-4 z-20">
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        {roomPayload?.noParticipants === 0 && (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-0 flex px-4 rounded-4xl gap-2 ml-2 whitespace-nowrap text-base font-normal bg-gray-300 top-[60%] h-14 w-[90%] md:hidden items-center justify-start z-20"
          >
            <Users fill="black" className="text-gray-700 h-8 w-8 md:h-8 md:w-8" />
            <p>Invite your contacts to join this meeting</p>
          </div>
        )}
        {isOpen && (
          <div className="absolute bottom-60 backdrop-blur-xl left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg md:hidden shadow-lg z-30">
            <h3 className="text-lg font-semibold mb-2">Share Room</h3>
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex gap-2 items-center w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <img className="w-5 h-5" src="/whatsapp.png" alt="whatsapp" />
              Whatsapp
            </button>
            <button
              onClick={() => handleShare("sms")}
              className="flex gap-2 items-center w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <img className="w-5 h-5" src="/sms.png" alt="sms" />
              SMS
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="flex gap-2 items-center w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <img className="w-5 h-5" src="/facebook.png" alt="facebook" />
              Facebook
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="flex gap-2 items-center w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <img className="w-5 h-5" src="/twitter.png" alt="twitter" />X
            </button>
            <button
              onClick={() => handleShare("clipboard")}
              className="flex items-center gap-2 w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <img className="w-5 h-5" src="/copy.png" alt="clipboard" />
              Copy Link
            </button>
          </div>
        )}
      </main>
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center justify-center bg-[#1A1C1E]/80 backdrop-blur-md text-white px-8 py-3 rounded-2xl space-x-6 shadow-lg">
        <button
          onClick={handleMute}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition duration-300"
        >
          {mute ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition duration-300">
          <Video size={24} />
        </button>
        <button>
          <EllipsisVertical />
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition duration-300">
          <Phone className="transform rotate-135" />
        </button>
      </footer>
    </div>
  );
};

export default Room;