import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const data = {
    fullName: "John Doe",
    username: "johndoe",
    profileImg: "/avatars/boy1.png",
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logOutMutation, error } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }
    },
    onSuccess: () => {
      toast.success("Logout successful");
      queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      navigate("/login"); // Navigate to login page after successful logout
    },
    onError: (error) => toast.error(error.message || "Something went wrong"),
  });

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="p-2 sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>

        <div className="flex flex-col gap-3 mt-4">
          <Link
            to="/"
            className="w-full flex gap-2 items-center justify-center md:justify-start hover:bg-stone-900 transition-all duration-300 p-2 cursor-pointer"
          >
            <MdHomeFilled className="w-7 h-7" />
            <span className="text-md hidden md:block">Home</span>
          </Link>

          <Link
            to="/notifications"
            className="w-full flex gap-2 items-center justify-center md:justify-start hover:bg-stone-900 transition-all duration-300 py-2 pl-2 pr-4 cursor-pointer"
          >
            <IoNotifications className="w-6 h-6" />
            <span className="text-md hidden md:block">Notifications</span>
          </Link>

          <Link
            to={`/profile/${data?.username}`}
            className="w-full flex gap-2 items-center justify-center md:justify-start hover:bg-stone-900 transition-all duration-300 py-2 pl-2 pr-4 cursor-pointer"
          >
            <FaUser className="w-6 h-6" />
            <span className="text-md hidden md:block">Profile</span>
          </Link>
        </div>

        {data && (
          <Link
            to={`/profile/${data.username}`}
            className="mt-auto flex gap-2 items-center justify-center transition-all duration-300 hover:bg-[#181818] p-2"
          >
            <div className="avatar hidden md:inline-flex w-8 rounded-full">
              <img src={data?.profileImg || "/avatar-placeholder.png"} />
            </div>

            <div className="flex justify-center md:justify-between items-center flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {data?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{data?.username}</p>
              </div>
              <BiLogOut
                className="w-6 h-6 cursor-pointer relative right-1 md:right-0"
                onClick={(e) => {
                  e.preventDefault();
                  logOutMutation();
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
