import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Rocket, Copy } from "lucide-react";
import { Link } from 'react-router-dom'
import axios from 'axios';
import { useTheme } from './context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, DoughnutController } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { URL } from './constant/url';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  DoughnutController
);

const LoadingMessage = () => (
  <div className='flex items-start gap-2 hover:bg-zinc-800 rounded p-2'>
    <img
      src="/logo.png"
      alt="ai"
      className='w-8 h-8 rounded border border-zinc-600 flex-shrink-0'
    />
    <div className='flex-1 min-w-0'>
      <div className='flex items-center gap-2'>
        <p className='text-sm font-medium bg-green-500 text-transparent bg-clip-text'>
          Quant Ai
        </p>
      </div>
      <div className='mt-1 bg-transparent rounded-md p-2'>
        <div className='animate-pulse flex'>
          <span className='text-zinc-400 text-sm'>Response generating...</span>
        </div>
      </div>
    </div>
  </div>
);

const ChartComponent = ({ data, theme }) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: { size: 10 }
        }
      }
    }
  };

  const pieData = {
    labels: data.labels,
    datasets: [{
      data: data.datasets[0].data,
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
      ],
    }]
  };

  const lineData = {
    labels: data.labels,
    datasets: [{
      label: 'Trend Analysis',
      data: data.datasets[0].data,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const doughnutData = {
    labels: data.labels,
    datasets: [{
      data: data.datasets[0].data,
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1
    }]
  };

  const handleCopyChart = () => {
    const canvas = document.querySelector('canvas');
    canvas.toBlob(function (blob) {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
    });
  };

  return (
    <div className="mt-2 relative">
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="h-[280px] bg-zinc-800/50 backdrop-blur-sm rounded-lg p-3">
          <Bar
            options={{
              ...baseOptions,
              maintainAspectRatio: false,
              plugins: {
                ...baseOptions.plugins,
                title: {
                  display: true,
                  text: 'Engagement Distribution',
                  color: theme === 'dark' ? '#fff' : '#000',
                  padding: 10,
                  font: { size: 14, weight: 'bold' }
                }
              }
            }}
            data={data}
          />
        </div>
        <div className="h-[280px] bg-zinc-800/50 backdrop-blur-sm rounded-lg p-3">
          <Pie
            options={{
              ...baseOptions,
              maintainAspectRatio: false,
              plugins: {
                ...baseOptions.plugins,
                title: {
                  display: true,
                  text: 'Content Distribution',
                  color: theme === 'dark' ? '#fff' : '#000',
                  padding: 10,
                  font: { size: 14, weight: 'bold' }
                }
              }
            }}
            data={pieData}
          />
        </div>
        <div className="h-[280px] bg-zinc-800/50 backdrop-blur-sm rounded-lg p-3">
          <Line
            options={{
              ...baseOptions,
              maintainAspectRatio: false,
              plugins: {
                ...baseOptions.plugins,
                title: {
                  display: true,
                  text: 'Trend Analysis',
                  color: theme === 'dark' ? '#fff' : '#000',
                  padding: 10,
                  font: { size: 14, weight: 'bold' }
                }
              }
            }}
            data={lineData}
          />
        </div>
        <div className="h-[280px] bg-zinc-800/50 backdrop-blur-sm rounded-lg p-3">
          <Doughnut
            options={{
              ...baseOptions,
              maintainAspectRatio: false,
              plugins: {
                ...baseOptions.plugins,
                title: {
                  display: true,
                  text: 'Content Share',
                  color: theme === 'dark' ? '#fff' : '#000',
                  padding: 10,
                  font: { size: 14, weight: 'bold' }
                }
              },
              cutout: '60%'
            }}
            data={doughnutData}
          />
        </div>
      </div>
    </div>
  );
};

const MessageContent = ({ content, theme, chartData }) => {
  const handleCopyResponse = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-md font-semibold mt-3 mb-1" {...props} />,
            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal ml-6 mb-2" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          }}
          className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-black'} break-words pr-10`}
        >
          {content}
        </ReactMarkdown>
        <button
          onClick={handleCopyResponse}
          className={`absolute top-0 right-0 p-1.5 rounded-md transition-all duration-200 ${theme === 'dark'
              ? 'bg-zinc-700 hover:bg-zinc-600'
              : 'bg-gray-200 hover:bg-gray-300'
            }`}
          title="Copy response"
        >
          <Copy size={16} />
        </button>
      </div>
      {chartData && <ChartComponent data={chartData} theme={theme} />}
    </div>
  );
};

const Demo = () => {
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleChat = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = {
      type: 'user',
      content: inputText,
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlvA7GIu55Y8DhQqsNrhNa6D6XofSNMrdWWKkBklXoezSPPo5K8aj2-iUwQmmu4Tx91ZA&usqp=CAU"
    };

    setMessages(prev => [...prev, newUserMessage]);
    setActive(true);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await axios.post(`${URL}/analysis`, {
        message: inputText,
      });

      const responseText = aiResponse.data.analysis;

      const chartData = aiResponse.data.visualization;

      const newAiMessage = {
        type: 'ai',
        content: responseText,
        avatar: "/logo.png",
        timestamp: new Date().toISOString(),
        chartData: chartData
      };

      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'ai',
        content: "Sorry, I encountered an error processing your request.",
        avatar: "https://website.cdn.speechify.com/2023_10_DALL-E-Logo.webp?quality=80&width=1920"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };
  return (
    <div className={`w-full ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} h-screen flex flex-col`}>
      <div className={`bg-transparent flex justify-between py-2 px-4 items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
        <Link to="/" className='logo font-bold italic text-[1.2rem]'>Quant</Link>
        <div className='flex items-center space-x-4'>
          <div className='space-x-2'>
            <Link to="/" className='text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded-md text-white'>
              Back
            </Link>
            <Link to="/about" className={`text-sm ${theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700'
                : 'bg-gray-200 hover:bg-gray-300'
              } px-2 py-1 rounded-md`}>
              About
            </Link>
          </div>
        </div>
      </div>
      <div className='flex-1 p-2 overflow-y-auto min-h-0'>
        {active && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-2 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-300'} rounded p-2`}>
                <img
                  src={message.avatar}
                  alt={message.type}
                  className='w-8 h-8 rounded border border-zinc-600 flex-shrink-0'
                />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    {message.type === 'user' ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-800'} font-medium`}>User</p>
                    ) : (
                      <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-800'} font-medium`}>
                        AI Assistant
                      </p>
                    )}
                  </div>
                  <div className={`mt-1 ${message.type === 'ai' ? 'bg-zinc-500/30' : ''} rounded-md p-2`}>
                    {message.type === 'ai' ? (
                      <MessageContent
                        content={message.content}
                        theme={theme}
                        chartData={message.chartData}
                      />
                    ) : (
                      <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-black'} break-words`}>
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full'>
            <Rocket size={70} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            <h1 className={`text-2xl font-semibold mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>New Chat</h1>
            <p className={`text-md ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'} mt-1`}>Start the analysing through chat</p>
            <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Disclaimer: This is a demo model trained on sample data for illustration purposes only
            </p>
          </div>
        )}
      </div>

      <div className={`p-2 mt-auto ${theme === 'dark' ? 'bg-[#141414] border-zinc-800' : 'bg-gray-200 border-zinc-400'} border-t`}>
        <div className='relative'>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full h-[70px] border outline-none p-2 pr-12 rounded-md text-sm resize-none ${theme === 'dark' ? 'bg-[#0A0A0A] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-gray-900'
              }`}
            placeholder='Send a message...'
            disabled={isLoading}
          />
          <button
            className="absolute bottom-3 right-2"
            onClick={handleChat}
            disabled={!inputText.trim() || isLoading}
          >
            <ArrowRight
              className={`${theme === 'dark' ? 'text-black bg-white' : 'text-white bg-black'} p-1 rounded ${isLoading ? 'opacity-50' : 'hover:opacity-80'}`}
              size={25}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Demo