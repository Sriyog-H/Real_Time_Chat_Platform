import React from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContex";

const Conversation = ({ conversation, emoji, lastIdx, onSelect }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { socket, onlineUsers } = useSocketContext();

  const isSelected = selectedConversation?._id === conversation._id;
  const isOnline = onlineUsers.includes(conversation._id);
  return (
    <>
      <div
        className={`flex gap-2 items-center ${
          !isSelected ? " hover:bg-[#182738] " : ""
        } rounded-2xl p-2 py-1 cursor-pointer backdrop-blur-2xl shadow-2xl
		${isSelected ? "bg-[#0E1A29] " : ""}`}
        onClick={() => {
          setSelectedConversation(conversation);
          onSelect?.();
        }}
      >
        <div className={`avatar avatar-${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={conversation.profilePic} alt="avatar" />
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between">
            <p className="font-bold text-gray-200">{conversation.fullName}</p>
            <span className="text-xl">{emoji}</span>
          </div>
        </div>
      </div>

      {!lastIdx && <div className="divider my-0 py-0 h-1" />}
    </>
  );
};
export default Conversation;
