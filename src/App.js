import { Peer } from "peerjs";

import {useEffect, useState} from "react";

import './App.css'
import io from 'socket.io-client'

const socket =  io.connect('https://randomvideocall.tech/')
let peer = new Peer({
  host: 'randomvideocall.tech',
  port: 443,
  path: '/peerjs',
  config: { 'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },
  secure : true,
  debug: 3
});

let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia

function App() {

  const [PEER, setPeerID] = useState('')
  const [SOCKETID, setSocketID] = useState('')
  // const [ANOTHER_PEER, setAnotherPeerID] = useState('')
  // const [ANOTHER_SOCKET, setAnotherSocketID] = useState('')
  const [ROOM_ID, setRoomID] = useState('')

  useEffect(() => {
    peer.on('open', function(id) {
      console.log('My peer ID is -------> ' + id);
      setPeerID(id)
    });
    socket.on("connect", () => {
      console.log('My Socket ID is -------> '+socket.id);
      setSocketID(socket.id)
    });

    socket.on('ROOM_FULL', (data) => {
      if(data.CHANGE_OCCUR) {
        socket.emit('close_conn')
      }
      connectToPeer(data.PEER_ID)
    })

    socket.on('WRON', (data) => {
      console.log('WE R ONNNNN')
      setRoomID(data.roomID)
    })


    getUserMedia({ video: true, audio: false }, (stream) => {
      document.querySelector('#user').srcObject = stream
      document.querySelector('#user').addEventListener('loadedmetadata', () => {
        document.querySelector('#user').play()
      })
      peer.on('call', function(call) {

        // Answer the call, providing our mediaStream
        call.answer(stream);

        socket.on('close_stream', () => {
          console.log('---------------STREAM CLOSED---------------')
          call.close()
        })
        call.on('close', () => {
          console.log('---------------CALL CLOSED---------------')
        })
        call.on('stream', function(remoteStream) {
          document.querySelector('#anotherUser').srcObject = remoteStream
          document.querySelector('#anotherUser').addEventListener('loadedmetadata', () => {
            document.querySelector('#anotherUser').play()
          })
        });
      });
    });

  }, []);

  function change(p, s, r) {
    socket.emit('change', {
      mySocketId : s,
      myPeerId : p,
      roomID : r
    })
  }

  function connectToPeer(ANOTHER_PEER_ID) {

    getUserMedia({ video: true, audio: false }, (stream) => {
      let call = peer.call(ANOTHER_PEER_ID, stream);
      //console.log(call)
      socket.on('close_stream', () => {
        console.log('---------------STREAM CLOSED---------------')
        call.close()
      })
      call.on('close', () => {
        console.log('---------------CALL CLOSED---------------')
      })

      call.on('stream', function(remote_stream) {
        //console.log(call)

        document.querySelector('#anotherUser').srcObject = remote_stream
        document.querySelector('#anotherUser').addEventListener('loadedmetadata', () => {
          document.querySelector('#anotherUser').play()
        })
      });
    });
  }

  useEffect(() => {
    if(PEER && SOCKETID) {
      socket.emit('data', {
        mySocketId : SOCKETID,
        myPeerId : PEER
      })
    }

  }, [PEER, SOCKETID]);

  useEffect(() => {
    if(PEER && SOCKETID && ROOM_ID) {
      socket.on('SBHH', () => {
        change(PEER , SOCKETID, ROOM_ID)
      })
    }
  }, [PEER, SOCKETID, ROOM_ID]);

  return (
      <div className="App">
        <div id="user_container">
          <video id="user">

          </video>
          <div id="connected_container">
            <video id="anotherUser">

            </video>
          </div>
        </div>



        {/*<button onClick={() => change(PEER, SOCKETID, ROOM_ID)}>CHANGE</button>*/}
      </div>
  );
}

export default App;
