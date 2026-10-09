import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";
import { SocketContext } from "../context/SocketContex";

const useReactToMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages } = useConversation();
  const { socket } = useContext(SocketContext);

  // Listen for real-time reaction updates
  useEffect(() => {
    if (!socket) return;

    const handleReactionUpdate = (data) => {
      setMessages((msgs) =>
        msgs.map((m) =>
          m._id.toString() === data.messageId.toString()
            ? { ...m, reactions: data.reactions }
            : m
        )
      );
    };

    socket?.on("reactionUpdated", handleReactionUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off("reactionUpdated", handleReactionUpdate);
    };
  }, [socket, setMessages]);

  const reactToMessage = async (messageId, emoji) => {
    if (!emoji) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/messages/${messageId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ REQUIRED
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        throw new Error("Failed to react");
      }

      const updatedReactions = await res.json();

      // Update local state immediately
      setMessages((msgs) =>
        msgs.map((m) =>
          m._id === messageId ? { ...m, reactions: updatedReactions } : m
        )
      );
    } catch (error) {
      toast.error(error.message || "Reaction failed");
    } finally {
      setLoading(false);
    }
  };

  return { reactToMessage, loading };
};

export default useReactToMessage;
