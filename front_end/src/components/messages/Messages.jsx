import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import useMessageStatusSocket from "../../hooks/useMessageStatusSocket";
import useReadReceiptSocket from "../../hooks/useReadReceiptSocket";

const Messages = () => {
  const { loading, messages, hasMore, loadingMore, loadMore } =
    useGetMessages();
  useListenMessages();
  useMessageStatusSocket();
  useReadReceiptSocket();

  const lastMessageRef = useRef();
  const scrollContainerRef = useRef();
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // loading an older page prepends messages above what's on screen — without
  // this, the scroll position would jump because the container's content
  // grew above the fold. We record the scroll height before the fetch and
  // restore the same visual offset after the new messages are inserted.
  const handleLoadMore = async () => {
    const container = scrollContainerRef.current;
    prevScrollHeightRef.current = container?.scrollHeight || 0;

    await loadMore();

    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
      }
    });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="px-4 flex-1 overflow-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {!loading && hasMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-xs text-gray-400 hover:text-gray-200 underline disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load earlier messages"}
          </button>
        </div>
      )}

      {!loading &&
        messages.length > 0 &&
        messages.map((message) => (
          <div key={message._id} ref={lastMessageRef}>
            <Message message={message} />
          </div>
        ))}

      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {!loading && messages.length === 0 && (
        <p className="text-center">Send a message to start the conversation</p>
      )}
    </div>
  );
};

export default Messages;
