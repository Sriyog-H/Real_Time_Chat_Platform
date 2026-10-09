import { useEffect } from "react";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContex";
import notificationSound from "../assets/sounds/notificationSound.mp3";

const useListenMessages = () => {
  const { setMessages, selectedConversation } = useConversation();
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // ✅ ALWAYS emit delivered (receiver is online)
      socket.emit("message:delivered", {
        messageId: newMessage._id,
      });

      const isCurrentChat =
        selectedConversation?._id === newMessage.senderId;

      newMessage.status = isCurrentChat ? "read" : "delivered";
      newMessage.shouldShake = !isCurrentChat;

      if (isCurrentChat) {
        new Audio(notificationSound).play();
      }

      // ✅ Only append message if it belongs to active conversation
      if (isCurrentChat) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConversation?._id, setMessages]);
};

export default useListenMessages;
