import React, { use, useEffect, useState } from "react";
import { AppLayout, Content } from "@/components/layout/app";
import { NextPageWithLayout } from "../../_app";
import { useRouter } from "next/router";
import { useViewScrollController } from "ui/hooks/use-bottom-scroll";
import { Navbar, } from "@/components/layout/Navbar";
import { useRef } from "react";
import { Button } from "ui/components/button";
import Webcam from 'react-webcam';
import { start } from "repl";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useChannel } from "@ably-labs/react-hooks";
import Peer from "simple-peer";
import Ably, { Realtime } from 'ably';
import { connect } from "http2";
import { join } from "path";
import { members } from "db/schema";
import { object, set } from "zod";

const debug = require('debug')('screen-share:app');

const enableTrickle = true;

const VideoChat: NextPageWithLayout = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [peers, setPeers] = useState<{ [key: string]: Peer }>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMemberChecked, setIsMemberChecked] = useState(false);
  const [signal, setSignal] = useState<any>(null);
  const session = useSession();
  const router = useRouter();
  const group = router.query.group as string;
  const [ablyRealtime, setAblyRealtime] = useState(new Realtime({ key: process.env.ABLY_API_KEY, clientId: session?.data?.user?.id, echoMessages: false }));
  const channel = ablyRealtime.channels.get('rtc-signal'+group);
  const ablyRef = useRef();
  const webcamRef = useRef(null);
  const signalRef = useRef(null);
  const peerRef = useRef<{ [key: string]: Peer }>({});
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user'
  };

  useEffect(() => {

    
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("getting stream: " + JSON.stringify(mediaStream));
        setStream(mediaStream);
        channel.presence.get({}, (err: any, members: any) => {
        if (err) {
          console.log("error getting members", err);
        } else {
          console.log("members", members);
          setMembers(members);
          setIsMemberChecked(true);
          channel.presence.enter({}, (err: any) => {
          if (err) {
            console.log("error entering channel", err);
          } else {
            console.log("entered channel");
          }

          });
        }
      });

      } catch (err) {
        debug('getMedia error', err);
      }
    };
    getMedia();
  }, []);

  useEffect(() => {
    console.log('stream', stream);
    console.log('isMemberchecked', isMemberChecked)
    if (stream && isMemberChecked) {
      console.log('re-render')
      channel.presence.subscribe("enter", (member) => {
        const peerId = member.clientId
        if (peerId === session?.data?.user?.id) {
          if (!peerRef.current[peerId] && members.length == 0) {
            console.log("create on enter")
            createPeer(peerId, true);
          } else if (members.length > 0) {
            console.log("send message to waiting")
            channel.publish('waiting', { from: session?.data?.user?.id })
          }
        }
      });

      channel.presence.subscribe('leave', (member) => {
        console.log("leave message", member);
        const peerId = member.clientId;
        destroyPeer(peerId);
      });

      channel.subscribe('signal', (message) => {
        console.log("signal message", message);
        if (message.data.from !== session?.data?.user?.id)
          console.log('signal subscribe', message);

        const peerId = message.data.to;
        console.log('signal subscribe peer ID', peerId);
        if (!peerRef.current[peerId] && peerId === session?.data?.user?.id) {
          console.log("create on signal")
          createPeer(message.data.from, false);
        }
        console.log('current peer', peerRef.current);
        console.log("signal subscribe peer", peerRef.current[peerId]);
        // if (message.data.to === session?.data?.user?.id) {
        signalPeer(peerRef.current[peerId], message.data.signal);
        // }
      });

      channel.subscribe("waiting", (message) => {
        if (message.data.from !== session?.data?.user?.id) {
          console.log("waiting message", message)
          const msg = { signal: signalRef.current, to: message.data.from, from: session?.data?.user?.id };
          channel.publish('signal', msg);
        }
      });
    }

  }, [isMemberChecked]);

  const createPeer = (newPeerId: string, initiator: boolean) => {
    const peer = new Peer({ initiator, trickle: false, stream });;
    const peerId = session?.data?.user?.id as string;
    peer.on('signal', async (signal: any) => {
      // console.log("Signaling state during signal event: ", peer.signalingState);
      // if (peer.signalingState === 'have-remote-offer' || peer.signalingState === 'stable') {
      console.log('sending signal:' + JSON.stringify(signal));
      const msg = { signal, to: newPeerId, from: session?.data?.user?.id };
      signalRef.current = signal;
      if (signal.type === 'answer') {
        console.log('answer is published');
        channel.publish('signal', msg);
      }
    });


    // Event handler for receiving a stream from the remote peer
    peer.on('stream', (remoteStream: any) => {
      console.log("stream remote:" + remoteStream);
      if (peer.video) {
        peer.video.srcObject = remoteStream;
        peer.video.play();
      }
      // Here, you can set the received remoteStream to a video element's srcObject
      // For example:
      // document.getElementById('remoteVideoElementId').srcObject = remoteStream;
    });

    // Event handler for a successful connection
    peer.on('connect', () => {
      // This will be called when the peer connection is established
      console.log('Peer connection established', peerId);
      console.log("Signaling state on connection: ", peer.signalingState);
    });

    // Event handler for receiving data
    peer.on('data', (data: any) => {
      // Here you can process the received data
      console.log('Received data:', data);
    });

    peer.on('error', (err: any) => {
      console.log("peer error", err);
    });
    // ... other event handlers like on stream, on connect, on data
    peerRef.current = {
      [peerId]: peer
    }
    setPeers((prevPeers) => ({ ...prevPeers, [peerId]: peer }));
  };

  const destroyPeer = (peerId: string) => {
    if (peers[peerId]) {
      peers[peerId].destroy();
    }
    setPeers((prevPeers) => {
      const newPeers = { ...prevPeers };
      delete newPeers[peerId];
      return newPeers;
    });
  };

  const signalPeer = (peer: Peer, signalData: any) => {
    try {
      console.log('signal peer')
      peer.signal(signalData);
    } catch (e) {
      debug('signal error', e);
    }
  };

  const renderPeers = () => {
    if (Object.entries(peers).length === 0) 
      return
      <div className="flex flex-col items-center justify-center my-auto">
        <h2 className="text-4xl font-bold">Connecting to peers...</h2>;
      </div> 
    return Object.entries(peers).map(([peerId, peer]) => (
      <div key={peerId}>
        <video
          autoPlay
          ref={(video) => (peer.video = video)}
          style={{
            position: "relative",
            borderRadius: "10px",
            width: "100%",
            height: "100%",

          }} />
      </div>
    ));
  };

  const endCall = () => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
    destroyPeer(session?.data?.user?.id as string);
    setStream(null); // Use setStream to update the state
    setMembers([]);
    setIsMemberChecked(false);
    setPeers({});
    console.log("stream after setting to null: " + JSON.stringify(stream));
    channel.presence.leave();
    router.push("/home");
  } else {
    console.log("stream is null");
  }
  };

  return (
    <div>
      {renderPeers()}
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={videoConstraints}
        style={{
          position: "absolute",
          bottom: "5%",
          borderRadius: "20px",
          right: 0,

          width: "20%",
          height: "20%",
        }}
      />
      <div className="flex flex-col items-center justify-center my-auto" style={{
        marginTop: "1%",
      }}>
        <Button color="danger" onClick={endCall}>End Call</Button>
      </div>
    </div>
  );
};

VideoChat.useLayout = (children) => {
  const router = useRouter();
  const conroller = useViewScrollController();
  return (
    <AppLayout>
      <Navbar
        breadcrumb={[
          {
            text: "Video",
            href: "/",
          }
        ]}
      >
      </Navbar>
      <Content>
        {children}
      </Content>
    </AppLayout>
  );
};

export default VideoChat;
