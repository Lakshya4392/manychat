"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

type Props = {
  data: {
    day: string
    count: number
  }[]
}

const AnalyticsChart = ({ data }: Props) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-full w-full bg-white/[0.01] animate-pulse rounded-2xl" />

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '16px',
                color: '#000000',
                fontSize: '12px',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
            }}
            itemStyle={{ color: '#000000' }}
            cursor={{ stroke: '#000000', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.2 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#000000"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCount)"
            animationDuration={1500}
          />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#959595', fontSize: 10, fontWeight: 500 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis hide={true} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AnalyticsChart
