import useGetConversation from "../../hooks/useGetConversation";
import { getRandomEmoji } from "../../utils/emoji";
import Conversation from "./Conversation";

const Conversations = ({ onSelect }) => {
  const { loading, conversations } = useGetConversation();
  return (
    <div
      className="py-2 flex flex-col overflow-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {conversations.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          emoji={getRandomEmoji()}
          lastIdx={idx === conversation.length - 1}
          onSelect={onSelect}
        />
      ))}

      {loading ? <span className="loading loading-spinner"></span> : null}
    </div>
  );
};
export default Conversations;
