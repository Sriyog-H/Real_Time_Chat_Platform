import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContex";
import { useUI } from "../../context/UIContext";
import useIsMobile from "../../hooks/useIsMobile";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const { openSidebar } = useUI();
  const isMobile = useIsMobile();

  const isOnline = onlineUsers.includes(selectedConversation?._id);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden">
      {!selectedConversation ? (
        <div className="relative flex-1 flex items-center justify-center">
          {isMobile && (
            <button
              onClick={openSidebar}
              className="absolute top-4 left-4 z-10"
            >
              ☰
            </button>
          )}
          <NochatSelected />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="shrink-0 bg-[#0b1521] px-4 py-2 border-b border-slate-700 flex items-center gap-2">
            {isMobile && (
              <button onClick={openSidebar}>☰</button>
            )}
            <div>
              <div className="font-bold">
               {selectedConversation.fullName}
              </div>
              <div className="text-sm text-gray-400">
                {isOnline ? "online" : "offline"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto w-full">
            <Messages />
          </div>

          {/* Input */}
          <div className="shrink-0 w-full">
            <MessageInput />
          </div>
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NochatSelected = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="text-center text-gray-200 font-semibold flex flex-col gap-2">
      <p>Welcome {authUser.fullName}</p>
      <p>Select a chat to start messaging</p>
      <TiMessages className="text-6xl mx-auto" />
    </div>
  );
};
