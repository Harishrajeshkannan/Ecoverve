import React, { useState, useEffect } from 'react';
import { 
  User, TreePine, DollarSign, Calendar, Trophy, Activity, 
  Heart, Edit, Settings, LogOut, Bell, MapPin, Users,
  BookOpen, MessageCircle, ThumbsUp, Gift, Award,
  PlusCircle, Filter, Search, ChevronRight, Star,
  Home, BarChart, FileText, TrendingUp, Eye, Share,
  Camera, Save, Globe, Mail, Phone, Target, Zap,
  CheckCircle, Clock, Edit3, Trash2, Plus
} from 'lucide-react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState(null);
  
  // Mock user data
  const userData = {
    name: "Sarah Johnson",
    role: "Eco Warrior",
    level: "Champion",
    avatar: "/api/placeholder/80/80",
    stats: {
      treesPlanted: 127,
      totalDonations: 2450,
      eventsJoined: 15,
      impactScore: 3825,
      ecoPoints: 1250,
      rank: 3,
      nextLevelPoints: 350
    },
    contact: {
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 987-6543",
      location: "Chennai, Tamil Nadu"
    }
  };

  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "Beach Cleanup Drive",
      date: "2024-09-15",
      status: "upcoming",
      location: "Marina Beach",
      description: "Join us for a morning of cleaning up Marina Beach and protecting marine life.",
      volunteers: 25,
      registeredVolunteers: 18,
      organizer: "Ocean Clean Initiative",
      points: 50
    },
    {
      id: 2,
      name: "Tree Plantation",
      date: "2024-09-08",
      status: "completed",
      location: "Central Park",
      description: "Community tree planting event to increase green cover in the city.",
      volunteers: 30,
      registeredVolunteers: 32,
      organizer: "Green Earth Foundation",
      points: 75
    },
    {
      id: 3,
      name: "Plastic Recycling Workshop",
      date: "2024-09-20",
      status: "upcoming",
      location: "Community Center",
      description: "Learn innovative ways to recycle plastic waste at home.",
      volunteers: 15,
      registeredVolunteers: 12,
      organizer: "EcoTech Solutions",
      points: 30
    }
  ]);

  const [donations, setDonations] = useState([
    {
      id: 1,
      amount: 500,
      ngo: "Green Earth Foundation",
      date: "2024-08-15",
      impact: "10 trees planted",
      status: "completed",
      project: "Urban Reforestation"
    },
    {
      id: 2,
      amount: 250,
      ngo: "Ocean Clean Initiative",
      date: "2024-07-22",
      impact: "2 hours of beach cleanup",
      status: "completed",
      project: "Marine Conservation"
    },
    {
      id: 3,
      amount: 100,
      ngo: "Wildlife Protection Trust",
      date: "2024-06-10",
      impact: "Fed 5 rescued animals",
      status: "completed",
      project: "Wildlife Rescue"
    }
  ]);

  const [blogs, setBLogs] = useState([
    {
      id: 1,
      title: "10 Easy Ways to Reduce Your Carbon Footprint",
      author: "Sarah Johnson",
      date: "2024-08-20",
      likes: 24,
      comments: 8,
      views: 156,
      status: "published",
      content: "Living sustainably doesn't have to be complicated. Here are simple steps you can take today to reduce your environmental impact..."
    },
    {
      id: 2,
      title: "My Experience at the River Cleanup",
      author: "Sarah Johnson",
      date: "2024-08-18",
      likes: 18,
      comments: 12,
      views: 98,
      status: "draft",
      content: "Last weekend's river cleanup was an eye-opening experience. Here's what I learned about water pollution in our city..."
    }
  ]);

  const leaderboard = [
    { rank: 1, name: "Alex Green", points: 4250, avatar: "/api/placeholder/40/40", change: "+50" },
    { rank: 2, name: "Maria Lopez", points: 3950, avatar: "/api/placeholder/40/40", change: "+25" },
    { rank: 3, name: "Sarah Johnson", points: 3825, avatar: "/api/placeholder/40/40", isCurrentUser: true, change: "+75" },
    { rank: 4, name: "David Kim", points: 3600, avatar: "/api/placeholder/40/40", change: "+10" },
    { rank: 5, name: "Lisa Wang", points: 3400, avatar: "/api/placeholder/40/40", change: "+30" }
  ];

  const recommendations = [
    {
      type: "activity",
      title: "Weekend Tree Planting",
      description: "Join a tree planting drive near your location",
      location: "Anna Nagar Park",
      date: "2024-09-21",
      points: 100,
      difficulty: "Easy"
    },
    {
      type: "ngo",
      title: "Chennai Green Initiative",
      description: "Based on your donation history",
      focus: "Urban Gardening",
      rating: 4.8
    },
    {
      type: "blog",
      title: "Sustainable Living Tips",
      author: "Eco Expert",
      readTime: "5 min read",
      topic: "Lifestyle"
    }
  ];

  const StatCard = ({ icon: Icon, title, value, color, subtitle, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const ActivityCard = ({ activity, isCompact = false }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
            {!isCompact && <p className="text-gray-600 text-sm mb-3">{activity.description}</p>}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(activity.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {activity.location}
              </div>
              {!isCompact && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {activity.points} points
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              activity.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {activity.status === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
          </div>
        </div>
        
        {!isCompact && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {activity.registeredVolunteers}/{activity.volunteers} volunteers
            </div>
            <p className="text-gray-600">by {activity.organizer}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {userData.name}! 🌱</h2>
                <p className="text-green-100 text-lg mb-2">{userData.role} • Level: {userData.level}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Rank #{userData.stats.rank}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {userData.stats.ecoPoints} points
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={TreePine} 
              title="Trees Planted" 
              value={userData.stats.treesPlanted}
              color="bg-green-600"
            />
            <StatCard 
              icon={DollarSign} 
              title="Total Donations" 
              value={`$${userData.stats.totalDonations}`}
              color="bg-blue-600"
            />
            <StatCard 
              icon={Calendar} 
              title="Events Joined" 
              value={userData.stats.eventsJoined}
              color="bg-purple-600"
            />
            <StatCard 
              icon={Trophy} 
              title="Impact Score" 
              value={userData.stats.impactScore}
              color="bg-orange-600"
            />
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activities</h3>
                <button 
                  onClick={() => setActiveTab('activities')}
                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
                >
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {activities.slice(0, 2).map(activity => (
                  <ActivityCard key={activity.id} activity={activity} isCompact={true} />
                ))}
              </div>
            </div>

            {/* Eco Points Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Eco Points & Rewards</h3>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Points</span>
                  <span className="text-2xl font-bold text-green-600">{userData.stats.ecoPoints}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{userData.stats.nextLevelPoints} points to next level</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <Gift className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">Plant a Tree</p>
                  <p className="text-xs text-gray-600">500 points</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Gift className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">Eco Products</p>
                  <p className="text-xs text-gray-600">300 points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'activities') {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Activities</h2>
              <p className="text-gray-600">Track your environmental activities and participation</p>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{activities.filter(a => a.status === 'upcoming').length}</p>
              <p className="text-sm text-gray-600">Upcoming Events</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{activities.filter(a => a.status === 'completed').length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{activities.reduce((sum, a) => sum + (a.status === 'completed' ? a.points : 0), 0)}</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Activities</h3>
            <div className="space-y-4">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'donations') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Donations & Contributions</h2>
              <p className="text-gray-600">Your contribution to environmental causes</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Donate Now
            </button>
          </div>

          {/* Donation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">${userData.stats.totalDonations}</p>
              <p className="text-sm text-gray-600">Total Donated</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{donations.length}</p>
              <p className="text-sm text-gray-600">NGOs Supported</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-600">Projects Funded</p>
            </div>
          </div>

          {/* Donations List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
            <div className="space-y-4">
              {donations.map(donation => (
                <div key={donation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">${donation.amount} to {donation.ngo}</h4>
                        <span className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Project: {donation.project}</p>
                      <p className="text-sm text-green-600">Impact: {donation.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'community') {
      if (activeSubSection === 'write-blog') {
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Write New Blog Post</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter blog title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Share your eco-friendly thoughts and experiences..."
                />
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Publish Post
                </button>
                <button className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Save Draft
                </button>
                <button 
                  onClick={() => setActiveSubSection(null)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Community & Blogs</h2>
              <p className="text-gray-600">Share your thoughts and connect with fellow eco-warriors</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Eco Warriors Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map(user => (
                <div key={user.rank} className={`flex items-center space-x-4 p-3 rounded-lg ${
                  user.isCurrentUser ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <span className="font-bold text-gray-600 w-8">#{user.rank}</span>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="flex-1 font-medium text-gray-800">{user.name}</span>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{user.points}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.change?.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blog Posts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Blog Posts</h3>
              <button 
                onClick={() => setActiveSubSection('write-blog')}
                className="text-green-600 hover:text-green-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Write New Post</span>
              </button>
            </div>
            <div className="space-y-4">
              {blogs.map(blog => (
                <div key={blog.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{blog.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {blog.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{blog.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {blog.views}
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {blog.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {blog.comments}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Share className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Profile Overview */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{userData.name}</h3>
                <p className="text-green-100 mb-2">{userData.role} • {userData.level}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {userData.contact.email}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {userData.contact.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={userData.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={userData.contact.email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={userData.contact.phone}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={userData.contact.location}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={4}
                  defaultValue="Passionate about environmental conservation and sustainable living. Love participating in community cleanup drives and tree planting events."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Update Profile
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements & Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Tree Planter</p>
                <p className="text-xs text-gray-600">100+ trees planted</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Generous Donor</p>
                <p className="text-xs text-gray-600">$1000+ donated</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Community Leader</p>
                <p className="text-xs text-gray-600">10+ events organized</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Eco Blogger</p>
                <p className="text-xs text-gray-600">5+ blog posts</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'activities', label: 'My Activities', icon: Calendar },
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Fixed */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg mr-4">
              <TreePine className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EcoVerve</h1>
              <p className="text-xs text-gray-600">User Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setActiveSubSection(null);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveTab('activities')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Join New Activity
              </button>
              <button 
                onClick={() => {
                  setActiveTab('donations');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Heart className="h-5 w-5" />
                Make Donation
              </button>
              <button 
                onClick={() => {
                  setActiveTab('community');
                  setActiveSubSection('write-blog');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Write Blog
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended For You</h3>
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <h4 className="font-medium text-green-800 text-sm mb-1">{rec.title}</h4>
                  <p className="text-xs text-green-700">{rec.description}</p>
                  {rec.location && (
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {rec.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{userData.name}</p>
              <p className="text-xs text-gray-600">{userData.role}</p>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Header + Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - Fixed */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-600">
                <span className="capitalize font-medium text-gray-900">{activeTab.replace('-', ' ')}</span>
                {activeSubSection && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="capitalize">{activeSubSection.replace('-', ' ')}</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;