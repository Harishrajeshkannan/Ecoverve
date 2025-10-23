import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'
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
  LogOut,
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
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      setLoggingOut(false)
    }
  }
  const [activities, setActivities] = useState([
    
    
  ]);

  const [dashboardData, setDashboardData] = useState(null)
  const [ngoDetails, setNgoDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [createSuccess, setCreateSuccess] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deletingIds, setDeletingIds] = useState(new Set())

  // Helper to compute status from date
  const computeActivityStatus = (dateStr, existingStatus) => {
    if (!dateStr) return existingStatus ?? 'upcoming'
    try {
      const activityDate = new Date(dateStr)
      // normalize to local date (midnight)
      const aDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate())
      const today = new Date()
      const tDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (aDay.getTime() < tDay.getTime()) return 'completed'
      if (aDay.getTime() === tDay.getTime()) return 'ongoing'
      return 'upcoming'
    } catch {
      return existingStatus ?? 'upcoming'
    }
  }

  // Reconcile activity statuses in DB and ensure ngo_dashboard.activities_completed is exact
  const reconcileActivityStatuses = useCallback(async () => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userData?.user
      if (!user) return
      const ngoId = user.id

      // Fetch all activities for this NGO
      const { data: acts, error: actsErr } = await supabase
        .from('ngo_activities')
        .select('*')
        .eq('ngo_id', ngoId)

      if (actsErr) throw actsErr

      // Build list of updates where computed status differs from stored status
      const updates = []
      let computedCompletedCount = 0
      for (const a of (acts ?? [])) {
        const expected = computeActivityStatus(a.activity_date, a.status ?? 'upcoming')
        if (expected === 'completed') computedCompletedCount += 1
        if ((a.status ?? 'upcoming') !== expected) {
          updates.push({ id: a.id, status: expected })
        }
      }

      // Apply updates in a single bulk update using .update().in() if any
      if (updates.length > 0) {
        // Perform updates individually to preserve simplicity and compat with RLS
        for (const u of updates) {
          const { error: upErr } = await supabase
            .from('ngo_activities')
            .update({ status: u.status })
            .eq('id', u.id)

          if (upErr) console.error('Failed to update activity status', u.id, upErr)
        }
      }

      // Now ensure dashboard has exact completed count
      const { data: dash, error: dashErr } = await supabase
        .from('ngo_dashboard')
        .select('*')
        .eq('ngo_id', ngoId)
        .maybeSingle()

      if (dashErr) throw dashErr

      if (dash) {
        if ((dash.activities_completed ?? 0) !== computedCompletedCount) {
          const { error: upDashErr } = await supabase
            .from('ngo_dashboard')
            .update({ activities_completed: computedCompletedCount, updated_at: new Date() })
            .eq('id', dash.id)

          if (upDashErr) throw upDashErr
          setDashboardData(prev => ({ ...(prev ?? {}), activities_completed: computedCompletedCount }))
        } else {
          // keep local copy in sync
          setDashboardData(prev => ({ ...(prev ?? {}), activities_completed: computedCompletedCount }))
        }
      } else {
        // create dashboard row if missing
        const { data: inserted, error: insErr } = await supabase
          .from('ngo_dashboard')
          .insert({ ngo_id: ngoId, activities_completed: computedCompletedCount })
          .select()
          .single()

        if (insErr) throw insErr
        setDashboardData(inserted)
      }

      // Refresh local activities state to reflect updated statuses
      const refreshed = (await supabase.from('ngo_activities').select('*').eq('ngo_id', ngoId).order('activity_date', { ascending: false })).data
      const mapped = (refreshed ?? []).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        date: a.activity_date,
        location: a.location,
        expectedVolunteers: a.volunteer_capacity ?? 0,
        registeredVolunteers: a.volunteer_count ?? 0,
        status: computeActivityStatus(a.activity_date, a.status ?? 'upcoming'),
        saplings: 0,
        category: a.category ?? 'General',
        priority: 'medium',
        image: null,
        volunteers: []
      }))
      setActivities(mapped)

    } catch (err) {
      console.error('Error reconciling activity statuses', err)
    }
  }, [])

  // Helper to adjust activities_completed in ngo_dashboard
  const adjustActivitiesCompleted = async (delta) => {
    try {
      const ngoId = ngoDetails?.id
      if (!ngoId || !delta) return

      // read existing dashboard row
      const { data: dash, error: dashErr } = await supabase
        .from('ngo_dashboard')
        .select('*')
        .eq('ngo_id', ngoId)
        .maybeSingle()

      if (dashErr) throw dashErr

      if (dash) {
        const newCount = Math.max(0, (dash.activities_completed ?? 0) + delta)
        const { error: upErr } = await supabase
          .from('ngo_dashboard')
          .update({ activities_completed: newCount, updated_at: new Date() })
          .eq('id', dash.id)

        if (upErr) throw upErr
        setDashboardData(prev => ({ ...(prev ?? {}), activities_completed: newCount }))
      } else {
        // create dashboard row if missing
        const { data: inserted, error: insErr } = await supabase
          .from('ngo_dashboard')
          .insert({ ngo_id: ngoId, activities_completed: Math.max(0, delta) })
          .select()
          .single()

        if (insErr) throw insErr
        setDashboardData(inserted)
      }
    } catch (err) {
      console.error('Error adjusting activities_completed', err)
    }
  }

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    sector: '',
    address: '',
    email: '',
    phone: '',
    description: '',
    website: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // Get current authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        const user = userData?.user
        if (!user) {
          setError('No authenticated user')
          setLoading(false)
          return
        }

        // Fetch ngo_details where id = auth user id
        const { data: ngo, error: ngoErr } = await supabase
          .from('ngo_details')
          .select('*')
          .eq('id', user.id)
          .single()

        if (ngoErr && ngoErr.code !== 'PGRST116') {
          // PGRST116: No rows found (some PostgREST versions). We'll continue with null ngo
          console.warn('ngo_details fetch warning', ngoErr)
        }

        if (mounted) setNgoDetails(ngo ?? null)

        const ngoId = ngo?.id ?? null

        if (ngoId) {
          // Fetch dashboard row for this NGO
          const { data: dash, error: dashErr } = await supabase
            .from('ngo_dashboard')
            .select('*')
            .eq('ngo_id', ngoId)
            .maybeSingle()

          if (dashErr) throw dashErr
          if (mounted) setDashboardData(dash ?? null)

          // Fetch activities
          const { data: acts, error: actsErr } = await supabase
            .from('ngo_activities')
            .select('*')
            .eq('ngo_id', ngoId)
            .order('activity_date', { ascending: false })

          if (actsErr) throw actsErr

          // Map DB rows to UI-friendly activity objects
          const mapped = (acts ?? []).map(a => ({
            id: a.id,
            title: a.title,
            description: a.description,
            date: a.activity_date,
            location: a.location,
            expectedVolunteers: a.volunteer_capacity ?? 0,
            registeredVolunteers: a.volunteer_count ?? 0,
            status: computeActivityStatus(a.activity_date, a.status ?? 'upcoming'),
            saplings: 0, // not available in schema, fallback to 0
            category: a.category ?? 'General',
            priority: 'medium',
            image: null,
            volunteers: []
          }))

          if (mounted) setActivities(mapped)
          // reconcile statuses and dashboard counts after initial load
          if (mounted) {
            // fire-and-forget reconciliation
            reconcileActivityStatuses()
          }
        }

        setError(null)
      } catch (err) {
        console.error('Error loading NGO dashboard data', err)
        if (mounted) setError(err.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [reconcileActivityStatuses])

  // sync profile form when ngoDetails loads
  useEffect(() => {
    if (ngoDetails) {
      setProfileForm({
        name: ngoDetails.name ?? '',
        sector: ngoDetails.sector ?? '',
        address: ngoDetails.address ?? '',
        email: ngoDetails.email ?? '',
        phone: ngoDetails.phone ?? '',
        description: ngoDetails.description ?? '',
        website: ngoDetails.website ?? ''
      })
    }
  }, [ngoDetails])

  const handleUpdateProfile = async () => {
    setProfileError(null)
    setProfileSuccess(null)
    setProfileLoading(true)
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userData?.user
      if (!user) throw new Error('Not authenticated')

      const payload = {
        id: user.id,
        name: profileForm.name || null,
        sector: profileForm.sector || null,
        address: profileForm.address || null,
        email: profileForm.email || null,
        phone: profileForm.phone || null,
        description: profileForm.description || null,
        website: profileForm.website || null
      }

      const { data, error } = await supabase
        .from('ngo_details')
        .upsert(payload, { returning: 'representation' })

      if (error) throw error

      setNgoDetails(data?.[0] ?? null)
      setProfileSuccess('Profile updated')
    } catch (err) {
      console.error('Error updating profile', err)
      setProfileError(err?.message || String(err))
    } finally {
      setProfileLoading(false)
    }
  }

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

  
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced mock data for dashboard stats
  const dashboardStats = {
    totalSaplings: dashboardData?.total_saplings ?? 2850,
    totalDonations: dashboardData?.total_donation ?? 45600,
    totalVolunteers: dashboardData?.total_volunteers ?? 324,
    ongoingActivities: activities.filter(a => a.status === 'ongoing').length,
    completedActivities: dashboardData?.activities_completed ?? activities.filter(a => a.status === 'completed').length,
    monthlyGrowth: 15.3,
    averageVolunteersPerActivity: dashboardData?.total_volunteers ? Math.round(dashboardData.total_volunteers / Math.max(1, activities.length)) : 18,
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

  const handleCreateActivity = async () => {
    setCreateError(null)
    setCreateSuccess(null)
    if (!(newActivity.title && newActivity.date && newActivity.location)) {
      setCreateError('Please fill required fields: title, date and location')
      return
    }

    setCreateLoading(true)
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userData?.user
      if (!user) throw new Error('Not authenticated')

      const row = {
        ngo_id: user.id,
        title: newActivity.title,
        description: newActivity.description,
        location: newActivity.location,
        activity_date: newActivity.date || null,
        start_time: newActivity.start_time || null,
        end_time: newActivity.end_time || null,
        volunteer_capacity: newActivity.expectedVolunteers ? parseInt(newActivity.expectedVolunteers) : null,
        volunteer_count: 0,
        status: 'upcoming',
        budget_estimate: newActivity.budget_estimate ?? null,
        funds_received: 0,
        pollution_score: null
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('ngo_activities')
        .insert(row)
        .select()
        .single()

      if (insertErr) throw insertErr

      const activity = {
        id: inserted.id,
        title: inserted.title,
        description: inserted.description,
        date: inserted.activity_date,
        location: inserted.location,
        expectedVolunteers: inserted.volunteer_capacity ?? 0,
        registeredVolunteers: inserted.volunteer_count ?? 0,
        status: computeActivityStatus(inserted.activity_date, inserted.status ?? 'upcoming'),
        saplings: 0,
        category: 'Plantation',
        priority: 'medium',
        image: null,
        volunteers: []
      }

      setActivities(prev => [activity, ...prev])
      // adjust dashboard if this activity is already completed
      if (activity.status === 'completed') {
        adjustActivitiesCompleted(1)
      }
      setNewActivity({
        title: '',
        description: '',
        date: '',
        location: '',
        expectedVolunteers: '',
        saplings: '',
        category: 'Plantation',
        priority: 'medium'
      })
      setActiveSubSection(null)
      setCreateSuccess('Activity created successfully')
      // ensure DB counts/statuses are correct after creation
      reconcileActivityStatuses()
    } catch (err) {
      console.error('Error creating activity', err)
      setCreateError(err?.message || String(err))
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setNewActivity(activity);
    setActiveSubSection('edit-activity');
  };

  const handleUpdateActivity = async () => {
    setCreateError(null)
    setCreateSuccess(null)
    setUpdateLoading(true)
    try {
      if (!editingActivity) throw new Error('No activity selected for edit')

      // Prepare payload for update
      const payload = {
        title: newActivity.title || null,
        description: newActivity.description || null,
        location: newActivity.location || null,
        activity_date: newActivity.date || null,
        start_time: newActivity.start_time || null,
        end_time: newActivity.end_time || null,
        volunteer_capacity: newActivity.expectedVolunteers ? parseInt(newActivity.expectedVolunteers) : null,
        status: computeActivityStatus(newActivity.date, newActivity.status ?? 'upcoming')
      }

      const { data: updated, error: updateErr } = await supabase
        .from('ngo_activities')
        .update(payload)
        .eq('id', editingActivity.id)
        .select()
        .single()

      if (updateErr) throw updateErr

      const mapped = {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        date: updated.activity_date,
        location: updated.location,
        expectedVolunteers: updated.volunteer_capacity ?? 0,
        registeredVolunteers: updated.volunteer_count ?? 0,
        status: computeActivityStatus(updated.activity_date, updated.status ?? 'upcoming'),
        saplings: 0,
        category: updated.category ?? 'Plantation',
        priority: 'medium',
        image: null,
        volunteers: []
      }

      setActivities(prev => prev.map(act => act.id === mapped.id ? mapped : act))
      // adjust dashboard if status changed
      const prevStatus = editingActivity?.status
      const newStatus = mapped.status
      if (prevStatus !== newStatus) {
        if (prevStatus !== 'completed' && newStatus === 'completed') adjustActivitiesCompleted(1)
        if (prevStatus === 'completed' && newStatus !== 'completed') adjustActivitiesCompleted(-1)
      }
      setEditingActivity(null)
      setActiveSubSection(null)
      setNewActivity({
        title: '',
        description: '',
        date: '',
        location: '',
        expectedVolunteers: '',
        saplings: '',
        category: 'Plantation',
        priority: 'medium'
      })
      setCreateSuccess('Activity updated')
      // ensure DB counts/statuses are correct after update
      reconcileActivityStatuses()
    } catch (err) {
      console.error('Error updating activity', err)
      setCreateError(err?.message || String(err))
    } finally {
      setUpdateLoading(false)
    }
  };

  const handleDeleteActivity = (id) => {
    // optimistic local delete fallback; actual delete will be attempted against DB
    (async () => {
      try {
        setDeletingIds(prev => new Set(prev).add(id))
        const { error } = await supabase
          .from('ngo_activities')
          .delete()
          .eq('id', id)

        if (error) throw error

        // find activity to know previous status
        const prevAct = activities.find(a => a.id === id)
        // remove from local state
        setActivities(prev => prev.filter(act => act.id !== id))
        if (prevAct && prevAct.status === 'completed') {
          adjustActivitiesCompleted(-1)
        }
        // reconcile to ensure DB has exact counts after delete
        reconcileActivityStatuses()
      } catch (err) {
        console.error('Error deleting activity', err)
        // Optionally show error to user
      } finally {
        setDeletingIds(prev => {
          const copy = new Set(prev)
          copy.delete(id)
          return copy
        })
      }
    })()
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
          {Icon && <Icon className="h-6 w-6 text-white" />}
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
                  className={`p-2 ${deletingIds.has(activity.id) ? 'text-gray-400' : 'text-red-600 hover:bg-red-50'} rounded-lg transition-colors`}
                  disabled={deletingIds.has(activity.id)}
                >
                  {deletingIds.has(activity.id) ? 'Deleting…' : <Trash2 className="h-4 w-4" />}
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
            <h2 className="text-3xl font-bold mb-2">Welcome back, {ngoDetails?.name ?? 'Green Earth Foundation'}!</h2>
            <p className="text-green-100 text-lg mb-4">{ngoDetails?.description ?? 'Making our planet greener, one tree at a time 🌱'}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={TreePine} 
              title="Total Saplings" 
              value={(dashboardStats.totalSaplings ?? 0).toLocaleString()}
              color="bg-green-600"
            />
            <StatCard 
              icon={DollarSign} 
              title="Donations" 
              value={`₹${(dashboardStats.totalDonations ?? 0).toLocaleString()}`}
              color="bg-blue-600"
            />
            <StatCard 
              icon={Users} 
              title="Volunteers" 
              value={(dashboardStats.totalVolunteers ?? 0).toLocaleString()}
              color="bg-purple-600"
            />
            <StatCard 
              icon={Award} 
              title="Completed" 
              value={dashboardStats.completedActivities ?? 0}
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
                className={`px-6 py-3 ${(activeSubSection === 'edit-activity' ? updateLoading : createLoading) ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors`}
                disabled={createLoading || updateLoading}
              >
                {(activeSubSection === 'edit-activity' ? (updateLoading ? 'Updating…' : 'Update Activity') : (createLoading ? 'Creating…' : 'Create Activity'))}
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
            <div className="mt-4">
              {createError && <div className="text-sm text-red-600">{createError}</div>}
              {createSuccess && <div className="text-sm text-green-600">{createSuccess}</div>}
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
                <h3 className="text-2xl font-bold mb-2">{profileForm.name || 'Organization Name'}</h3>
                <p className="text-green-100 mb-2">{profileForm.sector || 'Environmental Conservation NGO'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profileForm.email || 'contact@yourngo.org'}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {profileForm.phone || 'Phone number'}
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
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleUpdateProfile}
                disabled={profileLoading}
                className={`px-6 py-3 ${profileLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors`}
              >
                {profileLoading ? 'Saving…' : 'Update Profile'}
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Change Password
              </button>
            </div>
            <div className="mt-3">
              {profileError && <div className="text-sm text-red-600">{profileError}</div>}
              {profileSuccess && <div className="text-sm text-green-600">{profileSuccess}</div>}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'activities', label: 'Activities', icon: Calendar },
    { id: 'content', label: 'Content', icon: PenTool },
    { id: 'profile', label: 'Profile', icon: Settings }
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

export default NGODashboard;