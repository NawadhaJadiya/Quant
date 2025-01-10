import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { ArrowRight } from "lucide-react";
import { Rocket } from "lucide-react";
import Footer from "./Components/Footer";
import { useState } from "react";
import { useTheme } from './context/ThemeContext'

const Home = () => {
  const { theme } = useTheme()
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && username.trim()) {
      e.preventDefault(); // Prevent default textarea behavior
      navigate(`/realtime?uname=${username}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className={`flex absolute ${
        theme === 'dark' ? 'top-[-15vh]' : 'top-[-10vh]'
      } z-[-1]`}>
        <div className={`w-[40vw] h-[20vh] ${
            theme === 'dark' 
            ? 'bg-blue-400' 
            : 'bg-purple-900'
          } blur-[8rem] rounded-full`}></div>
        <div className={`w-[20vw] h-[40vh] ${
            theme === 'dark' 
            ? 'bg-blue-400' 
            : 'bg-purple-900'
          } blur-[10rem] rounded-full`}></div>
      </div>

      {/* Notification Button */}
      <div className="flex justify-center">
        <button className={`${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-900/40' : 'text-zinc-700 hover:bg-zinc-200/40'}  flex border border-zinc-500 rounded-full py-1 px-4 text-sm items-center bg-transparent gap-2`}>
          <Rocket size={15} /> Introducing Quant: A new social media analyzer
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col pt-[5rem] h-[80vh] text-center">
        <h1 className={`text-[2.6rem] font-bold ${
            theme === 'dark' 
            ? 'text-white' 
            : 'text-black'
          } mainf`}>
          Welcome to Quant, let's analyze!
        </h1>
        <p className={`text-[1.2rem] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} mainf`}>
          Unlock actionable insights from your social media platforms.
        </p>
        <div className="mt-6 w-[40vw] h-[30vh] mx-auto relative">
          <Link to={`/realtime?uname=${username}`}>
            <ArrowRight
              className={`${theme === 'dark' ? 'text-black bg-white' : 'text-white bg-black'} absolute z-[2] p-1 bottom-2 right-2  rounded`}
              size={30}
            />
          </Link>
          <textarea
            name=""
            className={`bg-gradient-to-b border w-[40vw] h-[30vh] outline-none ${theme === 'dark' ? 'from-[#141414] to-[#0A0A0A] border-zinc-800 text-white ' : 'from-[#f0f0f0] to-[#e0e0e0] border-zinc-300 text-black'} p-3 rounded-md text-sm resize-none `}
            placeholder="Enter your Instagram profile Id for real-time analysis (e.g. cristiano, leomessi)"
            id=""
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
          ></textarea>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Home;