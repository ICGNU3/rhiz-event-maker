'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Download, Share2, Target, BarChart2 } from 'lucide-react';
import { 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { DashboardMetrics } from '@/lib/services/dashboard';

export default function DashboardClient({ data }: { data: DashboardMetrics }) {
  const { kpi, charts } = data;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Event Intelligence
              </h1>
              <p className="text-xs text-neutral-500">Convergence Summit 2025</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
               <Download className="w-4 h-4" />
               <span>Export Report</span>
             </button>
             <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium">
               <Share2 className="w-4 h-4" />
               <span>Values</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-24 space-y-8 pb-20">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard 
            title="Pipeline Generated" 
            value={kpi.pipelineValue} 
            trend="+18%" 
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            color="green"
          />
          <KpiCard 
            title="Meetings Booked" 
            value={kpi.meetingsBooked.toString()} 
            trend="98% Cap" 
            icon={<Users className="w-5 h-5 text-blue-400" />}
            color="blue"
          />
          <KpiCard 
            title="NPS Score" 
            value={kpi.npsScore.toString()} 
            trend="Excellent" 
            icon={<Target className="w-5 h-5 text-purple-400" />}
            color="purple"
          />
          <KpiCard 
            title="Sessions Attended" 
            value={kpi.sessionsAttended.toLocaleString()} 
            trend="Avg 4.2/p" 
            icon={<BarChart2 className="w-5 h-5 text-orange-400" />}
            color="orange"
          />
        </div>

        {/* Main Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Line Chart: Pipeline Velocity */}
          <div className="lg:col-span-2 bg-neutral-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-200">Pipeline Velocity</h3>
                <p className="text-sm text-neutral-500">Real-time estimated deal value created</p>
              </div>
              <div className="flex gap-2">
                 {['1H', '24H', 'ALL'].map((tf) => (
                   <button key={tf} className="text-xs font-medium px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400">
                     {tf}
                   </button>
                 ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.pipelineVelocity}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <XAxis dataKey="time" stroke="#404040" tick={{fill: '#737373', fontSize: 12}} />
                  <YAxis stroke="#404040" tick={{fill: '#737373', fontSize: 12}} tickFormatter={(value) => `$${value}M`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Attendee Mix */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-2">Attendee Mix</h3>
            <p className="text-sm text-neutral-500 mb-6">Breakdown by primary role</p>
            
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={charts.attendeeMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.attendeeMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '8px' }} />
                </RePieChart>
              </ResponsiveContainer>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <div className="text-2xl font-bold text-white">45%</div>
                   <div className="text-xs text-neutral-500">Founders</div>
                 </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {charts.attendeeMix.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Bar Chart: Topic Resonance */}
           <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-200">Topic Resonance</h3>
                <TrendingUp className="w-4 h-4 text-neutral-500" />
             </div>
             <div className="space-y-4">
                {charts.topicResonance.map((topic, i) => (
                  <div key={topic.name} className="group cursor-pointer">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-300 group-hover:text-white transition-colors">{topic.name}</span>
                      <span className="text-neutral-500">{topic.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
             </div>
           </div>

           {/* Meeting Matrix (Simple Viz) */}
           <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-neutral-200">Meeting Flow</h3>
               <Users className="w-4 h-4 text-neutral-500" />
             </div>
             
             <div className="space-y-4">
               {charts.meetingFlow.map((data, i) => (
                 <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="flex items-center gap-3">
                     <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{data.source}</span>
                     <ArrowLeft className="w-3 h-3 text-neutral-600 rotate-180" />
                     <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{data.target}</span>
                   </div>
                   <div className="font-mono text-sm font-semibold text-neutral-300">
                     {data.value} <span className="text-[10px] text-neutral-600 font-normal">MTGS</span>
                   </div>
                 </div>
               ))}
               <div className="p-3 text-center">
                 <button className="text-xs text-neutral-400 hover:text-white transition-colors border-b border-dashed border-neutral-700 hover:border-white">
                   View Full Connection Graph
                 </button>
               </div>
             </div>
           </div>

        </div>

      </main>
    </div>
  );
}

function KpiCard({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: 'blue' | 'green' | 'purple' | 'orange' }) {
  const colorStyles = {
    blue: 'bg-blue-500/10 border-blue-500/10 group-hover:border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/10 group-hover:border-green-500/20',
    purple: 'bg-purple-500/10 border-purple-500/10 group-hover:border-purple-500/20',
    orange: 'bg-orange-500/10 border-orange-500/10 group-hover:border-orange-500/20',
  };

  return (
    <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-2xl hover:bg-neutral-900/80 transition-all hover:border-white/10 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg transition-colors ${colorStyles[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-neutral-500 py-1 px-2 rounded-full bg-white/5">
          {trend}
        </span>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1 group-hover:scale-105 origin-left transition-transform">{value}</div>
        <div className="text-sm text-neutral-400">{title}</div>
      </div>
    </div>
  );
}
