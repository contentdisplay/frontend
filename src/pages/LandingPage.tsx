import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Settings, 
  User, 
  Menu, 
  X, 
  CheckCircle, 
  DollarSign, 
  Award, 
  BookOpen, 
  Edit, 
  Gift, 
  ThumbsUp, 
  Shield,
  ChevronDown,
  ChevronUp,
  Star,
  Lock
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Refs for scrolling
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  const securityRef = useRef(null);
  const creatorsRef = useRef(null);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const sectionRefs = {
      hero: heroRef,
      about: aboutRef,
      howItWorks: howItWorksRef,
      features: featuresRef,
      testimonials: testimonialsRef,
      faq: faqRef,
      security: securityRef,
      creators: creatorsRef
    };
    
    const section = sectionRefs[sectionId];
    
    if (section && section.current) {
      section.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };
  
  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      const sections = [
        { id: "hero", ref: heroRef },
        { id: "about", ref: aboutRef },
        { id: "howItWorks", ref: howItWorksRef },
        { id: "features", ref: featuresRef },
        { id: "testimonials", ref: testimonialsRef },
        { id: "faq", ref: faqRef },
        { id: "security", ref: securityRef },
        { id: "creators", ref: creatorsRef }
      ];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // FAQ data
  const faqItems = [
    {
      question: "How do I earn points?",
      answer: "You earn points in several ways: reading articles (5 points per article), writing articles (50 points per published article), receiving likes on your articles (2 points per like), and through referrals (100 points per new user who joins using your link)."
    },
    {
      question: "How much is each point worth?",
      answer: "Each point is worth approximately $0.01 USD. You can redeem your points once you've accumulated at least 1,000 points ($10)."
    },
    {
      question: "Is this free to join?",
      answer: "Yes, WritelyRewards is completely free to join. There are no subscription fees or hidden charges. We make money through partnerships with publishers and advertisers."
    },
    {
      question: "How do I cash out?",
      answer: "You can cash out your earnings via PayPal, Stripe, or by receiving gift cards from popular retailers. The minimum withdrawal amount is $10 (1,000 points)."
    },
    {
      question: "How long does it take to get paid?",
      answer: "Payment processing typically takes 3-5 business days. Once processed, you'll receive your funds in your preferred payment account."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Aman Yadav",
      role: "Content Writer",
      image: "public/landing/46.jpg",
      quote: "I've read various articles and the options just keeps coming. This platform has given me great articles for my content creation. And i can become a article publisher myself!"
    },
    {
      name: "Abhishek Chaudhary",
      role: "Student Reader",
      image: "public/landing/46.jpg",
      quote: "WritelyRewards helps me earn while I research for my studies. It's like getting paid to learn!"
    },
    {
      name: "Ramkrishna Paudel",
      role: "Professional Blogger",
      image: "public/landing/46.jpg",
      quote: "I've doubled my audience since joining. The platform attracts engaged readers who actually value good content."
    }
  ];

  // Creator spotlight data
  const creators = [
    {
      name: "Alex Chen",
      specialty: "Technology Writer",
      earnings: "Rs.1000 earned",
      articles: "15 published articles",
      image: "public/landing/46.jpg"
    },
    {
      name: "Priya Sharma",
      specialty: "Financial Advisor",
      earnings: "2Rs.100 earned",
      articles: "22 published articles",
      image: "public/landing/46.jpg"
    },
    {
      name: "Marcus Johnson",
      specialty: "Health & Wellness",
      earnings: "Rs.950 earned",
      articles: "11 published articles",
      image: "public/landing/46.jpg"
    }
  ];

  // Platform comparison data
  const comparisonData = [
    { feature: "Earn by reading", writelyRewards: true, others: false },
    { feature: "Earn by writing", writelyRewards: true, others: true },
    { feature: "Free to join", writelyRewards: true, others: true },
    { feature: "No paywalls", writelyRewards: true, others: false },
    { feature: "Direct cash payouts", writelyRewards: true, others: false }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Navigation */}
      <nav className="bg-[#1E1B4B] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => scrollToSection("hero")}
                className="text-2xl font-bold text-[#C4B5FD]"
              >
                WritelyRewarded
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => scrollToSection("about")}
                className={`text-[#C4B5FD] hover:text-white transition-colors duration-200 px-2 py-1 ${activeSection === "about" ? "border-b-2 border-[#C4B5FD]" : ""}`}
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection("howItWorks")}
                className={`text-[#C4B5FD] hover:text-white transition-colors duration-200 px-2 py-1 ${activeSection === "howItWorks" ? "border-b-2 border-[#C4B5FD]" : ""}`}
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection("features")}
                className={`text-[#C4B5FD] hover:text-white transition-colors duration-200 px-2 py-1 ${activeSection === "features" ? "border-b-2 border-[#C4B5FD]" : ""}`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("testimonials")}
                className={`text-[#C4B5FD] hover:text-white transition-colors duration-200 px-2 py-1 ${activeSection === "testimonials" ? "border-b-2 border-[#C4B5FD]" : ""}`}
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection("faq")}
                className={`text-[#C4B5FD] hover:text-white transition-colors duration-200 px-2 py-1 ${activeSection === "faq" ? "border-b-2 border-[#C4B5FD]" : ""}`}
              >
                FAQ
              </button>
              <Link to="/login">
                <Button variant="ghost" className="text-[#C4B5FD] hover:bg-[#3B82F6] hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  className="bg-[#3B82F6] hover:bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-[#C4B5FD] focus:outline-none">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1E1B4B] px-4 pt-2 pb-4">
            <button 
              onClick={() => scrollToSection("about")}
              className="block w-full text-left text-[#C4B5FD] hover:text-white py-2 transition-colors duration-200"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection("howItWorks")}
              className="block w-full text-left text-[#C4B5FD] hover:text-white py-2 transition-colors duration-200"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection("features")}
              className="block w-full text-left text-[#C4B5FD] hover:text-white py-2 transition-colors duration-200"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left text-[#C4B5FD] hover:text-white py-2 transition-colors duration-200"
            >
              Testimonials
            </button>
            <button 
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left text-[#C4B5FD] hover:text-white py-2 transition-colors duration-200"
            >
              FAQ
            </button>
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="w-full text-left text-[#C4B5FD] hover:bg-[#3B82F6] hover:text-white mt-2"
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                className="w-full bg-[#3B82F6] hover:bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] text-white mt-2"
              >
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main>
        <div 
          ref={heroRef} 
          className="relative overflow-hidden py-32 bg-gradient-to-r from-[#C4B5FD] to-[#60A5FA]"
          id="hero"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F2937]">
                <span className="block">Earn Rewards by</span>
                <span className="block text-[#6D28D9]">Reading & Writing</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-[#6B7280]">
                Join thousands getting paid to share and consume knowledge. Read engaging articles and earn money, or become a writer and get paid for your content.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button 
                    className="bg-[#3B82F6] hover:bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] px-8 py-4 text-lg transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    Start Earning Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="border-[#3B82F6] text-[#3B82F6] px-8 py-4 text-lg hover:bg-[#60A5FA] hover:text-white transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    Login
                  </Button>
                </Link>
              </div>
              {/* <p className="mt-6 text-sm text-[#1F2937] bg-white bg-opacity-70 inline-block px-4 py-2 rounded-full font-medium">
                100% Free. No credit card needed. <span className="font-bold">10,000+</span> members already earning rewards.
              </p> */}
              
              {/* Live Counter */}
              {/* <div className="mt-8 flex justify-center">
                <div className="bg-white bg-opacity-90 rounded-lg shadow-lg px-6 py-4">
                  <p className="text-[#6D28D9] font-semibold">Total Points Earned Today</p>
                  <p className="text-[#1F2937] text-3xl font-bold">27,845</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div 
          ref={aboutRef}
          className="py-16 bg-[#F9FAFB]"
          id="about"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">About Us</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Why WritelyRewards?
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                Our mission is to empower individuals by rewarding their passion for reading and writing.
              </p>
            </div>
            <div className="mt-10 max-w-3xl mx-auto text-[#6B7280] space-y-6">
              <p>
                WritelyRewards is a unique platform that transforms how you engage with content. Whether you're an avid reader who loves discovering new articles or a talented writer looking to share your voice, we make it rewarding. Readers earn money for every article they read, while writers are compensated for their high-quality content.
              </p>
              <p>
                 Our platform has grown to support thousands of users worldwide. We believe in creating a community where knowledge and creativity are valued, and everyone has the opportunity to earn from their passions. Our user-friendly interface, robust reward system, and diverse content library make WritelyRewards the go-to platform for content enthusiasts.
              </p>
              <p>
                Join us today and start earning while doing what you love—reading, writing, and connecting with a global community of content creators and consumers.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-[#E5E7EB]">
                  <h3 className="text-xl font-semibold text-[#1F2937] flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-[#3B82F6]" />
                    For Readers
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span>Access thousands of curated articles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span>Earn points for each article you read</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span>Personalized content recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span>Create reading lists and bookmarks</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-[#E5E7EB]">
                  <h3 className="text-xl font-semibold text-[#1F2937] flex items-center">
                    <Edit className="h-5 w-5 mr-2 text-[#6D28D9]" />
                    For Writers
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#6D28D9] flex-shrink-0 mt-0.5" />
                      <span>Get paid for every article you publish</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#6D28D9] flex-shrink-0 mt-0.5" />
                      <span>Boost articles for more visibility</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#6D28D9] flex-shrink-0 mt-0.5" />
                      <span>Track reader engagement metrics</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-[#6D28D9] flex-shrink-0 mt-0.5" />
                      <span>Join our community of content creators</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div 
          ref={howItWorksRef}
          className="py-16 bg-white"
          id="howItWorks"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">How It Works</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Four Simple Steps to Start Earning
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                Our platform makes it easy to start earning rewards for your reading and writing activities.
              </p>
            </div>

            <div className="mt-16">
              <div className="relative">
                {/* Step connector line */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-[#E5E7EB] -translate-y-1/2"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#3B82F6] text-white text-xl font-bold relative z-10">
                        1
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-[#1F2937]">Sign Up</h3>
                      <p className="mt-2 text-center text-[#6B7280]">
                        Create your free account and complete your profile in just 2 minutes.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#6D28D9] text-white text-xl font-bold relative z-10">
                        2
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-[#1F2937]">Read/Write</h3>
                      <p className="mt-2 text-center text-[#6B7280]">
                        Consume content or create your own articles on topics you're passionate about.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#3B82F6] text-white text-xl font-bold relative z-10">
                        3
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-[#1F2937]">Earn Points</h3>
                      <p className="mt-2 text-center text-[#6B7280]">
                        Accumulate points for every article read, written, or engagement received.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#6D28D9] text-white text-xl font-bold relative z-10">
                        4
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-[#1F2937]">Cash Out</h3>
                      <p className="mt-2 text-center text-[#6B7280]">
                        Redeem your points for cash or gift cards once you reach the minimum threshold.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 text-center">
                <Link to="/register">
                  <Button 
                    className="bg-[#3B82F6] hover:bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] px-8 py-3 text-lg text-white"
                  >
                    Start Your Journey Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div 
          ref={featuresRef}
          className="py-16 bg-[#F9FAFB]"
          id="features"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Everything You Need to Succeed
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                Our platform provides all the tools you need to maximize your rewards and enhance your experience.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C4B5FD] to-[#60A5FA] rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-lg border border-[#E5E7EB] transform transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#3B82F6] text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[#1F2937]">Bonus Rewards</h3>
                  <p className="mt-2 text-base text-[#6B7280]">
                    Earn extra points through referrals, completing profile milestones, and participating in weekly challenges.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C4B5FD] to-[#60A5FA] rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-lg border border-[#E5E7EB] transform transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#6D28D9] text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[#1F2937]">Customize Profile</h3>
                  <p className="mt-2 text-base text-[#6B7280]">
                    Personalize your experience with custom reading preferences, writer bio, and portfolio settings.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C4B5FD] to-[#60A5FA] rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-lg border border-[#E5E7EB] transform transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#60A5FA] text-white">
                    <Gift className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[#1F2937]">Boost Articles</h3>
                  <p className="mt-2 text-base text-[#6B7280]">
                    Increase visibility of your content with promotional boosts that target interested readers.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Comparison */}
            <div className="mt-16">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#E5E7EB]">
                <div className="px-6 py-4 bg-[#1E1B4B] text-white text-center">
                  <h3 className="text-xl font-semibold">Why Choose WritelyRewards?</h3>
                </div>
                <table className="min-w-full divide-y divide-[#E5E7EB]">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Feature
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        WritelyRewards
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Other Platforms
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {comparisonData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">
                          {item.feature}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.writelyRewards ? 
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : 
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.others ? 
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : 
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div 
          ref={testimonialsRef}
          className="py-16 bg-white"
          id="testimonials"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">Testimonials</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                What Our Users Say
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                Discover how WritelyRewards is helping people earn from their passion for reading and writing.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg border border-[#E5E7EB] p-6 relative">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] rounded-full flex items-center justify-center shadow-lg">
                    <ThumbsUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="h-12 w-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937]">{testimonial.name}</h3>
                      <p className="text-sm text-[#6B7280]">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-[#6B7280] italic">"{testimonial.quote}"</p>
                  <div className="mt-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-[#F9FAFB] rounded-lg p-6 shadow-inner border border-[#E5E7EB]">
              <div className="text-center">
                <p className="text-xl font-semibold text-[#1F2937]">Our Community by the Numbers</p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-3xl font-bold text-[#6D28D9]">10,000+</p>
                    <p className="text-sm text-[#6B7280]">Active Members</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#3B82F6]">$45,000+</p>
                    <p className="text-sm text-[#6B7280]">Paid to Users</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#6D28D9]">25,000+</p>
                    <p className="text-sm text-[#6B7280]">Articles Published</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#3B82F6]">4.8/5</p>
                    <p className="text-sm text-[#6B7280]">User Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Spotlight */}
        <div 
          ref={creatorsRef}
          className="py-16 bg-[#F9FAFB]"
          id="creators"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">Creator Spotlight</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Meet Our Top Writers
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                These talented individuals are earning substantial rewards by sharing their expertise.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {creators.map((creator, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg border border-[#E5E7EB] p-6 text-center">
                  <div className="relative mx-auto h-20 w-20 mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C4B5FD] to-[#60A5FA] blur-lg opacity-70"></div>
                    <img 
                      src={creator.image} 
                      alt={creator.name} 
                      className="relative rounded-full h-20 w-20 object-cover mx-auto border-2 border-white"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F2937]">{creator.name}</h3>
                  <p className="text-sm text-[#6B7280]">{creator.specialty}</p>
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <p className="text-[#6D28D9] font-semibold">{creator.earnings}</p>
                    <p className="text-[#6B7280] text-sm">{creator.articles}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/register-writer">
                {/* <Button 
                  className="bg-[#6D28D9] hover:bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] px-8 py-3 text-white"
                >
                  Become a Featured Writer
                </Button> */}
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div 
          ref={faqRef}
          className="py-16 bg-white"
          id="faq"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">FAQ</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Frequently Asked Questions
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                Find answers to common questions about how WritelyRewards works.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="text-[#1F2937] font-medium">{item.question}</span>
                    {expandedFaq === index ? 
                      <ChevronUp className="h-5 w-5 text-[#6D28D9]" /> : 
                      <ChevronDown className="h-5 w-5 text-[#6D28D9]" />
                    }
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-white border-t border-[#E5E7EB]">
                      <p className="text-[#6B7280]">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* <div className="mt-12 text-center">
              <p className="text-[#6B7280]">Still have questions?</p>
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  className="mt-4 border-[#6D28D9] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white"
                >
                  Contact Support
                </Button>
              </Link>
            </div> */}
          </div>
        </div>

        {/* Trust & Security Section */}
        <div 
          ref={securityRef}
          className="py-16 bg-[#F9FAFB]"
          id="security"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#6D28D9] tracking-wide uppercase">Trust & Security</h2>
              <p className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Your Safety is Our Priority
              </p>
              <p className="mt-4 max-w-2xl text-lg text-[#6B7280] mx-auto">
                We implement industry-leading security measures to protect your data and earnings.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#E5E7EB]">
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-[#3B82F6] mr-4" />
                  <h3 className="text-xl font-semibold text-[#1F2937]">Secure Payments</h3>
                </div>
                <p className="text-[#6B7280]">
                  All transactions are processed through secure, encrypted channels. We partner with trusted payment providers including PayPal and Stripe to ensure your earnings are safely transferred to you.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-[#E5E7EB]">
                <div className="flex items-center mb-4">
                  <Lock className="h-8 w-8 text-[#6D28D9] mr-4" />
                  <h3 className="text-xl font-semibold text-[#1F2937]">Data Protection</h3>
                </div>
                <p className="text-[#6B7280]">
                  Your personal information is encrypted and protected using industry-standard protocols. We never share your data with third parties without your explicit permission.
                </p>
              </div>
            </div>

            {/* <div className="mt-12 flex flex-wrap justify-center gap-6 items-center">
              <img src="/api/placeholder/120/40" alt="PayPal" className="h-10 object-contain" />
              <img src="/api/placeholder/120/40" alt="Stripe" className="h-10 object-contain" />
              <img src="/api/placeholder/120/40" alt="Visa" className="h-10 object-contain" />
              <img src="/api/placeholder/120/40" alt="Mastercard" className="h-10 object-contain" />
              <img src="/api/placeholder/120/40" alt="American Express" className="h-10 object-contain" />
            </div> */}
          </div>
        </div>

        {/* Incentives Section */}
        <div className="py-16 bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-xl font-bold">Limited Time Offer</h2>
              <p className="mt-4 text-3xl font-bold">
                Get 200 Bonus Points When You Sign Up Today!
              </p>
              <p className="mt-4 text-lg opacity-90">
                Plus, earn an additional 100 points for each friend you refer.
              </p>
              <div className="mt-8">
                <Link to="/register">
                  <Button 
                    className="bg-white text-[#6D28D9] hover:bg-[#C4B5FD] hover:text-[#6D28D9] px-8 py-3 text-lg"
                  >
                    Claim Your Bonus Now
                  </Button>
                </Link>
              </div>
              <div className="mt-4 text-sm opacity-70">
                *Limited time offer. Terms and conditions apply.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1E1B4B] text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#C4B5FD]">WritelyRewards</h3>
              <p className="mt-4 text-sm text-[#6B7280]">
                Earn money by reading and writing. Join our global community today!
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#C4B5FD]">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection("about")}
                    className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection("howItWorks")}
                    className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection("features")}
                    className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200"
                  >
                    Features
                  </button>
                </li>
                {/* <li>
                  <Link to="/contact" className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200">
                    Contact
                  </Link>
                </li> */}
              </ul>
            </div>
            {/* <div>
              <h3 className="text-lg font-semibold text-[#C4B5FD]">Connect</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#6B7280] hover:text-[#C4B5FD] transition-colors duration-200">
                    Instagram
                  </a>
                </li>
              </ul>
            </div> */}
            {/* <div>
              <h3 className="text-lg font-semibold text-[#C4B5FD]">Newsletter</h3>
              <p className="mt-4 text-sm text-[#6B7280]">
                Stay updated with our latest articles and rewards.
              </p>
              {/* <div className="mt-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2 rounded-md bg-[#F9FAFB] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
                <Button 
                  className="w-full mt-2 bg-[#3B82F6] hover:bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] text-white"
                >
                  Subscribe
                </Button>
              </div> 
            </div> */}
          </div>
          <p className="mt-8 text-center text-sm text-[#6B7280]">
            © {new Date().getFullYear()} WritelyRewarded. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}