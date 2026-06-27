'use client';

import { motion } from 'framer-motion';

export default function DashboardPreview() {
  return (
    <section id="reports" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-DEFAULT/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full glass border border-gold-DEFAULT/30 text-gold-DEFAULT text-sm font-semibold mb-6">
            Platform Preview
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Dashboard</span> Preview
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            Intuitive analytics and real-time monitoring at your fingertips
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="glass rounded-3xl overflow-hidden border border-gold-DEFAULT/20 p-2 shadow-2xl">
            {/* Browser header */}
            <div className="bg-slate-900/80 px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-block px-4 py-1 bg-slate-800/50 rounded-md text-xs text-gray-400">
                  app.goldplan.ai/dashboard
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl p-6 lg:p-8">
              {/* Top stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-xl p-4 border border-gold-DEFAULT/20 hover:border-gold-DEFAULT/40 transition-smooth">
                  <div className="text-xs text-gray-400 mb-1">Gold Spot Price</div>
                  <div className="text-xl lg:text-2xl font-bold gradient-text">$2,048.50</div>
                  <div className="text-xs text-emerald-DEFAULT mt-1">+2.5% today</div>
                </div>
                <div className="glass rounded-xl p-4 border border-emerald-DEFAULT/20 hover:border-emerald-DEFAULT/40 transition-smooth">
                  <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                  <div className="text-xl lg:text-2xl font-bold text-emerald-DEFAULT">$8.2T</div>
                  <div className="text-xs text-gray-400 mt-1">Global gold market</div>
                </div>
                <div className="glass rounded-xl p-4 border border-blue-400/20 hover:border-blue-400/40 transition-smooth">
                  <div className="text-xs text-gray-400 mb-1">Trading Volume</div>
                  <div className="text-xl lg:text-2xl font-bold text-blue-400">$124B</div>
                  <div className="text-xs text-gray-400 mt-1">24h volume</div>
                </div>
                <div className="glass rounded-xl p-4 border border-purple-400/20 hover:border-purple-400/40 transition-smooth">
                  <div className="text-xs text-gray-400 mb-1">Portfolio Value</div>
                  <div className="text-xl lg:text-2xl font-bold gradient-text">$847K</div>
                  <div className="text-xs text-emerald-DEFAULT mt-1">+12.3% YTD</div>
                </div>
              </div>

              {/* Main chart area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <div className="glass rounded-xl p-6 border border-white/5 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Gold Price Trend</div>
                        <div className="text-lg font-bold text-white">Last 30 Days</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-gold-DEFAULT/20 text-gold-DEFAULT px-3 py-1 rounded-full">1D</span>
                        <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">1W</span>
                        <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">1M</span>
                        <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">1Y</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between h-40 gap-1">
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => (
                        <div key={month} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${40 + Math.random() * 60}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="w-full gradient-gold rounded-t-md"
                          />
                          <span className="text-[10px] text-gray-500">{month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Portfolio allocation */}
                <div className="glass rounded-xl p-6 border border-white/5">
                  <div className="text-sm text-gray-400 mb-4">Portfolio Allocation</div>
                  <div className="space-y-4">
                    {[
                      { label: 'Gold & Precious Metals', value: '45%', color: '#D4AF37' },
                      { label: 'Equities', value: '35%', color: '#10B981' },
                      { label: 'Fixed Income', value: '20%', color: '#60A5FA' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="font-bold text-white">{item.value}</span>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: item.value }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: item.color, width: item.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-400 mb-1">Total Portfolio</div>
                    <div className="text-lg font-bold gradient-text">$847,234</div>
                    <div className="text-xs text-emerald-DEFAULT mt-1">+12.3% this year</div>
                  </div>
                </div>
              </div>

              {/* Bottom data table */}
              <div className="glass rounded-xl border border-white/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="text-sm font-semibold text-white">Recent Transactions</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-6 py-3 text-gray-400 font-medium">Asset</th>
                        <th className="text-left px-6 py-3 text-gray-400 font-medium">Type</th>
                        <th className="text-right px-6 py-3 text-gray-400 font-medium">Amount</th>
                        <th className="text-right px-6 py-3 text-gray-400 font-medium">Value</th>
                        <th className="text-right px-6 py-3 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { asset: 'Gold XAU/USD', type: 'Buy', amount: '50 oz', value: '$102,425', status: 'Completed', color: 'emerald' },
                        { asset: 'Silver XAG/USD', type: 'Buy', amount: '200 oz', value: '$4,800', status: 'Completed', color: 'emerald' },
                        { asset: 'Gold Futures', type: 'Sell', amount: '25 contracts', value: '$51,212', status: 'Pending', color: 'yellow' },
                        { asset: 'Platinum', type: 'Buy', amount: '100 oz', value: '$92,000', status: 'Completed', color: 'emerald' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-smooth">
                          <td className="px-6 py-4 text-white font-medium">{row.asset}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              row.type === 'Buy' ? 'bg-emerald-DEFAULT/20 text-emerald-DEFAULT' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-300">{row.amount}</td>
                          <td className="px-6 py-4 text-right font-semibold text-white">{row.value}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              row.status === 'Completed' ? 'bg-emerald-DEFAULT/20 text-emerald-DEFAULT' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-gold-DEFAULT/20 via-emerald-DEFAULT/10 to-transparent rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}