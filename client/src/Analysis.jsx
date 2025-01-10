import React, { useState, useRef, useEffect } from 'react';
import Loader from './Components/Loader';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InstagramProfile from './Components/InstagramProfile';
import { Link } from 'react-router-dom';
// import { data } from './Components/data';
import Chat from './Components/Chat';
import { useTheme } from './context/ThemeContext';
import { URL } from './constant/url';


const Analysis = () => {
  const { theme } = useTheme()
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryParams = new URLSearchParams(location.search);
  const uname = queryParams.get('uname');
  const dataFetchedRef = useRef(false);

  // Prevent accidental page reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Prevent back button
    const handlePopState = (e) => {
      e.preventDefault();
      if (window.confirm('Are you sure you want to leave? Your analysis progress will be lost.')) {
        navigate('/');
      } else {
        window.history.pushState(null, null, window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push a new entry to prevent immediate back
    window.history.pushState(null, null, window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Account related Code - Only fetch once
  useEffect(() => {
    const postData = async () => {
      if (dataFetchedRef.current) return;
      setIsLoading(true);
      try {
        const response = await axios.post(`${URL}/scrape-instagram`, {
          username: uname,
          results_limit: 25
        });
        setData(response.data);
        dataFetchedRef.current = true;
      } catch (err) {
        setError(err);
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (uname && !dataFetchedRef.current) {
      postData();
    }
  }, [uname]);

  console.log(data)

  return (
    <>
      {isLoading && <Loader />}
      <div className='flex h-screen text-white'>
        {/* Left Area */}
        <div className='w-[55%] overflow-y-auto h-full no-scrollbar'>
          <div className="absolute top-[-40vh] left-[5vh] z-[-1]">
            <div className={`w-[40vw] h-[30vh] ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-900'} blur-[8rem] rounded-full`}></div>
            <div className={`w-[20vw] h-[40vh] ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-900'} blur-[10rem] rounded-full`}></div>
          </div>
          <div className='py-2 px-4'>
            <Link to="/" className={`logo font-bold italic text-[1.2rem] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Quant</Link>
          </div>
          {data && <InstagramProfile data={data} />}
        </div>

        {/* Right Area */}
        <Chat />
      </div>
    </>
  );
};

export default Analysis;