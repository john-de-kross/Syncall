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
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
const Room = () => {
  const videoRef = useRef(null);
  const remoteRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [rearCam, setRearCam] = useState(false);
  const [mute, setMute] = useState(false);
  const [roomPayload, setRoomPayload] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { username, setUsername, socket } = AllContext();
  const { roomId } = useParams();
  const roomUrl = `${window.location.origin}/room/${roomId}`;
  const navigate = useNavigate();
  const [isUserRegistered, setIsUserRegistered] = useState(true);

  useEffect(() => {
    const contraints = { video: true, audio: true };

    navigator.mediaDevices
      .getUserMedia(contraints)
      .then((stream) => {
        if (videoRef.current) {
          localStreamRef.current = stream;
          videoRef.current.srcObject = stream;
          socket.emit("join-room", { roomId, username });
        }
      })
      .catch((err) => {
        ToastAlert.error(
          "Error accessing Camera and Microphone: " + err.message
        );
      });
  }, []);

  const handleCamChange = () => setRearCam((prev) => !prev);

  const handleMute = () => {
    setMute((prev) => !prev);
    const contraints = { video: true, audio: true };
    navigator.mediaDevices
      .getUserMedia(contraints)
      .then((stream) => {
        if (videoRef.current) {
          mute
            ? (stream.getAudioTracks()[0].enabled = false)
            : (stream.getAudioTracks()[0].enabled = true);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleShare = (platform) => {
    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=Join%20my%20room:%20${encodeURIComponent(
          roomUrl
        )}`;
        break;
      case "sms":
        shareLink = `sms:?body=Join%20my%20room:%20${encodeURIComponent(
          roomUrl
        )}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          roomUrl
        )}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=Join%20my%20room:%20${encodeURIComponent(
          roomUrl
        )}`;
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

  useEffect(() => {
    const constraints = {
      video: rearCam
        ? { facingMode: { exact: "environment" } }
        : { facingMode: "user" },
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        ToastAlert.error(
          "Error occurred while trying to switch the camera: " + err.message
        );
      });
  }, [rearCam]);

  useEffect(() => {
    axios
      .get(`https://syncall-server.onrender.com/api/v1/user/get-room/${roomId}`)
      .then((res) => {
        console.log(res);
        setRoomPayload(res.data.data);
        const isOwner = res.data.data.host === username;
        const isGuest = res.data.data.guest === username;
        if (!isOwner && !isGuest) {
          ToastAlert.error("Enter your name to join the room");
          setIsUserRegistered(false);
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.status === 404) {
            ToastAlert.error("Room does not exist");
            navigate("/");
          } else if (err.status === 400) {
            ToastAlert.error("Room ID is needed");
            navigate("/");
          } else {
            ToastAlert.error("Something went wrong.Try again later");
          }
        }
      });
  }, []);

  const createPeerConnection = async () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: 'turn:your-turn-server', username: 'username', credential: 'password' },
       
      ],
    });

    peerConnectionRef.current = peerConnection;

    //Add local stram tracks to the peer connection

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    //set the remote video
    const remoteStream = new MediaStream();
    remoteRef.current.srcObject = remoteStream;

    //on receiving track add to screeen

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    // handle ICE candidates and send signal to the server

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };
  };

  // useEffect(() => {
  //   if (!socket) return;

  //   const handleRoomJoined = (data) => {
  //     console.log("Room joined: ", data);
  //     setUpPeerConnection();
  //   };

  //   const handleIceCandidate = (data) => {
  //     if (peerConnectionRef.current && data.candidate) {
  //       peerConnectionRef.current
  //         .addIceCandidate(new RTCIceCandidate(data.candidate))
  //         .then(() => {
  //           console.log("ICE candidate added successfully");
  //         })
  //         .catch((error) => {
  //           console.error("Error adding ICE candidate:", error);
  //         });
  //     }
  //   };
  //   socket.on("room-joined", handleRoomJoined);
  //   socket.on("ice-candidate", handleIceCandidate);

  //   return () => {
  //     socket.off("room-joined", handleRoomJoined);
  //     socket.off("ice-candidate", handleIceCandidate);

  //   }
  // }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", { roomId });

    socket.on("user-joined", async ({ initiator }) => {
      console.log("A user has joined the room");
      await createPeerConnection();

      if (initiator) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        socket.emit("offer", {
          offer,
          roomId,
        });
      }
    });
    socket.on("offer", async ({ offer }) => {
      console.log("Received offer from another user");
      await createPeerConnection();
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", {
        answer,
        roomId,
      });
    });
    socket.on("answer", async ({ answer }) => {
      console.log("Received answer from another user");
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });
  }, [socket, roomId]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!username) {
      return ToastAlert.error("Please enter your name to join room");
    }
    try {
      const response = await axios.post(
        "https://syncall-server.onrender.com/api/v1/user/join-room",
        { roomId, username }
      );
      navigate(`/room/${roomId}`);
      console.log(response.data);
      ToastAlert.success(`Successfully joined the room: ${roomId}`);
      setIsUserRegistered(true);
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 404) {
          ToastAlert.error("Room not found. Please check the Room ID.");
        } else if (err.response.status === 400) {
          ToastAlert.error("Invalid Room ID. Please enter a valid Room ID.");
        } else if (
          err.response.data.message.startsWith("E11000 duplicate key error")
        ) {
          ToastAlert.error(
            "Username already exists. Please choose a different username."
          );
        } else if (
          err.response.data.message.startsWith(
            "RoomCreator validation failed: username: Path `username` (`To`) is shorter than the minimum allowed length"
          )
        ) {
          ToastAlert.error("Username must be at least 3 characters long.");
        } else {
          ToastAlert.error("An error occurred while joining the room");
        }
      } else {
        ToastAlert.error("Network error. Please try again later.");
      }
    }
  };

  useEffect(() => {
    console.log(roomPayload);
  }, [roomPayload]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <nav className="flex items-center justify-between px-4 md:px-4 h-20 md:h-40 bg-gradient-to-r from-slate-700 lg:hidden via-black to-gray-900">
        <div className="flex items-center gap-5 md:gap-7">
          <ChevronLeft size={30} className="text-gray-200 md:h-14 md:w-14" />
          <SwitchCamera
            onClick={handleCamChange}
            size={30}
            className="text-gray-300 md:h-14 md:w-14"
          />
          <Volume2 size={25} className="text-gray-300 md:h-14 md:w-14" />
        </div>

        <div className="flex items-center justify-center gap-1 pr-9">
          <ShieldCheck size={20} fill="green" className="md:h-14 md:w-14" />
          <span className="text-gray-200 font-medium text-lg md:text-4xl">
            Syncall
          </span>
          <ChevronDown size={20} className="text-gray-300 md:h-14 md:w-14" />
        </div>
        <div className="bg-red-500 h-5 w-5 rounded md:h-8 md:w-8"></div>
      </nav>
      <main className="flex flex-grow video-contain w-full overflow-hidden relative">
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            autoPlay
            muted={mute}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute h-46 w-40 inset-0 z-10 left-50 top-30">
          <video
            ref={remoteRef}
            autoPlay
            style={{ transform: "scaleX(-1)" }}
            className="w-full h-full object-cover"
          />
        </div>
        {roomPayload && roomPayload.noParticipants === 0 && (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-0 flex px-4 rounded-4xl gap-2 ml-2 whitespace-nowrap text-base font-normal bg-gray-300 top-[60%] h-14 w-[90%] md:hidden items-center justify-start z-20"
          >
            <Users
              fill="black"
              className="text-gray-700 h-8 w-8 md:h-8 md:w-8"
            />
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
        {!isUserRegistered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-4">Join Room</h2>
              <p className="text-gray-700 mb-4">
                Please enter your name to join the room.
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full mb-4"
                placeholder="Enter your name"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center justify-center bg-[#1A1C1E]/80 backdrop-blur-md text-white px-8 py-3 rounded-2xl space-x-6 shadow-lg">
        {/* Mic Button */}
        <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition duration-300">
          {mute ? (
            <MicOff onClick={handleMute} size={24} />
          ) : (
            <Mic onClick={handleMute} size={24} />
          )}
        </button>

        {/* Video Button */}
        <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition duration-300">
          <Video size={24} />
        </button>

        <button>
          <EllipsisVertical />
        </button>

        {/* End Call Button */}
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition duration-300">
          <Phone className="transform rotate-135" />
        </button>
      </footer>
    </div>
  );
};
export default Room;
