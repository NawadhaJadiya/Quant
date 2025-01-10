import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Users, MessageCircle, Eye, Calendar, Activity, Heart, Share2 } from "lucide-react";
import { useTheme } from '../context/ThemeContext';

const InstagramProfile = ({ data }) => {
  const { theme } = useTheme()
  const { profile_data, posts_data } = data;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toFixed(0);
  };

  const calculateAverages = () => {
    const totalLikes = posts_data.reduce((acc, post) => acc + post.post_data.likes, 0);
    const totalComments = posts_data.reduce((acc, post) => acc + post.post_data.comments, 0);
    return {
      avgLikes: (totalLikes / posts_data.length).toFixed(0),
      avgComments: (totalComments / posts_data.length).toFixed(0),
      engagementRate: ((totalLikes + totalComments) / (posts_data.length * profile_data.followers_count) * 100).toFixed(2)
    };
  };

  const getPostMetrics = posts_data.map((post) => ({
    id: post.post_id,
    date: new Date(post.post_data.timestamp).toLocaleDateString(),
    likes: post.post_data.likes,
    comments: post.post_data.comments,
    engagement: ((post.post_data.likes + post.post_data.comments) / profile_data.followers_count * 100).toFixed(2)
  }));

  const averages = calculateAverages();

  const metrics = [
    { 
      title: "Total Followers",
      value: formatNumber(profile_data.followers_count),
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      title: "Average Likes",
      value: formatNumber(parseInt(averages.avgLikes)),
      icon: Heart,
      color: "text-pink-400",
      bgColor: "bg-pink-400/10"
    },
    {
      title: "Average Comments",
      value: formatNumber(parseInt(averages.avgComments)),
      icon: MessageCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      title: "Engagement Rate",
      value: averages.engagementRate + "%",
      icon: Activity,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10"
    }
  ];

  const detailMetrics = [
    {
      title: "Total Posts",
      value: profile_data.total_posts,
      change: "+5% vs last month",
      icon: Calendar
    },
    {
      title: "Following",
      value: formatNumber(profile_data.following_count),
      change: "Active daily",
      icon: Users
    },
    {
      title: "Avg. Views",
      value: "12.4K",
      change: "+2.1% vs last week",
      icon: Eye
    },
    {
      title: "Shares",
      value: "1.2K",
      change: "+8% vs last month",
      icon: Share2
    }
  ];

  return (
    <div className={`space-y-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'}`}>
      {/* Profile Header */}
      <div className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-3 
        ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'} 
        rounded-lg border ${theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200'} 
        ${theme === 'dark' ? 'shadow-zinc-900/50' : 'shadow-gray-200/50'} shadow-lg`}>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlvA7GIu55Y8DhQqsNrhNa6D6XofSNMrdWWKkBklXoezSPPo5K8aj2-iUwQmmu4Tx91ZA&usqp=CAU"
          alt={profile_data.username}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-purple-500/20 shadow-xl"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {profile_data.full_name}
            </h1>
            {profile_data.is_verified && (
              <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-xs font-medium">
                Verified
              </span>
            )}
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>@{profile_data.username}</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'} mt-1.5 max-w-2xl`}>
            {profile_data.biography}
          </p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-2.5 rounded-lg border
            ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white border-gray-200'}
            ${theme === 'dark' ? 'shadow-zinc-900/50' : 'shadow-gray-200/50'} shadow-lg`}>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${metric.bgColor}`}>
                <metric.icon className={`${metric.color} w-3.5 h-3.5`} />
              </div>
              <div>
                <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>{metric.title}</p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Chart containers */}
        <div className={`p-3 rounded-lg border
          ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white border-gray-200'}
          ${theme === 'dark' ? 'shadow-zinc-900/50' : 'shadow-gray-200/50'} shadow-lg`}>
          <h2 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Engagement Trends
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getPostMetrics}>
                <defs>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px" }}
                  labelStyle={{ fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="likes" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLikes)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-3 rounded-lg border
          ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white border-gray-200'}
          ${theme === 'dark' ? 'shadow-zinc-900/50' : 'shadow-gray-200/50'} shadow-lg`}>
          <h2 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Comments Analysis
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getPostMetrics.slice(-7)}>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px" }}
                  labelStyle={{ fontSize: "11px" }}
                />
                <Bar dataKey="comments" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-3 rounded-lg border
          ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white border-gray-200'}
          ${theme === 'dark' ? 'shadow-zinc-900/50' : 'shadow-gray-200/50'} shadow-lg`}>
          <h2 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Engagement Rate
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getPostMetrics}>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px" }}
                  labelStyle={{ fontSize: "11px" }}
                />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {detailMetrics.map((metric, index) => (
            <div key={index} className={`p-2.5 rounded-lg border
              ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white border-gray-200'}
              ${theme === 'dark' ? 'shadow-zinc-900/50' : 'shadow-gray-200/50'} shadow-lg`}>
              <div className="flex items-start gap-2">
                <metric.icon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>{metric.title}</p>
                  <p className={`text-md font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
                  <p className={`text-[12px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{metric.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstagramProfile;