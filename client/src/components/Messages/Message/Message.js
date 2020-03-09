import React from 'react';
import { useCookies } from "react-cookie";
import './Message.css';

import ReactEmoji from 'react-emoji';

const Message = ({ message: { userName, userNickname, text, textColor, timestamp}, name }) => {
  let isSentByCurrentUser = false; 
  /*console.log("Client log [");
  const mymsg = { userName, userNickname, text, textColor, timestamp};
  console.log(mymsg);
  console.log("]");*/
  //let trimmedName = name.trim().toLowerCase();
  const [cookies, setCookie] = useCookies(["nickname"]);


  if(userNickname === cookies.nickname) {
    isSentByCurrentUser = true;
  }

  return (
    isSentByCurrentUser
      ? (
        <div className="messageContainer justifyEnd">
          <p className="sentText pr-10" style={{color:textColor}}>{timestamp+ " " + userNickname}</p>
          <div className="messageBox backgroundBlue">
            <p className="messageText colorWhite">{ReactEmoji.emojify(text)}</p>
          </div>
        </div>
        )
        : (
          <div className="messageContainer justifyStart">
            <div className="messageBox backgroundLight">
              <p className="messageText colorDark" >{ReactEmoji.emojify(text)}</p>
            </div>
            <p className="sentText pl-10 " style={{color:textColor}}>{userNickname+ " " + timestamp}</p>
          </div>
        )
  );
}

export default Message;