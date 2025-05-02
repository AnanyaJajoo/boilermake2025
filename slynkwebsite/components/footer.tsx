"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { ShineBorder } from "@/components/ui/shine-border"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <footer className="py-16 px-6 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full bg-pink-200/20 blur-[100px]"
          style={{ top: '10%', left: '5%' }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full bg-purple-200/20 blur-[100px]"
          style={{ bottom: '5%', right: '5%' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <ShineBorder className="max-w-6xl mx-auto relative z-10" borderClassName="rounded-2xl overflow-hidden">
        <motion.div 
          className="p-8 rounded-2xl framer-card"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <motion.div variants={item} className="space-y-6">
              <div>
                <h3 className="font-bold text-xl mb-4 framer-gradient-text">Slynk</h3>
                <p className="text-gray-600">
                  Transform static content into engaging, conversational experiences with AI-driven avatars.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="text-sm text-gray-500 mb-2">Stay in touch with us:</div>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-xl border border-gray-100 p-2 shadow-sm">
                  <Mail className="h-4 w-4 text-gray-400 ml-2" />
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="bg-transparent border-0 text-sm flex-1 focus:outline-none text-gray-700"
                  />
                  <motion.button 
                    className="bg-gray-900 text-white rounded-lg p-2 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <motion.div key={i} whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }}>
                    <Link href="#" className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                      <Icon className="h-5 w-5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {[
              { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
              { title: "Resources", links: ["Documentation", "Help Center", "API Reference", "Community"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"] }
            ].map((section, i) => (
              <motion.div key={i} variants={item}>
                <h3 className="font-bold text-lg mb-4 text-gray-900">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <motion.li key={j} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors flex items-center">
                        {link}
                        <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div variants={item} className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>&copy; {currentYear} Slynk. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="#" className="hover:text-pink-500 transition-colors">Status</Link>
              <Link href="#" className="hover:text-pink-500 transition-colors">Sitemap</Link>
              <Link href="#" className="hover:text-pink-500 transition-colors">Accessibility</Link>
            </div>
          </motion.div>
        </motion.div>
      </ShineBorder>
    </footer>
  )
}