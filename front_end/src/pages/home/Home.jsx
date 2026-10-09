import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import { useUI } from "../../context/UIContext";
import useIsMobile from "../../hooks/useIsMobile";

const Home = () => {
  const { isSidebarOpen, closeSidebar } = useUI();
  const isMobile = useIsMobile();

  return (
    <div
      className="relative md:h-[90svh] md:w-[80svw] w-full h-full flex bg-transparent
	bg-gray bg-clip-padding backdrop-filter backdrop-blur-md rounded-lg
	 bg-opacity-0 shadow-xs border-white shadow-white
	 "
    >
      {/* Sidebar */}
      <div
        className={`
          bg-slate-900
          h-full
          transition-transform duration-300
          ${isMobile ? "fixed inset-y-0 -left-2 z-50 w-64" : "w-72 "}
          ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <Sidebar />
      </div>

      {/* Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 h-full flex overflow-hidden">
        <MessageContainer />
      </div>
    </div>
  );
};

export default Home;
