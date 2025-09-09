import React, { useState } from 'react';
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

const DonationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Mock data for NGO activities
  const activities = [
    {
      id: 1,
      title: "Urban Forest Development - Phase 2",
      ngoName: "Green Earth Foundation",
      location: "Bangalore, Karnataka",
      targetAmount: 250000,
      raisedAmount: 180000,
      category: "urban",
      description: "Creating a 5-acre urban forest in the heart of Bangalore to combat air pollution.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop",
      deadline: "2025-10-15",
      treesToPlant: 500,
      verified: true
    },
    {
      id: 2,
      title: "Mangrove Restoration Project",
      ngoName: "Coastal Conservation Trust",
      location: "Mumbai, Maharashtra",
      targetAmount: 400000,
      raisedAmount: 120000,
      category: "coastal",
      description: "Restoring mangrove ecosystems along Mumbai's coastline.",
      image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&h=200&fit=crop",
      deadline: "2025-12-01",
      treesToPlant: 800,
      verified: true
    },
    {
      id: 3,
      title: "School Campus Greening Initiative",
      ngoName: "EduGreen Society",
      location: "Delhi, NCR",
      targetAmount: 150000,
      raisedAmount: 95000,
      category: "educational",
      description: "Transforming 20 school campuses in Delhi NCR with native trees.",
      image: "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deec?w=400&h=200&fit=crop",
      deadline: "2025-11-30",
      treesToPlant: 300,
      verified: true
    }
  ];

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ngoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDonate = (activity) => {
    setSelectedActivity(activity);
    setShowDonationModal(true);
    setDonationAmount('');
    setCustomAmount('');
  };

  const handleSubmitDonation = () => {
    const amount = donationAmount || customAmount;
    if (amount && amount > 0) {
      alert(`Thank you for donating ₹${amount} to ${selectedActivity.ngoName}!`);
      setShowDonationModal(false);
    }
  };

  const getProgressPercentage = (raised, target) => {
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Donate for Trees</h1>
          </div>
          <p className="text-gray-600">
            Support NGOs in their mission to create a greener future
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities or NGOs..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="urban">Urban Forests</option>
              <option value="coastal">Coastal Restoration</option>
              <option value="educational">Educational</option>
            </select>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={activity.image} 
                alt={activity.title}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-green-600">{activity.ngoName}</span>
                  {activity.verified && (
                    <Shield className="text-blue-500" size={16} />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activity.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TreePine size={14} />
                    <span>{activity.treesToPlant} trees</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      ₹{activity.raisedAmount.toLocaleString()} raised
                    </span>
                    <span className="text-gray-600">
                      ₹{activity.targetAmount.toLocaleString()} goal
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(activity.raisedAmount, activity.targetAmount)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getProgressPercentage(activity.raisedAmount, activity.targetAmount).toFixed(1)}% funded
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDonate(activity)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Donate Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No activities found. Try adjusting your search.</p>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {showDonationModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Make a Donation</h2>
                <button 
                  onClick={() => setShowDonationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-1">{selectedActivity.title}</h3>
                <p className="text-sm text-gray-600">{selectedActivity.ngoName}</p>
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
                    <span>Benefiting thousands in {selectedActivity.location}</span>
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