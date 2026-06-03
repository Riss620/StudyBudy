import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const COLORS_LIGHT = ['#60a5fa', '#7c3aed', '#34d399', '#f59e0b']
const COLORS_DARK = ['#93c5fd', '#c084fc', '#86efac', '#fbbf24']

const DiscussionChart = ({ data }) => {
  const { theme } = useTheme()
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label />
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DiscussionChart
