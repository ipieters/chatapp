const users = [];

const existingUser = newName => {
  return users.find(user => user.nickname === newName);
};

const getUniqueNickname = name => {
  let randomNum = Math.floor(Math.random() * 1000);
  nickname = name + randomNum;
  while (existingUser(nickname)) {
    randomNum++;
    nickname = name + randomNum;
  }

  return nickname;
};

const addUser = ({ id, name, room, nicknameCookie }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  let textColor = "#000000";
  if (nicknameCookie != null && existingUser(nicknameCookie) === undefined)
    nickname = nicknameCookie;
  else nickname = getUniqueNickname(name);

  if (!nickname || !room) return { error: "Username and room are required." };

  const user = { id, name, room, nickname, textColor };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users.filter(user => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  existingUser,
  getUniqueNickname
};
