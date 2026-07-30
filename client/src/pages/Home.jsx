import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, ArrowRight, Activity, HeartPulse, UserCircle, 
  ShieldCheck, Clock, Sparkles, Award, Users, Building2, CheckCircle2, 
  ChevronDown, Star, MessageSquare, PhoneCall, CalendarCheck, FileText,
  Stethoscope, Brain, Baby, Bone, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('name', searchTerm);
    if (city) params.append('city', city);
    navigate(`/search?${params.toString()}`);
  };

  const specialities = [
    { name: 'Cardiology', desc: 'Heart & vascular health experts', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'hover:border-rose-300 dark:hover:border-rose-700' },
    { name: 'Neurology', desc: 'Brain & nervous system specialists', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'hover:border-violet-300 dark:hover:border-violet-700' },
    { name: 'Pediatrics', desc: 'Care for newborns, kids & teens', icon: Baby, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'hover:border-amber-300 dark:hover:border-amber-700' },
    { name: 'Dental Care', desc: 'Comprehensive oral & dental health', icon: Stethoscope, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'hover:border-cyan-300 dark:hover:border-cyan-700' },
    { name: 'Orthopedics', desc: 'Bone, joint & muscle care', icon: Bone, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
    { name: 'Dermatology', desc: 'Skin, hair & cosmetic care', icon: Sparkle, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'hover:border-pink-300 dark:hover:border-pink-700' }
  ];

  const features = [
    { icon: ShieldCheck, title: 'Verified Medical Experts', desc: 'Every practitioner on our network undergoes rigorous credential verification.' },
    { icon: CalendarCheck, title: 'Real-Time Booking', desc: 'Select exact consultation slots with instant booking confirmation.' },
    { icon: Sparkles, title: '24/7 Gemini AI Assistant', desc: 'Get intelligent symptom guidance and preliminary health info anytime.' },
    { icon: FileText, title: 'Digital Health Records', desc: 'Access your full medical history, prescriptions, and reports securely.' }
  ];

  const services = [
    { title: 'In-Person Clinic Visit', desc: 'Book direct face-to-face appointments with top specialists at premier clinics.', tag: 'Popular', icon: Building2 },
    { title: 'Video Consultation', desc: 'Consult with board-certified doctors remotely from the comfort of your home.', tag: 'Instant', icon: PhoneCall },
    { title: 'AI Health Assessment', desc: 'Get instant clinical context and recommended specialists powered by Google Gemini.', tag: 'AI Powered', icon: Sparkles },
    { title: 'Prescription & Records', desc: 'Download digitally signed medical reports and prescriptions anytime.', tag: 'Secure', icon: FileText }
  ];

  const faqs = [
    { q: 'How do I book an appointment?', a: 'Sign in to your patient account, search for doctors by specialty or location, select an available date and time slot, and confirm your booking instantly.' },
    { q: 'Can I consult doctors online via video call?', a: 'Yes! We support both in-person clinic visits and remote video consultations with verified medical specialists.' },
    { q: 'Is my medical data secure and private?', a: 'Absolutely. We utilize industry-standard JWT authentication, NoSQL injection protection, and encrypted records storage following strict healthcare security standards.' },
    { q: 'How does the Gemini AI Health Assistant work?', a: 'Our built-in AI assistant helps summarize your symptoms and suggest appropriate medical specialities to guide your doctor booking process.' }
  ];

  const hospitals = [
    'Apollo Hospitals', 'Fortis Healthcare', 'Max Healthcare', 'Manipal Hospitals', 'Medanta Health'
  ];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-primary-50/70 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 overflow-hidden">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & CTA */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-cyan-950/60 border border-primary-200 dark:border-cyan-800/50 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-cyan-400 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wide uppercase text-primary-700 dark:text-cyan-300">
                  Next-Gen Healthcare Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Book Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-cyan-500 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400">Doctors Online</span> Effortlessly.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
                Connect with verified medical specialists, book real-time appointments, and manage your health records in one secure, seamless platform.
              </p>

              {/* Search Form Preview */}
              <form 
                onSubmit={handleSearchSubmit} 
                className="bg-white/80 dark:bg-darkcard/80 backdrop-blur-xl p-3 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-darkborder space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
              >
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-darksurface rounded-2xl border border-slate-100 dark:border-darkborder">
                  <Search className="w-5 h-5 text-primary-600 dark:text-cyan-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Specialty, symptoms, condition..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-darksurface rounded-2xl border border-slate-100 dark:border-darkborder">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="City or locality" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-700 hover:to-cyan-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shrink-0 text-sm"
                >
                  Find Doctors <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Action Buttons & Trust Indicator */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/search')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-0.5 text-sm"
                >
                  Browse All Doctors
                </button>
                <a
                  href="#how-it-works"
                  className="bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder hover:bg-slate-50 dark:hover:bg-darksurface text-slate-700 dark:text-slate-200 font-bold px-7 py-3.5 rounded-2xl transition-all text-sm"
                >
                  Learn How It Works
                </a>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-950">A</div>
                  <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-950">S</div>
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-950">R</div>
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-950">M</div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Trusted by <span className="font-extrabold text-slate-800 dark:text-white">50,000+ patients</span> across India
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Illustration & Floating Badges */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Hero Illustration Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-darkborder bg-gradient-to-br from-primary-600 via-cyan-600 to-emerald-600 p-1">
                  <div className="bg-white dark:bg-darkcard rounded-[22px] p-6 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkborder pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 flex items-center justify-center font-black text-xl">
                          🩺
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Verified Specialist</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Available Today for Booking</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder">
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Rating</div>
                        <div className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 / 5.0
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder">
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Consultation</div>
                        <div className="text-lg font-black text-slate-800 dark:text-white mt-1">
                          In-Clinic & Video
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950/30 border border-primary-100 dark:border-cyan-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Sparkles className="w-4 h-4 text-primary-600 dark:text-cyan-400" /> AI Health Assistant Active
                      </div>
                      <span className="text-[10px] uppercase font-extrabold text-primary-600 dark:text-cyan-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">Live</span>
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badges */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -left-6 bg-white/90 dark:bg-darkcard/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-darkborder hidden sm:flex items-center gap-3 z-20"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Instant Booking</div>
                    <div className="text-[10px] text-slate-500 font-medium">Zero Waiting Time</div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -right-6 bg-white/90 dark:bg-darkcard/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-darkborder hidden sm:flex items-center gap-3 z-20"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">100% Verified</div>
                    <div className="text-[10px] text-slate-500 font-medium">Board Certified Doctors</div>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* STATISTICS IMPACT BAR */}
      <section className="py-12 bg-white dark:bg-darkcard border-y border-slate-200/80 dark:border-darkborder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-primary-600 dark:text-cyan-400">50,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Happy Patients</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">500+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Verified Doctors</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-violet-600 dark:text-violet-400">120+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Partner Hospitals</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-500">99.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SPECIALITIES */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary-600 dark:text-cyan-400 font-extrabold text-xs tracking-widest uppercase">Expert Medical Care</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Specialities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
              Find experienced specialists across major clinical disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialities.map((spec, index) => {
              const Icon = spec.icon;
              return (
                <motion.div
                  key={spec.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => navigate(`/search?specialization=${spec.name}`)}
                  className={`bg-white dark:bg-darkcard p-8 rounded-3xl border border-slate-200/80 dark:border-darkborder hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between ${spec.border}`}
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl ${spec.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${spec.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-cyan-400 transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                      {spec.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-primary-600 dark:text-cyan-400 text-xs font-extrabold group-hover:gap-2 transition-all">
                    Browse Specialists <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 bg-white dark:bg-darkcard border-y border-slate-200/80 dark:border-darkborder" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs tracking-widest uppercase">Platform Excellence</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Why Choose MediCare Platform?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
              Engineered with advanced technology and strict clinical standards for patients and doctors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-slate-50/60 dark:bg-darksurface p-8 rounded-3xl border border-slate-200/80 dark:border-darkborder hover:border-primary-300 dark:hover:border-slate-700 transition-all duration-300 space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-darkcard text-primary-600 dark:text-cyan-400 flex items-center justify-center shadow-md border border-slate-100 dark:border-darkborder">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OUR SERVICES */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-xs tracking-widest uppercase">Comprehensive Healthcare</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Our Core Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
              Flexible consultation modes designed to fit your busy schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div key={idx} className="bg-white dark:bg-darkcard p-8 rounded-3xl border border-slate-200/80 dark:border-darkborder shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                        {srv.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{srv.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">{srv.desc}</p>
                  </div>

                  <button
                    onClick={() => navigate('/search')}
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-cyan-400 font-bold text-xs group-hover:translate-x-1 transition-transform"
                  >
                    Explore Service <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-darkcard border-y border-slate-200/80 dark:border-darkborder" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary-600 dark:text-cyan-400 font-extrabold text-xs tracking-widest uppercase">Seamless Process</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              How It Works in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              { step: '01', title: 'Find Your Doctor', desc: 'Filter board-certified doctors by specialty, rating, experience, or city location.' },
              { step: '02', title: 'Choose Date & Slot', desc: 'Select a convenient consultation time slot that fits your schedule.' },
              { step: '03', title: 'Consult & Download', desc: 'Meet your practitioner and access your digitally signed prescriptions and reports.' }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 font-black text-2xl flex items-center justify-center mx-auto border border-primary-100 dark:border-cyan-800/50 shadow-md">
                  {item.step}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP HOSPITALS PARTNER BAR */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Trusted Partner Hospitals & Clinical Networks</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70">
            {hospitals.map(h => (
              <span key={h} className="text-base sm:text-lg font-black text-slate-600 dark:text-slate-400 tracking-tight">
                🏥 {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white dark:bg-darkcard border-t border-slate-200/80 dark:border-darkborder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-amber-500 font-extrabold text-xs tracking-widest uppercase">Patient Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Trusted by Thousands of Patients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Sharma', role: 'Verified Patient', review: 'Booking a cardiologist was quick and seamless. The real-time slot selection worked flawlessly!', rating: 5 },
              { name: 'Priya Patel', role: 'Verified Patient', review: 'The AI health assistant helped me understand which specialist to consult. Highly recommended platform!', rating: 5 },
              { name: 'Amit Verma', role: 'Verified Patient', review: 'Downloading my digital prescriptions and consultation history after the visit was super convenient.', rating: 5 }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-50/70 dark:bg-darksurface p-8 rounded-3xl border border-slate-200/80 dark:border-darkborder space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium italic leading-relaxed">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-darkborder flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{t.role}</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-primary-600 dark:text-cyan-400 font-extrabold text-xs tracking-widest uppercase">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-darkcard rounded-2xl border border-slate-200/80 dark:border-darkborder overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center gap-4 text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-primary-600' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-darkborder pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-cyan-600 to-emerald-600 text-white relative overflow-hidden" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to Take Control of Your Health Journey?
          </h2>
          <p className="text-primary-100 text-base max-w-xl mx-auto font-medium">
            Sign up now to book appointments with top-rated doctors in your city within minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-primary-700 font-extrabold px-8 py-4 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all text-sm hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </button>
            <button
              onClick={() => navigate('/search')}
              className="bg-primary-700/60 border border-white/30 text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-primary-700 transition-all text-sm"
            >
              Search Doctors
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
