import { useEffect, useRef } from "react";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContex";

const useReadReceiptSocket = () => {
  const { messages, selectedConversation } = useConversation();
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  // track already-emitted reads
  const emittedRef = useRef(new Set());

  useEffect(() => {
    if (!socket || !authUser || !selectedConversation) return;

    messages.forEach((msg) => {
      // only messages sent TO me
      if (msg.senderId !== selectedConversation._id) return;

      // already read by me (DB truth)
      if (msg.readBy?.some((r) => r.userId === authUser._id)) return;

      if (emittedRef.current.has(msg._id)) return;

      socket.emit("message:read", { messageId: msg._id });
      emittedRef.current.add(msg._id);
    });
  }, [messages, selectedConversation?._id, authUser?._id, socket]);
};

export default useReadReceiptSocket;
