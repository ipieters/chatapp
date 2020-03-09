
import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import { useCookies } from "react-cookie";

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";

import "./Chat.css";

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [cookies, setCookie] = useCookies(["nickname"]);

  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name);
    let nicknameCookie = cookies.nickname;
    socket.emit("join", { name, room, nicknameCookie }, error => {
      if (error) {
        alert(error);
      }
    });
    
 
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", message => {
      console.log("Received message ["+message.text+"]");
     setMessages([...messages, message]);
      if (message.userNickname === "admin") {
        let str = message.text.split(" ");
        if (str[0] === "*") {
        //  console.log("New nickname [" + str[1] + "]");
          setCookie("nickname", str[1]);
        }
      }
    });

    socket.on("oldMessages", message => {
      console.log("Received message ["+message.text+"]");
      messages.push(message);
      setMessages(messages);
    // setMessages([...messages, message]);
      if (message.userNickname === "admin") {
        let str = message.text.split(" ");
        if (str[0] === "*") {
        //  console.log("New nickname [" + str[1] + "]");
          setCookie("nickname", str[1]);
        }
      }
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    return () => {
      socket.emit("disconnect");

      socket.off();
    };
  }, [messages]);

  const sendMessage = event => {
    console.log("The sendMesssage [" + message + "]");
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room}/>
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <TextContainer users={users} />
    </div>
  );
};

export default Chat;
