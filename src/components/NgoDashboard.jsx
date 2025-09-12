import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  DollarSign, 
  Users, 
  Activity, 
  Plus, 
  Edit3, 
  Calendar, 
  MapPin, 
  UserCheck,
  Settings,
  User,
  PenTool,
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Star,
  Target,
  Zap,
  Users2,
  Camera,
  Upload,
  Save,
  Home,
  BarChart,
  FileText,
  ChevronRight,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [activities, setActivities] = useState([
    {
      id: 1,
      title: "Tree Plantation Drive - Central Park",
      description: "Community tree planting event to increase green cover in urban areas. Join us for a day of environmental action and community building.",
      date: "2024-10-15",
      location: "Central Park, Downtown",
      expectedVolunteers: 25,
      registeredVolunteers: 18,
      status: "upcoming",
      saplings: 50,
      category: "Plantation",
      priority: "high",
      image: null,
      volunteers: [
        { name: "Sarah Johnson", joined: "2024-09-01", points: 45 },
        { name: "Mike Chen", joined: "2024-09-05", points: 32 },
        { name: "Emma Davis", joined: "2024-09-10", points: 28 }
      ]
    },
    {
      id: 2,
      title: "Riverbank Restoration",
      description: "Planting native species along the riverbank to prevent erosion and restore natural habitat for local wildlife.",
      date: "2024-09-20",
      location: "River Valley, Sector 12",
      expectedVolunteers: 15,
      registeredVolunteers: 20,
      status: "completed",
      saplings: 75,
      category: "Restoration",
      priority: "medium",
      image: null,
      volunteers: [
        { name: "Alex Kumar", joined: "2024-08-15", points: 67 },
        { name: "Lisa Park", joined: "2024-08-20", points: 54 }
      ]
    }
  ]);

  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    expectedVolunteers: '',
    saplings: '',
    category: 'Plantation',
    priority: 'medium'
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced mock data for dashboard stats
  const dashboardStats = {
    totalSaplings: 2850,
    totalDonations: 45600,
    totalVolunteers: 324,
    ongoingActivities: 3,
    completedActivities: 12,
    monthlyGrowth: 15.3,
    averageVolunteersPerActivity: 18,
    topPerformer: "Riverbank Restoration"
  };

  const recentPosts = [
    {
      id: 1,
      title: "5 Benefits of Urban Tree Planting",
      content: "Urban trees provide numerous benefits including air purification, temperature regulation, and improved mental health...",
      author: "Green Earth Foundation",
      date: "2024-09-15",
      likes: 45,
      comments: 12,
      views: 234
    },
    {
      id: 2,
      title: "Success Story: River Valley Restoration",
      content: "Our recent riverbank restoration project exceeded expectations with 20 volunteers and 75 saplings planted...",
      author: "Green Earth Foundation",
      date: "2024-09-22",
      likes: 67,
      comments: 18,
      views: 456
    }
  ];

  const handleCreateActivity = () => {
    if (newActivity.title && newActivity.date && newActivity.location) {
      const activity = {
        id: Date.now(),
        ...newActivity,
        expectedVolunteers: parseInt(newActivity.expectedVolunteers) || 0,
        saplings: parseInt(newActivity.saplings) || 0,
        registeredVolunteers: 0,
        status: 'upcoming',
        volunteers: [],
        image: null
      };
      setActivities([...activities, activity]);
      setNewActivity({
        title: '',
        description: '',
        date: '',
        location: '',
        expectedVolunteers: '',
        saplings: '',
        category: 'Plantation',
        priority: 'medium'
      });
      setShowCreateForm(false);
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setNewActivity(activity);
    setActiveSubSection('edit-activity');
  };

  const handleUpdateActivity = () => {
    setActivities(activities.map(act => 
      act.id === editingActivity.id ? { ...newActivity, id: editingActivity.id } : act
    ));
    setEditingActivity(null);
    setActiveSubSection(null);
    setNewActivity({
      title: '',
      description: '',
      date: '',
      location: '',
      expectedVolunteers: '',
      saplings: '',
      category: 'Plantation',
      priority: 'medium'
    });
  };

  const handleDeleteActivity = (id) => {
    setActivities(activities.filter(act => act.id !== id));
  };

  const markAsCompleted = (id) => {
    setActivities(activities.map(act => 
      act.id === id ? { ...act, status: 'completed' } : act
    ));
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || activity.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ icon: Icon, title, value, color, subtitle, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendValue}%
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
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
            
            {!isCompact && (
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEditActivity(activity)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {!isCompact && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {activity.registeredVolunteers}/{activity.expectedVolunteers} volunteers
            </div>
            <div className="flex items-center text-gray-600">
              <TreePine className="h-4 w-4 mr-1" />
              {activity.saplings} saplings
            </div>
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
            <h2 className="text-3xl font-bold mb-2">Welcome back, Green Earth Foundation!</h2>
            <p className="text-green-100 text-lg mb-4">Making our planet greener, one tree at a time 🌱</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={TreePine} 
              title="Total Saplings" 
              value={dashboardStats.totalSaplings.toLocaleString()}
              color="bg-green-600"
            />
            <StatCard 
              icon={DollarSign} 
              title="Donations" 
              value={`$${dashboardStats.totalDonations.toLocaleString()}`}
              color="bg-blue-600"
            />
            <StatCard 
              icon={Users} 
              title="Volunteers" 
              value={dashboardStats.totalVolunteers.toLocaleString()}
              color="bg-purple-600"
            />
            <StatCard 
              icon={Award} 
              title="Completed" 
              value={dashboardStats.completedActivities}
              color="bg-orange-600"
            />
          </div>

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
        </div>
      );
    }

    if (activeTab === 'activities') {
      if (activeSubSection === 'create' || activeSubSection === 'edit-activity') {
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {activeSubSection === 'edit-activity' ? 'Edit Activity' : 'Create New Activity'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title *</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter activity title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Volunteers</label>
                <input
                  type="number"
                  value={newActivity.expectedVolunteers}
                  onChange={(e) => setNewActivity({...newActivity, expectedVolunteers: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Number of volunteers needed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the activity..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={activeSubSection === 'edit-activity' ? handleUpdateActivity : handleCreateActivity}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {activeSubSection === 'edit-activity' ? 'Update Activity' : 'Create Activity'}
              </button>
              <button 
                onClick={() => {
                  setActiveSubSection(null);
                  setEditingActivity(null);
                  setNewActivity({
                    title: '',
                    description: '',
                    date: '',
                    location: '',
                    expectedVolunteers: '',
                    saplings: '',
                    category: 'Plantation',
                    priority: 'medium'
                  });
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Activities Management</h2>
              <p className="text-gray-600">Manage your environmental activities</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'content') {
      if (activeSubSection === 'write-blog') {
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Write New Blog Post</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter blog title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your blog content..."
                />
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
              <h2 className="text-2xl font-bold text-gray-900">Content & Awareness</h2>
              <p className="text-gray-600">Manage your blog posts and content</p>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Blog Posts</h3>
            <div className="space-y-4">
              {recentPosts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{post.title}</h4>
                    <span className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
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
            <h2 className="text-2xl font-bold text-gray-900">Organization Profile</h2>
            <p className="text-gray-600">Manage your organization's information</p>
          </div>

          {/* Profile Overview */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <TreePine className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Green Earth Foundation</h3>
                <p className="text-green-100 mb-2">Environmental Conservation NGO</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    contact@greenearthfoundation.org
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    +1 (555) 123-4567
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  defaultValue="Green Earth Foundation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  defaultValue="contact@greenearthfoundation.org"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  defaultValue="https://greenearthfoundation.org"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
                <textarea
                  rows={4}
                  defaultValue="Dedicated to environmental conservation through community tree planting and awareness programs."
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
        </div>
      );
    }

    return null;
  };

  const getQuickActions = () => {
    switch (activeTab) {
      case 'overview':
        return [
          {
            icon: Plus,
            label: 'Create New Activity',
            action: () => {
              setActiveTab('activities');
              setActiveSubSection('create');
            },
            color: 'bg-green-600 hover:bg-green-700'
          },
          {
            icon: PenTool,
            label: 'Write Blog Post',
            action: () => {
              setActiveTab('content');
              setActiveSubSection('write-blog');
            },
            color: 'bg-blue-600 hover:bg-blue-700'
          },
          {
            icon: Users2,
            label: 'View Volunteers',
            action: () => setActiveTab('activities'),
            color: 'bg-purple-600 hover:bg-purple-700'
          }
        ];
      case 'activities':
        return [
          {
            icon: Plus,
            label: 'Create Activity',
            action: () => setActiveSubSection('create'),
            color: 'bg-green-600 hover:bg-green-700'
          },
          {
            icon: Search,
            label: 'Search Activities',
            action: () => document.querySelector('input[placeholder="Search activities..."]')?.focus(),
            color: 'bg-blue-600 hover:bg-blue-700'
          },
          {
            icon: Filter,
            label: 'Filter by Status',
            action: () => console.log('Filter'),
            color: 'bg-purple-600 hover:bg-purple-700'
          },
          {
            icon: Calendar,
            label: 'Calendar View',
            action: () => console.log('Calendar View'),
            color: 'bg-orange-600 hover:bg-orange-700'
          }
        ];
      case 'content':
        return [
          {
            icon: PenTool,
            label: 'Write New Post',
            action: () => setActiveSubSection('write-blog'),
            color: 'bg-blue-600 hover:bg-blue-700'
          },
          {
            icon: FileText,
            label: 'View Drafts',
            action: () => console.log('View Drafts'),
            color: 'bg-green-600 hover:bg-green-700'
          },
          {
            icon: Eye,
            label: 'Analytics',
            action: () => console.log('Analytics'),
            color: 'bg-purple-600 hover:bg-purple-700'
          },
          {
            icon: Share,
            label: 'Share Content',
            action: () => console.log('Share'),
            color: 'bg-orange-600 hover:bg-orange-700'
          }
        ];
      case 'profile':
        return [
          {
            icon: Save,
            label: 'Save Changes',
            action: () => console.log('Save Profile'),
            color: 'bg-green-600 hover:bg-green-700'
          },
          {
            icon: Camera,
            label: 'Upload Logo',
            action: () => console.log('Upload Logo'),
            color: 'bg-blue-600 hover:bg-blue-700'
          },
          {
            icon: Settings,
            label: 'Account Settings',
            action: () => console.log('Settings'),
            color: 'bg-purple-600 hover:bg-purple-700'
          },
          {
            icon: Globe,
            label: 'Public Profile',
            action: () => console.log('Public Profile'),
            color: 'bg-orange-600 hover:bg-orange-700'
          }
        ];
      default:
        return [];
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'activities', label: 'Activities', icon: Calendar },
    { id: 'content', label: 'Content', icon: PenTool },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const quickActions = getQuickActions();

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
              <h1 className="text-xl font-bold text-gray-900">Ecoverve</h1>
              <p className="text-xs text-gray-600">NGO Dashboard</p>
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
<div className="bg-white rounded-xl shadow-sm p-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
  <div className="space-y-3">
    <button 
      onClick={() => {
        setActiveTab('activities');
        setActiveSubSection('create');
      }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
    >
      <Plus className="h-5 w-5" />
      Create New Activity
    </button>
    <button 
      onClick={() => {
        setActiveTab('content');
        setActiveSubSection('write-blog');
      }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
    >
      <PenTool className="h-5 w-5" />
      Write Blog Post
    </button>
    <button 
      onClick={() => setActiveTab('profile')}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Settings className="h-5 w-5" />
      Account Settings
    </button>
  </div>
</div>


        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Green Earth Foundation</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
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
                <span className="capitalize font-medium text-gray-900">{activeTab}</span>
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

export default NGODashboard;