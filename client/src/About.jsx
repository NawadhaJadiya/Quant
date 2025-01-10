import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';

const About = () => {
  const { theme } = useTheme();

  const teamMembers = [
    {
      name: "Akash Bais",
      role: "Backend Developer",
      image: "https://res.cloudinary.com/dikkjtvur/image/upload/v1736442574/1732695497391_mre2nq.jpg",
      linkedin: "https://www.linkedin.com/in/bais-akash/"
    },
    {
      name: "Mandeep Yadav",
      role: "Full Stack Developer",
      image: "https://mandeepyadav.vercel.app/me.jpg",
      linkedin: "https://www.linkedin.com/in/mandeepyadav27/"
    },
    {
      name: "Devang Sharma",
      role: "Research",
      image: "https://i.ibb.co/6bw587V/Picsart-24-06-17-20-23-29-600.jpg",
      linkedin: "https://www.linkedin.com/in/devang-sharma-88aa84288"
    },
    {
      name: "Nawadha Jadiya",
      role: "Langflow and Prompting",
      image: "https://res.cloudinary.com/dikkjtvur/image/upload/v1736441788/WhatsApp_Image_2025-01-09_at_10.26.01_PM_luhvhr.jpg",
      linkedin: "https://www.linkedin.com/in/nawadha-jadiya-aab426253/"
    },
    {
      name: "Sneha Yadav",
      role: "UI and Design",
      image: "https://res.cloudinary.com/dikkjtvur/image/upload/v1736442411/WhatsApp_Image_2025-01-09_at_10.34.44_PM_ypc2o3.jpg",
      linkedin: "https://www.linkedin.com/in/sneha-yadav-02909021b/"
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-transparent text-white' : 'bg-white text-gray-900'}`}>
       <div className={`bg-transparent flex justify-between py-2 px-4 items-center ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      <Link to="/" className='logo font-bold italic text-[1.2rem]'>Quant</Link>
      <div className='flex items-center space-x-4'>
        <div className='space-x-2'>
          <Link to="/about" className={`text-sm ${
            theme === 'dark' 
            ? 'bg-zinc-800 hover:bg-zinc-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          } px-2 py-1 rounded-md`}>
            About
          </Link>
          <Link to="/analysis" className='text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded-md text-white'>
            Analysis
          </Link>
        </div>
      </div>
    </div>

      <header className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Meet Our Team</h1>
        <p className="text-xl text-blue-500">Building the future with code</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-lg p-6 transform hover:-translate-y-2 transition-all">
            <img  
              src={member.image} 
              alt={member.name}
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold text-center mb-2">{member.name}</h3>
            <p className="text-center text-gray-600 dark:text-gray-300">{member.role}</p>
            <a 
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-center text-blue-500 hover:text-blue-600"
            >
              LinkedIn Profile
            </a>
          </div>
        ))}
      </div>
      <div className={` text-sm flex justify-center mt-10 my-2 space-x-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
        Made with ❤️ by Supernova
    </div>
    </div>
  );
};

export default About;