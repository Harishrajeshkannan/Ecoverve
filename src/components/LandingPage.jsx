import React, { useState, useEffect } from 'react';
import CircularText from './features/CircularText';
import DecryptedText from './features/DecryptedText';
import { 
  TreePine, 
  Users, 
  Target, 
  Heart, 
  MapPin, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Menu,
  X,
  User,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

export default function LandingPage(){
  const [counters, setCounters] = useState({
    trees: 0,
    ngos: 0,
    volunteers: 0
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const finalCounts = {
    trees: 10000,
    ngos: 50,
    volunteers: 5000
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = {
      trees: finalCounts.trees / steps,
      ngos: finalCounts.ngos / steps,
      volunteers: finalCounts.volunteers / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCounters({
          trees: Math.floor(increment.trees * currentStep),
          ngos: Math.floor(increment.ngos * currentStep),
          volunteers: Math.floor(increment.volunteers * currentStep)
        });
        currentStep++;
      } else {
        setCounters(finalCounts);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const [currentStory, setCurrentStory] = useState(0);
  const successStories = [
    {
      title: "Planted 200 saplings in Chennai",
      date: "July 2025",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop",
      participants: 45
    },
    {
      title: "Mangrove restoration in Mumbai",
      date: "June 2025", 
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
      participants: 72
    },
    {
      title: "Urban forest creation in Bangalore",
      date: "May 2025",
      image: "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deec?w=400&h=250&fit=crop",
      participants: 38
    }
  ];

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % successStories.length);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  const blogPreviews = [
    {
      title: "Why Urban Trees Matter More Than Ever",
      excerpt: "Discover how urban forestry is becoming crucial for combating air pollution in Indian cities...",
      date: "Aug 15, 2025",
      readTime: "5 min read"
    },
    {
      title: "The Science Behind Tree Placement",
      excerpt: "Learn how we use pollution data and scientific methods to determine optimal tree planting locations...",
      date: "Aug 10, 2025", 
      readTime: "7 min read"
    },
    {
      title: "Community Success: Chennai's Green Revolution",
      excerpt: "How local communities and NGOs transformed Chennai's air quality through strategic tree planting...",
      date: "Aug 5, 2025",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-lg">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5 flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <TreePine className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800">Ecoverve</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Menu aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors duration-300">
            Home
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors duration-300">
            Activities
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors duration-300">
            About Us
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors duration-300">
            Blogs
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors duration-300">
            Contact
          </a>
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <button className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-all duration-300 flex items-center gap-2">
            <Heart size={16} />
            Donate
          </button>
          <button className="border border-green-600 text-green-600 px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center gap-2">
            <User size={16} />
            Log in
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5 flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <TreePine className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-gray-800">Ecoverve</span>
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Home
                  </a>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Activities
                  </a>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    About Us
                  </a>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Blogs
                  </a>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Contact
                  </a>
                </div>
                <div className="py-6 space-y-3">
                  <button className="w-full bg-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2">
                    <Heart size={16} />
                    Donate
                  </button>
                  <button className="w-full border border-green-600 text-green-600 px-6 py-3 rounded-full text-sm font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                    <User size={16} />
                    Log in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
      <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Plant Trees.
              <br />
              <span className="text-green-200">Clean Air.</span>
              <br />
              Build Tomorrow.
            </h1>
            <div className='mb-8'>
              <DecryptedText
                speed={5}
                sequential={true}
                useOriginalCharsOnly={true}
                revealDirection="start"
                text="Join NGOs and volunteers in fighting pollution by planting trees where it matters most. Together, we can create a greener, healthier future for our communities.
                          "
                animateOn="view"
                className='text-xl md:text-2xl text-green-50 mb-12 leading-relaxed max-w-2xl'
                encryptedClassName='text-xl md:text-2xl text-green-50 mb-12 leading-relaxed max-w-2xl'
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <TreePine size={24} />
                Join an Activity
              </button>
              <button className="bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Heart size={24} />
                Donate Now
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-10 right-20 ">
          <div className='w-200 h-200'>
          <CircularText 
                text="PLANT TREES * BUILD A CLEANER FUTURE * "
                onHover="slowDown"
                spinDuration={20}
                className="custom-class "
          />
          </div>    
        </div>
        <div className='absolute bottom-20 right-20'><div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce delay-1000">
            <TreePine className="text-white" size={24} />
          </div></div>
        
        
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Growing Impact</h2>
            <p className="text-xl text-gray-600">See how our community is making a difference</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TreePine className="text-green-600" size={36} />
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {counters.trees.toLocaleString()}+
              </div>
              <p className="text-xl text-gray-600 font-medium">Trees Planted</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-blue-600" size={36} />
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">{counters.ngos}+</div>
              <p className="text-xl text-gray-600 font-medium">NGOs Partnered</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-purple-600" size={36} />
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {counters.volunteers.toLocaleString()}
              </div>
              <p className="text-xl text-gray-600 font-medium">Volunteers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to make a big impact</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <MapPin className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Find Polluted Areas</h3>
              <p className="text-gray-600 leading-relaxed">
                We use real-time pollution data and AI to identify areas that need trees the most, 
                ensuring maximum environmental impact.
              </p>
              <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>
            
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Users className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Join Activities</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse tree-planting activities organized by NGOs, register to participate, 
                or donate to support their cause.
              </p>
              <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Award className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Track Impact & Earn Points</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your contribution to the environment and earn eco-points for your 
                participation and donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Recent Success Stories</h2>
            <p className="text-xl text-gray-600">Real impact from our amazing community</p>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={successStories[currentStory].image} 
                    alt={successStories[currentStory].title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="text-green-600 font-semibold mb-2">
                    {successStories[currentStory].date}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    {successStories[currentStory].title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-6">
                    <Users size={20} className="mr-2" />
                    <span>{successStories[currentStory].participants} participants</span>
                  </div>
                  <button className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center gap-2 w-fit">
                    View Details
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={prevStory}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
            >
              <ChevronLeft className="text-gray-600" size={24} />
            </button>
            <button 
              onClick={nextStory}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
            >
              <ChevronRight className="text-gray-600" size={24} />
            </button>
            
            <div className="flex justify-center mt-8 space-x-2">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStory(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentStory ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Latest from Our Blog</h2>
            <p className="text-xl text-gray-600">Stay informed about environmental conservation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {blogPreviews.map((blog, index) => (
              <article key={index} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-8">
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-4">
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {blog.excerpt}
                  </p>
                  <button className="text-green-600 font-semibold hover:text-green-700 transition-colors duration-300 flex items-center gap-2">
                    Read More
                    <ExternalLink size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transition-colors duration-300">
              View All Blogs
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Every sapling counts.
          </h2>
          <p className="text-2xl text-green-100 mb-12 max-w-3xl mx-auto">
            Be part of the green revolution today. Join thousands of volunteers and NGOs 
            working together to create a cleaner, healthier planet.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Users size={24} />
              Join as Volunteer
            </button>
            <button className="bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <TreePine size={24} />
              Register Your NGO
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <TreePine size={24} />
                </div>
                <span className="text-2xl font-bold">Ecoverve</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Connecting communities, NGOs, and volunteers to create a greener future through 
                strategic tree planting and environmental conservation.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                  <Facebook size={20} />
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                  <Twitter size={20} />
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                  <Instagram size={20} />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Activities</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Blogs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={16} />
                  <span>hello@ecoverve.org</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone size={16} />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ecoverve. All rights reserved. Made with 💚 for a greener planet.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};