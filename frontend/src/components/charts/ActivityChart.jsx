import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const ActivityChart = ({ data }) => {
  const { theme } = useTheme()
  const stroke = theme === 'dark' ? '#60a5fa' : '#2563eb'
  const grid = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
          <YAxis tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
          <Tooltip wrapperStyle={{ zIndex: 1000 }} />
          <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ActivityChart
