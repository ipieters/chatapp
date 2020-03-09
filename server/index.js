const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const oldMessages = [];
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  existingUser,
  getUniqueNickname
} = require("./users");

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const date = new Date();

app.use(cors());
app.use(router);

io.on("connect", socket => {
  socket.on("join", ({ name, room, nicknameCookie }, callback) => {
      const { error, user } = addUser({ id: socket.id, name, room, nicknameCookie });
   
    if (error) return callback(error);

    socket.join(user.room);
    time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    socket.broadcast.to(user.room).emit("message", {
      userName: null,
      userNickname: "admin",
      text: `${user.nickname} has joined!`,
      textColor: "#000000",
      timestamp: time
    });
    console.log("oldMessages size [" + oldMessages.length + "]");

    for (var i = 0; i < oldMessages.length; i++) {
      console.log("oldMessages [" + i + "]");
      console.log(oldMessages[i]);

      socket.emit("oldMessages", {
        userName: oldMessages[i].userName,
        userNickname: oldMessages[i].userNickname,
        text: oldMessages[i].text,
        textColor: oldMessages[i].textColor,
        timestamp: oldMessages[i].timestamp
      });
    }

    socket.emit("message", {
      userName: null,
      userNickname: "admin",
      text: `* ${user.nickname} welcome to room ${user.room} *`,
      textColor: "#000000",
      timestamp: time
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    console.log("Aqui viene el mensaje [" + message + "]");
    const isHexColor = hex =>
      typeof hex === "string" && hex.length === 6 && !isNaN(Number("0x" + hex));
    const date = new Date();
    const user = getUser(socket.id);
    let s = message
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");
    if (s[0] === "/nickcolor" && s.length === 2 && isHexColor(s[1])) {
      user.textColor = "#" + s[1];
    } else if (s[0] === "/nickchange" && s.length === 2) {
      if (existingUser(s[1]) === undefined) {
        user.nickname = s[1];
        socket.emit("message", {
          userName: null,
          userNickname: "admin",
          text: `* ${user.nickname} assigned! *`,
          textColor: "#000000",
          timestamp: time
        });
        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room)
        });
      } else {
        io.to(user.room).emit("message", {
          userName: user.name,
          userNickname: user.nickname,
          text: "Nickname [" + s[1] + "] taken! Try again",
          textColor: user.textColor,
          timestamp: time
        });
      }
    } else if (s[0] === "/nickset1") {
      console.log("llegue aqui /nickset " + s[1] + " " + existingUser(s[1]));

      if (existingUser(s[1]) === undefined) {
        user.nickname = s[1];

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room)
        });
      } else {
        user.nickname = getUniqueNickname(user.name);
        socket.emit("message", {
          userName: null,
          userNickname: "admin",
          text: `* ${user.nickname} previous username taken! Here's a new one *`,
          textColor: "#000000",
          timestamp: time
        });
        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room)
        });
      }
    } else {
      time =
        date.getMinutes() <= 9
          ? date.getHours() + ":0" + date.getMinutes() + ":" + date.getSeconds()
          : date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

      io.to(user.room).emit("message", {
        userName: user.name,
        userNickname: user.nickname,
        text: message,
        textColor: user.textColor,
        timestamp: time
      });

      let userName = user.name;
      let userNickname = user.nickname;
      let text = message;
      let textColor = user.textColor;
      let timestamp = time;

      let oldMessage = { userName, userNickname, text, textColor, timestamp };

      if (oldMessages.length > 200) {
        oldMessages.shift();
      }
      oldMessages.push(oldMessage);
      console.log(oldMessages);
    }
    callback();
  });

  socket.on("disconnect", () => {
    const date = new Date();
    const user = removeUser(socket.id);

    if (user) {
      time =
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      io.to(user.room).emit("message", {
        userName: null,
        userNickname: "Admin",
        text: `${user.nickname} has left.`,
        timestamp: time
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
