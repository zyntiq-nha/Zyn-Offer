'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, Role, Tenure } from '@/lib/supabase'
import { GraduationCap, Briefcase, Clock, Award, Users, TrendingUp, Shield, Globe, Settings, CheckCircle, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export default function LandingPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [tenures, setTenures] = useState<Tenure[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesResponse, tenuresResponse] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('tenures').select('*').order('months')
      ])

      if (rolesResponse.data) setRoles(rolesResponse.data)
      if (tenuresResponse.data) setTenures(tenuresResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set default data if Supabase fails
      setRoles([
        { id: '1', name: 'Sales & Marketing', code: 'SM', created_at: new Date().toISOString() },
        { id: '2', name: 'Talent Acquisition', code: 'TA', created_at: new Date().toISOString() },
        { id: '3', name: 'Talent Acquisition Sales & Marketing Combined', code: 'TASM', created_at: new Date().toISOString() }
      ])
      setTenures([
        { id: '1', label: '1 Month', months: 1, created_at: new Date().toISOString() },
        { id: '2', label: '2 Months', months: 2, created_at: new Date().toISOString() },
        { id: '3', label: '4 Months', months: 4, created_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar merged with hero */}
      <nav className="relative z-10 w-full py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-16 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="relative w-28 sm:w-36 lg:w-40 h-10 lg:h-12 min-w-0">
            <Image
              src="/premiumlogo.png"
              alt="Zyntiq Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 160px"
            />
          </div>

          {/* Menu Button - All Devices */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-300 hover:text-[#93cfe2] transition-colors duration-300 rounded-lg hover:bg-slate-800/60"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Compact Dropdown Menu - All Devices */}
        {mobileMenuOpen && (
          <div className="absolute top-full right-4 md:right-8 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-xl z-20">
            <div className="py-2 min-w-[180px]">
              <button
                onClick={() => { router.push('/admin/login'); setMobileMenuOpen(false) }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="px-4 overflow-x-hidden min-h-screen flex items-center pt-16 sm:pt-20 md:pt-8 -mt-10 lg:mt-0">
        <div className="max-w-7xl mx-auto w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden min-w-0">
            {/* Left Side - Content */}
            <motion.div
              className="space-y-8 min-w-0"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div className="space-y-6 break-words" variants={fadeInUp}>
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                  variants={fadeInUp}
                >
                  Build Your Future with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93cfe2] via-[#93cfe2] to-[#93cfe2]">
                    Zyntiq
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-300 leading-relaxed max-w-xl break-words"
                  variants={fadeInUp}
                >
                  Join our comprehensive internship and career development programs.
                  Gain real-world experience, professional mentorship, and the skills
                  that top companies are looking for.
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <button
                  onClick={() => router.push('/apply')}
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#93cfe2] to-[#93cfe2] hover:from-[#7ec5db] hover:to-[#7ec5db] text-slate-900 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[rgba(147,207,226,0.25)] flex items-center justify-center"
                >
                  <span>Register Now</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              className="relative w-full h-[300px] sm:h-[440px] lg:h-[800px] flex items-center justify-center min-w-0"
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
            >
              <Image
                src="/desk.png"
                alt="Professional workspace - Join Zyntiq career development"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <motion.section
        id="about"
        className="py-20 px-4 bg-slate-800/30 overflow-x-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-w-0">
            <motion.div
              className="space-y-6 min-w-0"
              variants={staggerContainer}
            >


              <motion.h2
                className="text-3xl md:text-4xl font-bold text-white"
                variants={fadeInUp}
              >
                Empowering the Next Generation of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93cfe2] to-[#93cfe2]">
                  Professionals
                </span>
              </motion.h2>

              <motion.p
                className="text-lg text-slate-300 leading-relaxed"
                variants={fadeInUp}
              >
                At Zyntiq, we bridge the gap between academic learning and professional excellence.
                Our comprehensive programs are designed to provide hands-on experience, industry insights,
                and the practical skills that today&apos;s employers demand.
              </motion.p>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
              >
                <motion.div
                  className="flex items-start space-x-3"
                  variants={fadeInLeft}
                >
                  <div className="w-6 h-6 bg-[#93cfe2] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Industry-Relevant Training</h4>
                    <p className="text-slate-400">Learn skills that are in high demand across various industries</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  variants={fadeInLeft}
                >
                  <div className="w-6 h-6 bg-[#93cfe2] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Expert Mentorship</h4>
                    <p className="text-slate-400">Get guidance from experienced professionals in your field</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  variants={fadeInLeft}
                >
                  <div className="w-6 h-6 bg-[#93cfe2] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Career Placement Support</h4>
                    <p className="text-slate-400">Comprehensive support to help you land your dream job</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-6 min-w-0"
              variants={staggerContainer}
            >
              <motion.div
                className="bg-gradient-to-br from-[#93cfe2]/20 to-[#93cfe2]/10 border border-[#93cfe2]/30 rounded-2xl p-6 text-center"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-slate-300">Professionals Trained</div>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-[#93cfe2]/20 to-[#93cfe2]/10 border border-[#93cfe2]/30 rounded-2xl p-6 text-center"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <div className="text-slate-300">Success Rate</div>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-[#93cfe2]/20 to-[#93cfe2]/10 border border-[#93cfe2]/30 rounded-2xl p-6 text-center"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-slate-300">Partner Companies</div>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-[#93cfe2]/20 to-[#93cfe2]/10 border border-[#93cfe2]/30 rounded-2xl p-6 text-center"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-slate-300">Support Available</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Available Positions */}
      <motion.section
        id="programs"
        className="py-20 px-4 overflow-x-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16 break-words"
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Available Opportunities
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Choose from our carefully designed programs that match your career goals
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#93cfe2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-w-0"
              variants={staggerContainer}
            >
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-[#93cfe2]/50 transition-all duration-300 group hover:transform hover:scale-105"
                  variants={scaleIn}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#93cfe2] to-[#93cfe2] rounded-xl flex items-center justify-center mr-4 group-hover:shadow-lg group-hover:shadow-[rgba(147,207,226,0.25)] transition-all duration-300">
                      {index === 0 && <Briefcase className="w-7 h-7 text-white" />}
                      {index === 1 && <TrendingUp className="w-7 h-7 text-white" />}
                      {index === 2 && <Globe className="w-7 h-7 text-white" />}
                      {index > 2 && <Award className="w-7 h-7 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#93cfe2] transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-slate-400">Position Code: {role.code}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-slate-300">
                      <Clock className="w-5 h-5 mr-3 text-[#93cfe2]" />
                      <span>Flexible Duration Options</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Users className="w-5 h-5 mr-3 text-[#93cfe2]" />
                      <span>Collaborative Environment</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <GraduationCap className="w-5 h-5 mr-3 text-[#93cfe2]" />
                      <span>Professional Mentorship</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Award className="w-5 h-5 mr-3 text-[#93cfe2]" />
                      <span>Industry Recognition</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/apply')}
                    className="w-full py-3 bg-slate-700 hover:bg-[#93cfe2] text-white font-semibold rounded-xl transition-all duration-300 group-hover:bg-[#93cfe2] hover:text-slate-900"
                  >
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Program Durations */}
      <motion.section
        id="durations"
        className="py-20 px-4 bg-slate-800/30 overflow-x-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div className="min-w-0" variants={staggerContainer}>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                variants={fadeInLeft}
              >
                Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93cfe2] to-[#93cfe2]">Durations</span>
              </motion.h3>
              <motion.p
                className="text-slate-300 mb-8 max-w-xl"
                variants={fadeInLeft}
              >
                Pick a duration that fits your schedule. All options include mentorship, deliverables, and a completion letter.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 mb-8"
                variants={staggerContainer}
              >
                {tenures.map((tenure) => (
                  <motion.div
                    key={tenure.id}
                    className="px-5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-full text-slate-200 hover:border-[#93cfe2]/60 hover:text-white transition-colors"
                    variants={scaleIn}
                  >
                    {tenure.label}
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-300"
                  variants={scaleIn}
                >
                  <div className="text-white font-semibold mb-1">Guided</div>
                  <div className="text-sm">Weekly mentor check-ins</div>
                </motion.div>
                <motion.div
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-300"
                  variants={scaleIn}
                >
                  <div className="text-white font-semibold mb-1">Hands-on</div>
                  <div className="text-sm">Real deliverables to ship</div>
                </motion.div>
                <motion.div
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-300"
                  variants={scaleIn}
                >
                  <div className="text-white font-semibold mb-1">Certificate</div>
                  <div className="text-sm">Letter upon completion</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center min-w-0"
              variants={fadeInRight}
            >
              <Image
                src="/dec.png"
                alt="Program durations"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Removed Call to Action section as requested */}

      {/* Removed Contact section as requested */}

    </div>
  )
}
