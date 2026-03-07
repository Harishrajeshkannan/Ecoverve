import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'
import { 
  TreePine, 
  IndianRupee, 
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

import BlogForm from './BlogForm'

const NGODashboard = ({ navigate }) => {
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
  const [blogPosts, setBlogPosts] = useState([])
  const [blogPostsLoading, setBlogPostsLoading] = useState(false)
  const [blogPostsError, setBlogPostsError] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState(null)
  const [_pollutionData, setPollutionData] = useState(null)
  const [suggestedLocations, setSuggestedLocations] = useState([])
  const [pollutionLoading, setPollutionLoading] = useState(false)
  const [pollutionError, setPollutionError] = useState(null)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [imageUploading, setImageUploading] = useState(new Set())

  // Ref for file input
  const fileInputRef = useRef(null)

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
        image: a.image || null,
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
    priority: 'medium',
    latitude: null,
    longitude: null,
    pollution_level: null,
    aqi: null
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

  // Fetch blog posts created by this NGO
  const fetchBlogPosts = useCallback(async () => {
    try {
      setBlogPostsLoading(true)
      setBlogPostsError(null)
      
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userData?.user
      if (!user) throw new Error('Not authenticated')

      const { data: posts, error: postsError } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError
      setBlogPosts(posts || [])
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setBlogPostsError(error.message)
    } finally {
      setBlogPostsLoading(false)
    }
  }, [])

  // Fetch registered users for a specific activity
  const fetchRegisteredUsers = useCallback(async (activityId) => {
    try {
      setUsersLoading(true)
      setUsersError(null)

      // Step 1: Get all user registrations for this specific activity from user_activities table
      const { data: userActivities, error: userActivitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('activity_id', activityId)

      if (userActivitiesError) {
        throw new Error(`Error fetching user activities: ${userActivitiesError.message}`)
      }

      if (!userActivities || userActivities.length === 0) {
        setRegisteredUsers([])
        return
      }

      // Step 2: Extract user IDs from user_activities records
      const userIds = userActivities.map(ua => ua.user_id)
      console.log(`Found ${userIds.length} registered users for activity ${activityId}`)

      // Step 3: Fetch complete user details from user_details table using extracted user IDs
      const { data: userDetails, error: userDetailsError } = await supabase
        .from('user_details')
        .select('*')
        .in('id', userIds)

      if (userDetailsError) {
        throw new Error(`Error fetching user details: ${userDetailsError.message}`)
      }

      // Step 4: Combine user_activities data with user_details data
      const enrichedUsers = userActivities.map((ua) => {
        // Find matching user details for this user_id
        const userDetail = userDetails?.find(d => d.id === ua.user_id)
        
        return {
          id: ua.id, // user_activities record id
          user_id: ua.user_id,
          activity_id: ua.activity_id,
          participated: ua.participated || false,
          registered_at: ua.created_at,
          updated_at: ua.updated_at,
          // User details from user_details table
          name: userDetail?.name || userDetail?.full_name || 'Name not available',
          email: userDetail?.email || 'Email not available', 
          phone: userDetail?.phone || 'Phone not available',
          address: userDetail?.address || 'Address not available',
          profile_picture: userDetail?.profile_picture || userDetail?.avatar_url || null,
          age: userDetail?.age || null,
          gender: userDetail?.gender || null
        }
      })

      console.log(`Successfully fetched details for ${enrichedUsers.length} users`)
      setRegisteredUsers(enrichedUsers)
      
    } catch (error) {
      console.error('Error in fetchRegisteredUsers:', error)
      setUsersError(error.message)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  // Fetch pollution data and suggest plantation locations
  const fetchPollutionSuggestions = useCallback(async () => {
    try {
      setPollutionLoading(true)
      setPollutionError(null)
      setSuggestedLocations([])

      // Get user's current location or use default coordinates (Mumbai as example)
      let latitude = 19.0760; // Mumbai coordinates as default
      let longitude = 72.8777;

      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: false
            })
          })
          latitude = position.coords.latitude
          longitude = position.coords.longitude
        }
      } catch {
        console.log('Using default location (Mumbai) as user location unavailable')
      }

      // Using a mock pollution API response for demonstration
      // In production, you would use a real API like OpenWeatherMap Air Pollution API
      // const apiKey = 'YOUR_API_KEY'
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
      
      // Mock highly polluted areas with detailed addresses for demonstration
      const mockPollutionData = {
        current_location: { lat: latitude, lon: longitude },
        pollution_index: 4, // Scale 1-5, 5 being most polluted
        suggested_locations: [
          {
            id: 1,
            name: 'Chakala Industrial Estate, Near International Airport, Andheri East, Mumbai - 400099',
            latitude: 19.1136,
            longitude: 72.8697,
            pollution_level: 5,
            aqi: 301,
            description: 'High industrial pollution from manufacturing units, urgent need for plantation',
            suitable_trees: ['Neem', 'Peepal', 'Banyan'],
            distance: '8.5 km from your location'
          },
          {
            id: 2,
            name: 'Eastern Express Highway Junction, Near Mulund Toll Plaza, Thane - 400607',  
            latitude: 19.2183,
            longitude: 72.9781,
            pollution_level: 4,
            aqi: 267,
            description: 'Heavy traffic area with poor air quality from vehicle emissions',
            suitable_trees: ['Ashoka', 'Gulmohar', 'Rain Tree'],
            distance: '25 km from your location'
          },
          {
            id: 3,
            name: 'Dahanu Thermal Power Station Road, Near NTPC Colony, Dahanu, Palghar - 401602',
            latitude: 19.9667,
            longitude: 72.7333,
            pollution_level: 5,
            aqi: 289,
            description: 'Coal power plant area requiring immediate green intervention',
            suitable_trees: ['Eucalyptus', 'Casuarina', 'Bamboo'],
            distance: '120 km from your location'
          },
          {
            id: 4,
            name: 'JNPT Port Road, Sector 7, Near Container Terminal, Uran, Navi Mumbai - 410206',
            latitude: 18.9647,
            longitude: 72.9505,
            pollution_level: 4,
            aqi: 245,
            description: 'Port activities and heavy vehicle movement contribute to air pollution',
            suitable_trees: ['Coconut Palm', 'Mangroves', 'Casuarina'],
            distance: '35 km from your location'
          },
          {
            id: 5,
            name: 'Taloja Industrial Area, MIDC Phase IV, Near Reliance SEZ, Navi Mumbai - 410208',
            latitude: 19.0330,
            longitude: 73.0297,
            pollution_level: 5,
            aqi: 278,
            description: 'Chemical and pharmaceutical industries causing severe air contamination',
            suitable_trees: ['Neem', 'Karanja', 'Subabul'],
            distance: '42 km from your location'
          },
          {
            id: 6,
            name: 'National Highway 8, Near Rajiv Gandhi Bridge, Vasai Road, Palghar - 401202',
            latitude: 19.4909,
            longitude: 72.8111,
            pollution_level: 4,
            aqi: 234,
            description: 'Major highway with constant heavy vehicle traffic and dust pollution',
            suitable_trees: ['Gulmohar', 'Indian Rosewood', 'Silver Oak'],
            distance: '65 km from your location'
          }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      setPollutionData(mockPollutionData)
      setSuggestedLocations(mockPollutionData.suggested_locations)
      setShowLocationSuggestions(true)

    } catch (error) {
      console.error('Error fetching pollution data:', error)
      setPollutionError('Failed to fetch pollution data. Please try again.')
    } finally {
      setPollutionLoading(false)
    }
  }, [])

  // Select a suggested location
  const selectSuggestedLocation = (location) => {
    setNewActivity({
      ...newActivity,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      pollution_level: location.pollution_level,
      aqi: location.aqi
    })
    setShowLocationSuggestions(false)
  }

  // Handle image upload for completed activities
  const handleImageUpload = async (activityId, imageFile) => {
    try {
      setImageUploading(prev => new Set(prev).add(activityId))

      // Create a unique filename
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${activityId}_${Date.now()}.${fileExt}`
      const filePath = `activity-images/${fileName}`

      // Upload image to Supabase Storage
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL for the uploaded image
      const { data: publicUrl } = supabase.storage
        .from('activity-images')
        .getPublicUrl(filePath)

      if (!publicUrl.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      // Update the ngo_activities table with the image URL
      const { error: updateError } = await supabase
        .from('ngo_activities')
        .update({ 
          image: publicUrl.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`)
      }

      // Update the local state
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, image: publicUrl.publicUrl }
          : activity
      ))

      console.log('Image uploaded successfully:', publicUrl.publicUrl)

    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setImageUploading(prev => {
        const newSet = new Set(prev)
        newSet.delete(activityId)
        return newSet
      })
    }
  }

  // Trigger file input for image upload
  const triggerImageUpload = (activityId) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB')
          return
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          return
        }

        handleImageUpload(activityId, file)
      }
    }
    input.click()
  }

  // Fetch blog posts when component mounts or when content tab is activated
  useEffect(() => {
    if (activeTab === 'content') {
      fetchBlogPosts()
    }
  }, [activeTab, fetchBlogPosts])

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
        pollution_score: newActivity.pollution_level || null,
        latitude: newActivity.latitude || null,
        longitude: newActivity.longitude || null,
        aqi: newActivity.aqi || null
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
        priority: 'medium',
        latitude: null,
        longitude: null,
        pollution_level: null,
        aqi: null
      })
      setActiveSubSection(null)
      setShowLocationSuggestions(false)
      setPollutionError(null)
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
        priority: 'medium',
        latitude: null,
        longitude: null,
        pollution_level: null,
        aqi: null
      })
      setShowLocationSuggestions(false)
      setPollutionError(null)
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
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => {
        if (!isCompact) {
          setSelectedActivity(activity)
          setActiveSubSection('activity-details')
          fetchRegisteredUsers(activity.id)
        }
      }}
    >
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
                {activity.status === 'completed' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerImageUpload(activity.id)
                    }}
                    disabled={imageUploading.has(activity.id)}
                    className={`p-2 ${
                      imageUploading.has(activity.id) 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-green-600 hover:bg-green-50'
                    } rounded-lg transition-colors`}
                    title={activity.image ? 'Update photo' : 'Add photo'}
                  >
                    {imageUploading.has(activity.id) ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditActivity(activity)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteActivity(activity.id)
                  }}
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
          <>
            {/* Show activity image if it exists and activity is completed */}
            {activity.status === 'completed' && activity.image && (
              <div className="mb-4">
                <img 
                  src={activity.image} 
                  alt={`${activity.title} completion photo`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {activity.registeredVolunteers}/{activity.expectedVolunteers} volunteers
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <TreePine className="h-4 w-4 mr-1" />
                  {activity.saplings} saplings
                </div>
                {activity.status === 'completed' && activity.image && (
                  <div className="flex items-center text-green-600 text-xs">
                    <Camera className="h-3 w-3 mr-1" />
                    Photo added
                  </div>
                )}
                <div className="text-xs text-green-600 font-medium">
                  Click to view details →
                </div>
              </div>
            </div>
          </>
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
              icon={IndianRupee} 
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newActivity.location}
                        onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter location or use pollution-based suggestions"
                      />
                      {newActivity.pollution_level && (
                        <div className="absolute -top-2 -right-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-300 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          High Pollution Area (AQI: {newActivity.aqi})
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={fetchPollutionSuggestions}
                      disabled={pollutionLoading}
                      className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400 flex items-center gap-2 whitespace-nowrap"
                    >
                      {pollutionLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Finding...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4" />
                          Find Polluted Areas
                        </>
                      )}
                    </button>
                  </div>
                  
                  {pollutionError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                      {pollutionError}
                    </div>
                  )}
                  
                  {showLocationSuggestions && suggestedLocations.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        High Pollution Areas Needing Plantation (Click to select)
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {suggestedLocations.map((location) => (
                          <div
                            key={location.id}
                            onClick={() => selectSuggestedLocation(location)}
                            className="p-3 bg-white border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">{location.name}</h5>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  location.pollution_level === 5 
                                    ? 'bg-red-100 text-red-800' 
                                    : location.pollution_level === 4 
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  AQI: {location.aqi}
                                </span>
                                <span className="text-xs text-gray-500">{location.distance}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                            <div className="text-xs text-green-700">
                              <strong>Recommended trees:</strong> {location.suitable_trees.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowLocationSuggestions(false)}
                        className="mt-3 text-sm text-orange-600 hover:text-orange-700 underline"
                      >
                        Close suggestions
                      </button>
                    </div>
                  )}
                </div>
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
                    priority: 'medium',
                    latitude: null,
                    longitude: null,
                    pollution_level: null,
                    aqi: null
                  });
                  setShowLocationSuggestions(false);
                  setPollutionError(null);
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

      if (activeSubSection === 'activity-details') {
        return (
          <div className="space-y-6">
            {/* Back Button and Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveSubSection(null)
                  setSelectedActivity(null)
                  setRegisteredUsers([])
                }}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                Back to Activities
              </button>
            </div>

            {/* Activity Details */}
            {selectedActivity && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedActivity.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-sm">{new Date(selectedActivity.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm">{selectedActivity.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <div>
                        <div className="font-medium">Volunteers</div>
                        <div className="text-sm">{selectedActivity.registeredVolunteers}/{selectedActivity.expectedVolunteers} registered</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Image Section for Completed Activities */}
                {selectedActivity.status === 'completed' && (
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Activity Photo</h3>
                      <button
                        onClick={() => triggerImageUpload(selectedActivity.id)}
                        disabled={imageUploading.has(selectedActivity.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          imageUploading.has(selectedActivity.id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedActivity.image
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {imageUploading.has(selectedActivity.id) ? (
                          <>
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4" />
                            {selectedActivity.image ? 'Update Photo' : 'Add Photo'}
                          </>
                        )}
                      </button>
                    </div>
                    
                    {selectedActivity.image ? (
                      <div className="relative">
                        <img 
                          src={selectedActivity.image} 
                          alt={`${selectedActivity.title} completion photo`}
                          className="w-full max-w-2xl h-64 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop'
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Photo Added
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-2xl h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
                        <Camera className="h-12 w-12 mb-2" />
                        <p className="text-sm font-medium mb-1">No photo uploaded yet</p>
                        <p className="text-xs">Add a photo to showcase your completed activity</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Registered Users Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Registered Volunteers ({registeredUsers.length})
                  </h3>
                  
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-600">Loading registered users...</div>
                    </div>
                  ) : usersError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                      Error loading registered users: {usersError}
                      <button 
                        onClick={() => fetchRegisteredUsers(selectedActivity.id)}
                        className="ml-2 text-red-800 underline hover:no-underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : registeredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-gray-900 font-medium mb-2">No registered volunteers yet</h4>
                      <p className="text-gray-600">Users will appear here once they register for this activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registeredUsers.map(user => (
                        <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {user.profile_picture ? (
                                  <img
                                    src={user.profile_picture}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-green-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {user.email}
                                  </span>
                                  {user.phone !== 'N/A' && (
                                    <span className="flex items-center">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {user.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                Registered: {new Date(user.registered_at).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.participated 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.participated ? 'Participated' : 'Registered'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
          <BlogForm
            onClose={() => setActiveSubSection(null)}
            onSuccess={() => {
              setActiveSubSection(null)
              fetchBlogPosts() // Refresh blog posts after creating a new one
              if (typeof navigate === 'function') navigate('blogs')
            }}
          />
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Blog Posts</h3>
              <button 
                onClick={() => setActiveSubSection('write-blog')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Write New Post
              </button>
            </div>
            
            {blogPostsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Loading blog posts...</div>
              </div>
            ) : blogPostsError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                Error loading blog posts: {blogPostsError}
                <button 
                  onClick={fetchBlogPosts}
                  className="ml-2 text-red-800 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-gray-900 font-medium mb-2">No blog posts yet</h4>
                <p className="text-gray-600 mb-4">Start sharing your NGO's story and environmental initiatives</p>
                <button 
                  onClick={() => setActiveSubSection('write-blog')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {blogPosts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {post.summary && (
                      <p className="text-gray-600 text-sm mb-3">{post.summary}</p>
                    )}
                    {post.category && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded mb-3">
                        {post.category}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(post.updated_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit post">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="View post">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete post">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
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