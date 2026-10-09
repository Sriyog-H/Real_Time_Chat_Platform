import { useUI } from "../../context/UIContext";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";

const Sidebar = () => {
  const { closeSidebar } = useUI();
  return (
    <aside className="relative sidebar border-r border-slate-500 p-4 flex flex-col h-full">
      <SearchInput />
      <div className="divider px-3"></div>
      <Conversations onSelect={closeSidebar} />
      <div className="absolute bottom-5">
        <LogoutButton />
      </div>
    </aside>
  );
};
export default Sidebar;
