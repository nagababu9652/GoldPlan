'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="contact-page">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 008 &middot; Contact</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Let&rsquo;s <em>talk</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Have a question? Want to book a consultation? We&rsquo;d love to hear from you.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-7">
              {submitted ? (
                <div className="border border-obsidian bg-bone p-8 lg:p-10 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h2 className="font-serif text-[28px] leading-tight mb-3">Thank you!</h2>
                  <p className="text-ash text-[15px]">We&rsquo;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <div className="border border-obsidian bg-bone p-8 lg:p-10">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-[13px] font-medium mb-2">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:border-obsidian focus:outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[13px] font-medium mb-2">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:border-obsidian focus:outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[13px] font-medium mb-2">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:border-obsidian focus:outline-none transition-colors"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-[13px] font-medium mb-2">Message</label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-4 py-3 border border-line bg-bone text-[14px] focus:border-obsidian focus:outline-none transition-colors resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <button type="submit" className="btn-obsidian w-full justify-center">
                      Send Message <ArrowRight size={14} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="border border-obsidian bg-bone p-6 lg:p-8 space-y-6">
                <div>
                  <div className="label-mono text-ash mb-3">Contact Info</div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[13px] font-medium">Email</div>
                        <div className="text-[13px] text-ash">hello@finplan.in</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[13px] font-medium">Phone</div>
                        <div className="text-[13px] text-ash">+91 40 6789 0123</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[13px] font-medium">Office</div>
                        <div className="text-[13px] text-ash">Financial District, Gachibowli, Hyderabad</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[13px] font-medium">Hours</div>
                        <div className="text-[13px] text-ash">Mon–Sat, 9:00 AM – 6:00 PM IST</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <div className="label-mono text-ash mb-3">Free Consultation</div>
                  <p className="text-[13px] text-ash leading-relaxed mb-4">
                    Book a complimentary 30-minute session with a SEBI-registered advisor.
                  </p>
                  <button className="btn-outline w-full justify-center text-[13px]">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}