import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'
import { 
  User, TreePine, IndianRupee, Calendar, Trophy, Activity, 
  Heart, Edit, Settings, LogOut, Bell, MapPin, Users,
  BookOpen, MessageCircle, ThumbsUp, Gift, Award,
  PlusCircle, Filter, Search, ChevronRight, Star,
  Home, BarChart, FileText, TrendingUp, Eye, Share,
  Camera, Save, Globe, Mail, Phone, Zap,
  CheckCircle, Clock, Edit3, Trash2, Plus
} from 'lucide-react';

const UserDashboard = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [_userDetails, setUserDetails] = useState(null)
  const [_userDashboard, setUserDashboard] = useState(null)
  const [userActivities, setUserActivities] = useState([])
  const [allActivities, setAllActivities] = useState([])
  const [joinLoadingIds, setJoinLoadingIds] = useState(new Set())
  const [userDonations, setUserDonations] = useState([])
  const [searchJoinTerm, setSearchJoinTerm] = useState('')

  const handleJoinActivity = async (activityId) => {
    try {
      setJoinLoadingIds(prev => new Set(prev).add(activityId))
      const { data: userDataResp, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userDataResp?.user
      if (!user) throw new Error('Not authenticated')

      // prevent duplicate joins
      const { data: existing, error: exErr } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_id', activityId)
        .maybeSingle()

      if (exErr) throw exErr
      if (existing) {
        // already joined; update local state
        setUserActivities(prev => prev.map(a => a.id === activityId ? ({ ...a, participated: true }) : a))
        return
      }

      const payload = {
        user_id: user.id,
        activity_id: activityId,
        participated: false,
        donation: 0
      }

      const { error } = await supabase
        .from('user_activities')
        .insert(payload)

      if (error) throw error

      // mark as joined locally in allActivities
      setAllActivities(prev => prev.map(a => a.id === activityId ? ({ ...a, participated: true }) : a))

      // fetch the activity row and prepend to userActivities if not already present
      const { data: actRows, error: actErr } = await supabase
        .from('ngo_activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (!actErr && actRows) {
        const a = actRows
        const mapped = {
          id: a.id,
          name: a.title ?? 'Activity',
          date: a.activity_date,
          status: a.status ?? 'upcoming',
          location: a.location,
          description: a.description,
          volunteers: a.volunteer_capacity ?? 0,
          registeredVolunteers: a.volunteer_count ?? 0,
          organizer: null,
          points: 0,
          donation: 0,
          participated: true
        }

        setUserActivities(prev => {
          if (prev.some(x => x.id === mapped.id)) return prev.map(x => x.id === mapped.id ? mapped : x)
          return [mapped, ...prev]
        })
      }
    } catch (err) {
      console.error('Error joining activity', err)
    } finally {
      setJoinLoadingIds(prev => {
        const copy = new Set(prev)
        copy.delete(activityId)
        return copy
      })
    }
  }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
      // onAuthStateChange in App.jsx will update session and show AuthPage
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      setLoggingOut(false)
    }
  }
  
  // Mock user data
  const [userData, setUserData] = useState({
    name: 'Community Member',
    role: 'Member',
    level: '',
    avatar: null,
    stats: {
      totalDonations: 0,
      eventsJoined: 0,
      impactScore: 0,
      ecoPoints: 0,
      rank: 0,
      nextLevelPoints: 0
    },
    contact: {
      email: '',
      phone: '',
      location: ''
    }
  })

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    address: '',
    bio: '',
    profile_photo_url: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  // activities are loaded from DB into `userActivities`


  // donation history is constructed from user_activities donations -> userDonations

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const { data: userDataResp, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        const user = userDataResp?.user
        if (!user) {
          setError('No authenticated user')
          setLoading(false)
          return
        }

        // Fetch user_details
        const { data: uDetails, error: uDetErr } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', user.id)
          .single()

        if (uDetErr && uDetErr.code !== 'PGRST116') throw uDetErr

        // Fetch user_dashboard
        const { data: uDash, error: uDashErr } = await supabase
          .from('user_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (uDashErr) throw uDashErr

        // Fetch user_activities (join to get activity details)
        const { data: ua, error: uaErr } = await supabase
          .from('user_activities')
          .select('*, ngo_activities(*)')
          .eq('user_id', user.id)
          .order('activity_id', { ascending: false })

        if (uaErr) throw uaErr

        // Map activities
        const mappedActs = (ua ?? []).map(row => {
          const a = row.ngo_activities || {}
          return {
            id: row.activity_id,
            name: a.title ?? 'Activity',
            date: a.activity_date,
            status: a.status ?? (row.participated ? 'completed' : 'upcoming'),
            location: a.location,
            description: a.description,
            volunteers: a.volunteer_capacity ?? 0,
            registeredVolunteers: a.volunteer_count ?? 0,
            organizer: null,
            points: 0,
            donation: row.donation ?? 0,
            participated: row.participated ?? false
          }
        })

        // Fetch donation history from user_activities where donation > 0
        const donationsList = mappedActs.filter(a => a.donation && a.donation > 0).map((a, idx) => ({
          id: idx + 1,
          amount: a.donation,
          ngo: a.name,
          date: a.date,
          impact: '',
          status: 'completed',
          project: ''
        }))

        if (mounted) {
          setUserDetails(uDetails ?? null)
          setUserDashboard(uDash ?? null)
          setUserActivities(mappedActs)
          // Fetch all activities available to join
          const { data: allActs, error: allErr } = await supabase
            .from('ngo_activities')
            .select('*')
            .order('activity_date', { ascending: false })

          if (allErr) throw allErr

          const mappedAll = (allActs ?? []).map(a => ({
            id: a.id,
            name: a.title ?? 'Activity',
            date: a.activity_date,
            status: a.status ?? 'upcoming',
            location: a.location,
            description: a.description,
            volunteers: a.volunteer_capacity ?? 0,
            registeredVolunteers: a.volunteer_count ?? 0,
            organizer: null,
            points: 0
          }))
          setAllActivities(mappedAll)
          console.debug('Fetched allActivities count:', (mappedAll ?? []).length)
          setUserDonations(donationsList)

          // initialize profile form from user details
          setProfileForm({
            first_name: uDetails?.first_name ?? '',
            last_name: uDetails?.last_name ?? '',
            email: uDetails?.email ?? '',
            contact_number: uDetails?.contact_number ?? '',
            address: uDetails?.address ?? '',
            bio: uDetails?.bio ?? '',
            profile_photo_url: uDetails?.profile_photo_url ?? ''
          })

          // Update userData visible fields
          setUserData(prev => ({
            ...prev,
            name: uDetails?.first_name ? `${uDetails.first_name} ${uDetails.last_name ?? ''}`.trim() : prev.name,
            contact: {
              email: uDetails?.email ?? prev.contact.email,
              phone: uDetails?.contact_number ?? prev.contact.phone,
              location: uDetails?.address ?? prev.contact.location
            },
            stats: {
              treesPlanted: uDash?.trees_planted ?? prev.stats.treesPlanted,
              totalDonations: uDash?.total_donation ?? prev.stats.totalDonations,
              eventsJoined: uDash?.events_joined ?? prev.stats.eventsJoined,
              impactScore: uDash?.impact_score ?? prev.stats.impactScore,
              ecoPoints: prev.stats.ecoPoints,
              rank: prev.stats.rank,
              nextLevelPoints: prev.stats.nextLevelPoints
            }
          }))
        }

        setError(null)
      } catch (err) {
        console.error('Error loading user dashboard data', err)
        if (mounted) setError(err.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  // Fetch all NGO activities independently so All Activities always shows table contents
  useEffect(() => {
    let mounted = true
    const fetchAll = async () => {
      try {
        const { data: allActs, error } = await supabase
          .from('ngo_activities')
          .select('*')
          .order('activity_date', { ascending: false })

        if (error) {
          console.error('Error fetching all activities', error)
          return
        }

        if (mounted) {
          const mappedAll = (allActs ?? []).map(a => ({
            id: a.id,
            name: a.title ?? 'Activity',
            date: a.activity_date,
            status: a.status ?? 'upcoming',
            location: a.location,
            description: a.description,
            volunteers: a.volunteer_capacity ?? 0,
            registeredVolunteers: a.volunteer_count ?? 0,
            organizer: null,
            points: 0
          }))
          setAllActivities(mappedAll)
          console.debug('fetched all activities', mappedAll.length)
        }
      } catch (err) {
        console.error('Error in fetchAll activities', err)
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [])

  const handleUpdateProfile = async () => {
    try {
      setProfileMessage(null)
      setProfileLoading(true)
      const { data: userDataResp, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userDataResp?.user
      if (!user) throw new Error('Not authenticated')

      const payload = {
        id: user.id,
        first_name: profileForm.first_name || null,
        last_name: profileForm.last_name || null,
        email: profileForm.email || null,
        contact_number: profileForm.contact_number || null,
        address: profileForm.address || null,
        bio: profileForm.bio || null,
        profile_photo_url: profileForm.profile_photo_url || null
      }

      const { error } = await supabase
        .from('user_details')
        .upsert(payload, { returning: 'minimal' })

      if (error) throw error

      setProfileMessage('Profile updated')
      // update local user details state
      setUserDetails(prev => ({ ...(prev ?? {}), ...payload }))
      setUserData(prev => ({
        ...prev,
        name: `${profileForm.first_name} ${profileForm.last_name}`.trim(),
        contact: { ...prev.contact, email: profileForm.email, phone: profileForm.contact_number, location: profileForm.address }
      }))
    } catch (err) {
      console.error('Error updating profile', err)
      setProfileMessage(err.message || String(err))
    } finally {
      setProfileLoading(false)
    }
  }

  const blogs = [
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
  ];

  const leaderboard = [
    { rank: 1, name: "Alex Green", points: 4250, avatar: "/api/placeholder/40/40", change: "+50" },
    { rank: 2, name: "Maria Lopez", points: 3950, avatar: "/api/placeholder/40/40", change: "+25" },
    { rank: 3, name: "Sarah Johnson", points: 3825, avatar: "/api/placeholder/40/40", isCurrentUser: true, change: "+75" },
    { rank: 4, name: "David Kim", points: 3600, avatar: "/api/placeholder/40/40", change: "+10" },
    { rank: 5, name: "Lisa Wang", points: 3400, avatar: "/api/placeholder/40/40", change: "+30" }
  ];

  const StatCard = ({ icon: Icon, title, value, color, subtitle, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          {Icon && <Icon className="h-6 w-6 text-white" />}
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

  const ActivityCard = ({ activity, isCompact = false, showJoin = false, onJoin = null }) => (
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
            {showJoin && (
              <button 
                onClick={() => onJoin && onJoin(activity.id)}
                className={`p-2 ${joinLoadingIds.has(activity.id) ? 'text-gray-400' : 'text-green-600 hover:bg-green-50'} rounded-lg transition-colors`}
                disabled={joinLoadingIds.has(activity.id)}
              >
                {activity.participated ? 'Joined' : 'Join'}
              </button>
            )}
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

  // Separate card used in Join Activities view to show organizer, description and join CTA clearly
  const JoinActivityCard = ({ activity, onJoin, loading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
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
          <div className="flex flex-col items-end ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {activity.status === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
            <button
              onClick={() => onJoin && onJoin(activity.id)}
              disabled={loading}
              className={`mt-3 px-4 py-2 rounded-lg ${loading ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {activity.participated ? 'Joined' : 'Join'}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {activity.registeredVolunteers}/{activity.volunteers} volunteers
          </div>
          <p className="text-gray-600">by {activity.organizer ?? 'Organizer'}</p>
        </div>
      </div>
    </div>
  )

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="text-gray-600">Loading dashboard…</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">Error loading data: {String(error)}</div>
        </div>
      )
    }
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              icon={IndianRupee} 
              title="Total Donations" 
              value={`${userData.stats.totalDonations}`}
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
                {userActivities.slice(0, 2).map(activity => (
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
      // local subview: 'my' or 'join'
      const [activitiesView, setActivitiesView] = [activeSubSection === 'join' ? 'join' : 'my', (v) => setActiveSubSection(v === 'my' ? null : 'join')]
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activitiesView === 'my' ? 'My Activities' : 'Join Activities'}</h2>
              <p className="text-gray-600">{activitiesView === 'my' ? 'Track your environmental activities and participation' : 'Browse activities listed by NGOs and join'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setActivitiesView('my')} className={`px-3 py-2 rounded ${activitiesView === 'my' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>My Activities</button>
              <button onClick={() => setActivitiesView('join')} className={`px-3 py-2 rounded ${activitiesView === 'join' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Join Activities</button>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{userActivities.filter(a => a.status === 'upcoming').length}</p>
              <p className="text-sm text-gray-600">Upcoming Events</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{userActivities.filter(a => a.status === 'completed').length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{userActivities.reduce((sum, a) => sum + (a.status === 'completed' ? a.points : 0), 0)}</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>

          {/* Activities List */}
          {activitiesView === 'my' ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Activities</h3>
              <div className="space-y-4">
                {userActivities.slice(0, 50).map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Activities</h3>
              <div className="flex gap-3 mb-4">
                <input type="text" placeholder="Search activities..." value={searchJoinTerm} onChange={e => setSearchJoinTerm(e.target.value)} className="px-3 py-2 border rounded w-full" />
              </div>
              <div className="space-y-4">
                {allActivities.filter(a => {
                  const matchesSearch = a.name.toLowerCase().includes(searchJoinTerm.toLowerCase()) || (a.location || '').toLowerCase().includes(searchJoinTerm.toLowerCase())
                  // show only upcoming
                  const isUpcoming = a.status === 'upcoming' || !a.status
                  return matchesSearch && isUpcoming
                }).map(activity => (
                  <JoinActivityCard key={activity.id} activity={activity} onJoin={handleJoinActivity} loading={joinLoadingIds.has(activity.id)} />
                ))}
              </div>
            </div>
          )}
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
            <button onClick={() => navigate?.('donate')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Donate Now
            </button>
          </div>

          {/* Donation Stats */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center w-full md:w-2/3 lg:w-1/2">
              <IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-bold text-green-600">₹{userData.stats.totalDonations}</p>
              <p className="text-sm text-gray-600">Total Donated</p>
            </div>
          </div>

          {/* Donations List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
            <div className="space-y-4">
              {userDonations.map(donation => (
                <div key={donation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">₹{donation.amount} to {donation.ngo}</h4>
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
                  value={`${profileForm.first_name} ${profileForm.last_name}`.trim()}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ')
                    setProfileForm(prev => ({ ...prev, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') ?? '' }))
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.contact_number}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, contact_number: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleUpdateProfile} className={`px-6 py-3 ${profileLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors`} disabled={profileLoading}>
                {profileLoading ? 'Saving…' : 'Update Profile'}
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Change Password
              </button>
            </div>
            {profileMessage && <div className="mt-3 text-sm text-gray-700">{profileMessage}</div>}
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
  { id: 'donations', label: 'Donations', icon: IndianRupee },
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
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  disabled={loggingOut}
                  title={loggingOut ? 'Signing out…' : 'Sign out'}
                >
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