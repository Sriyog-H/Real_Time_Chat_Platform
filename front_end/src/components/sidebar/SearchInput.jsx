import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversation from "../../hooks/useGetConversation";
import toast from "react-hot-toast";

const SearchInput = () => {
  const [search, setSearch] = useState();
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { conversations } = useGetConversation();

  const submitHandler = (e) => {
    e.preventDefault();
    if (!search) return;
    if (search.length < 3) {
      return toast.error("search tems must be atleast 3 character long");
    }

    const conversation = conversations.find((c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase())
    );
	
    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      return toast.error(`no user found with name ${search}`);
    }
  };

  return (
    <form className="flex items-center gap-2" onSubmit={submitHandler}>
      <input
        type="text"
        placeholder="Search…"
        className="input input-bordered rounded-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button type="submit" className="btn btn-circle bg-[#0E1A29] text-white">
        <IoSearchSharp className="w-6 h-6 outline-none" />
      </button>
    </form>
  );
};
export default SearchInput;

// jb bhi kuch submit ho to me conversation ko filter kru according to input and show that matched results
