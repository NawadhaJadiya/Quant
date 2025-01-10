import React from 'react'
import { useTheme } from '../context/ThemeContext'

const Footer = () => {
  const { theme } = useTheme()
  return (
    <div className={`fixed bottom-2 right-1/2 text-sm translate-x-1/2 space-x-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
        Made with ❤️ by Supernova
    </div>
  )
}

export default Footer