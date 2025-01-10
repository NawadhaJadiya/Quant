import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { theme } = useTheme()
  
  return (
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
            <ThemeToggle />
      </div>
    </div>
  )
}

export default Navbar