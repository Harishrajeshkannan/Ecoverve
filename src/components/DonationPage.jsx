import React, { useEffect, useState } from 'react';
import { 
  TreePine, 
  MapPin, 
  Heart,
  Search,
  IndianRupee,
  X,
  Star,
  Shield,
  Target,
  Users,
  Calendar
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient'

const DonationPage = ({ navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDonationModal, setShowDonationModal] = useState(false);
  // activity-based donations removed; donate to NGOs only
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [ngos, setNgos] = useState([])
  const [ngoLoading, setNgoLoading] = useState(true)
  const [donatingNgo, setDonatingNgo] = useState(null)

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleDonateToNgo = (ngo) => {
    console.debug('handleDonateToNgo', ngo?.id)
    setDonatingNgo(ngo)
    setShowDonationModal(true)
    setDonationAmount('')
    setCustomAmount('')
  }

  const handleSubmitDonation = async () => {
    const amount = Number(donationAmount || customAmount || 0)
    if (!amount || amount <= 0) return

    try {
      // Try to get authenticated user
      let userId = null
      try {
        const { data: userDataResp, error: userErr } = await supabase.auth.getUser()
        if (!userErr && userDataResp?.user) userId = userDataResp.user.id
      } catch (e) {
        console.debug('No authenticated user for donation or error fetching user', e)
      }

      // Update user_dashboard.total_donation (if authenticated)
      if (userId) {
        const { data: existingUserDash } = await supabase
          .from('user_dashboard')
          .select('total_donation')
          .eq('user_id', userId)
          .maybeSingle()

        const newUserTotal = (existingUserDash?.total_donation || 0) + amount

        // upsert the total_donation for this user
        await supabase
          .from('user_dashboard')
          .upsert({ user_id: userId, total_donation: newUserTotal }, { onConflict: 'user_id' })
      }

      // Update ngo_dashboard.total_donation for the NGO
      if (donatingNgo?.id) {
        const { data: existingNgoDash } = await supabase
          .from('ngo_dashboard')
          .select('total_donation')
          .eq('ngo_id', donatingNgo.id)
          .maybeSingle()

        const newNgoTotal = (existingNgoDash?.total_donation || 0) + amount

        await supabase
          .from('ngo_dashboard')
          .upsert({ ngo_id: donatingNgo.id, total_donation: newNgoTotal }, { onConflict: 'ngo_id' })

        // optimistic UI update for the NGO list
        setNgos(prev => prev.map(n => n.id === donatingNgo.id ? ({ ...n, total_donation: newNgoTotal }) : n))
      }

      // close modal and clear amounts silently (no alerts)
      setDonationAmount('')
      setCustomAmount('')
      setShowDonationModal(false)
    } catch (err) {
      console.error('Donation update error', err)
      // Do not alert the user; just close modal to keep UX simple
      setShowDonationModal(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchNgos = async () => {
      setNgoLoading(true)
      try {
        const { data, error } = await supabase
          .from('ngo_details')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error

        if (mounted) setNgos(data ?? [])
      } catch (err) {
        console.error('Error fetching NGOs', err)
      } finally {
        if (mounted) setNgoLoading(false)
      }
    }

    fetchNgos()
    return () => { mounted = false }
  }, [])

  

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm relative">
        <button onClick={() => navigate?.('home')} className="absolute left-4 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm z-20">← Back</button>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 ml-12 md:ml-0">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Heart className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Donate for Trees</h1>
                <p className="text-sm text-gray-600 mt-1">Support NGOs in their mission to create a greener future</p>
              </div>
            </div>
            <div className="hidden md:flex items-center text-sm text-gray-500">
              {/* optional quick stats or help link could go here */}
              <span className="mr-4">Verified partners</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search NGOs..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden sm:block">
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="urban">Urban</option>
                <option value="coastal">Coastal</option>
                <option value="educational">Educational</option>
              </select>
            </div>
          </div>
        </div>
        {/* Registered NGOs */}
        <h2 className="text-2xl font-semibold mb-4">Registered NGOs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ngoLoading ? (
            <div className="col-span-3 text-center py-8">Loading NGOs...</div>
          ) : ngos.length === 0 ? (
            <div className="col-span-3 text-center py-8">No NGOs registered.</div>
          ) : (
            ngos.filter(n => {
              const q = searchTerm.trim().toLowerCase()
              if (!q) return true
              return (n.name || '').toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q) || (n.mission || '').toLowerCase().includes(q)
                }).map(ngo => (
                  <div key={ngo.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col w-fit">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 font-semibold text-lg flex-shrink-0">
                          { (ngo.name || 'NGO').split(' ').slice(0,2).map(s=>s[0]).join('') }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{ngo.name}</h3>
                            <div className="text-sm text-gray-500 whitespace-nowrap">{ngo.city ?? ngo.location ?? ''}</div>
                          </div>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-3 break-words">{ngo.description ?? ngo.mission ?? ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <div>Contact: <span className="text-gray-800">{ngo.email ?? ngo.contact ?? '—'}</span></div>
                        <div className="text-xs text-gray-500 mt-1">Registered on: {ngo.created_at ? new Date(ngo.created_at).toLocaleDateString() : '—'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDonateToNgo(ngo) }} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 cursor-pointer">Donate</button>
                      </div>
                    </div>
                  </div>
                ))
          )}
        </div>

        {/* No demo activities: page shows registered NGOs only */}
      </div>

      {/* Donation Modal */}
  {showDonationModal && donatingNgo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-screen overflow-y-auto shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Make a Donation</h2>
                  <p className="text-sm text-gray-600 mt-1">Your contribution helps NGOs plant trees and support communities.</p>
                </div>
                <button 
                  onClick={() => setShowDonationModal(false)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <X size={22} />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-1">{donatingNgo?.name}</h3>
                <p className="text-sm text-gray-600">{donatingNgo ? (donatingNgo.description ?? donatingNgo.mission) : ''}</p>
              </div>
              
              {/* Predefined Amounts */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Amount
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setDonationAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                        donationAmount === amount
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-green-600'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                
                {/* Custom Amount */}
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setDonationAmount('');
                    }}
                  />
                </div>
              </div>
              
              {/* Impact Preview */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 mb-2">Your Impact</h4>
                <div className="text-sm text-green-700">
                  <div className="flex items-center gap-2 mb-1">
                    <TreePine size={14} />
                    <span>
                      ~{Math.floor((donationAmount || customAmount || 0) / 500)} trees can be planted
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>Benefiting communities in {donatingNgo ? (donatingNgo.location ?? 'the NGO area') : 'the NGO area'}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDonationModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDonation}
                    disabled={!donationAmount && !customAmount}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Donate ₹{donationAmount || customAmount || 0}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPage;