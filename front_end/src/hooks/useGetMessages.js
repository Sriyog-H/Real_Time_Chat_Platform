import { useEffect, useState, useCallback } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const PAGE_SIZE = 20;

function deriveStatus(message, authUserId) {
  // Only show ticks for messages sent by me
  if (message.senderId.toString() !== authUserId) {
    return null; // or "received"
  }

  const receiverId = message.receiverId.toString();

  if (message.readBy?.some((r) => r.userId.toString() === receiverId)) {
    return "read";
  }

  if (message.deliveredTo?.some((d) => d.userId.toString() === receiverId)) {
    return "delivered";
  }

  return "sent";
}

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { messages, setMessages, prependMessages, selectedConversation } =
    useConversation();
  const { authUser } = useAuthContext();

  useEffect(() => {
    setMessages([]);
    setHasMore(false);

    const getMessages = async () => {
      if (!selectedConversation?._id) return;

      setLoading(true);

      try {
        const id = selectedConversation?._id;
        const res = await fetch(`/api/messages/${id}?limit=${PAGE_SIZE}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        const formattedMessages = data.messages.map((msg) => ({
          ...msg,
          status: deriveStatus(msg, authUser._id),
        }));
        setMessages(formattedMessages);
        setHasMore(Boolean(data.hasMore));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, authUser._id, setMessages]);

  // fetches the next page of older messages (before the oldest one
  // currently on screen) and prepends it to the conversation
  const loadMore = useCallback(async () => {
    if (!selectedConversation?._id || messages.length === 0 || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const id = selectedConversation._id;
      const oldest = messages[0];
      const res = await fetch(
        `/api/messages/${id}?limit=${PAGE_SIZE}&before=${encodeURIComponent(
          oldest.createdAt
        )}`
      );
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const formattedMessages = data.messages.map((msg) => ({
        ...msg,
        status: deriveStatus(msg, authUser._id),
      }));

      prependMessages(formattedMessages);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedConversation?._id, messages, authUser._id, prependMessages, loadingMore]);

  return { loading, messages, hasMore, loadingMore, loadMore };
};

export default useGetMessages;
