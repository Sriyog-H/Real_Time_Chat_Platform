import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContex";
import useConversation from "../zustand/useConversation";

const useMessageStatusSocket = () => {
  const { socket } = useSocketContext();

  // ✅ correctly select the action from zustand
  const updateMessageStatus = useConversation(
    (state) => state.updateMessageStatus
  );

  useEffect(() => {
    if (!socket) return;

    const handleDelivered = ({ messageId }) => {
      updateMessageStatus(messageId, "delivered");
    };

    const handleRead = ({ messageId }) => {
      updateMessageStatus(messageId, "read");
    };

    socket.on("message:delivered:update", handleDelivered);
    socket.on("message:read:update", handleRead);

    return () => {
      socket.off("message:delivered:update", handleDelivered);
      socket.off("message:read:update", handleRead);
    };
  }, [socket, updateMessageStatus]);
};

export default useMessageStatusSocket;
