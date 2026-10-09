import { BsSend } from "react-icons/bs";
import useSendMessages from "../../hooks/useSendMessages";
import { useState } from "react";

const MessageInput = () => {
  const [input, setInput] = useState("");

  const { loading, sendMessage } = useSendMessages();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      return;
    }
    await sendMessage(input);
    setInput("");
  };

  return (
    <form onSubmit={submitHandler} className="px-4 my-3 relative">
      <div className="w-full">
        <input
          type="text"
          className="border text-sm rounded-lg block  w-full p-2.5  bg-gray-700 border-gray-600 text-white"
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="absolute inset-y-0 end-0 flex items-center pe-7"
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <BsSend />
          )}
        </button>
      </div>
    </form>
  );
};
export default MessageInput;
