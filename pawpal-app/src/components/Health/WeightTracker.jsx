import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './WeightTracker.css'

export default function WeightTracker({ pet, records }) {
  const weightData = useMemo(() => {
    // In a real scenario, weight would be a specific record type or field.
    // Here we'll mock some data points to show the growth chart based on pet info.
    const baseWeight = pet.weight ? parseFloat(pet.weight) : 10;
    
    // Generate some mock history ending in current weight
    return [
      { date: 'Jan', weight: baseWeight * 0.8 },
      { date: 'Feb', weight: baseWeight * 0.85 },
      { date: 'Mar', weight: baseWeight * 0.9 },
      { date: 'Apr', weight: baseWeight * 0.95 },
      { date: 'May', weight: baseWeight }
    ];
  }, [pet]);

  const currentWeight = weightData[weightData.length - 1].weight;
  
  // Very rough mock of healthy range based on species
  const healthyRange = pet.species === 'Dog' ? [8, 12] : pet.species === 'Cat' ? [3, 5] : [0.5, 1.5];
  const isHealthy = currentWeight >= healthyRange[0] && currentWeight <= healthyRange[1];

  return (
    <div className="weight-tracker">
      <div className="weight-header">
        <h3>Growth & Weight Analytics</h3>
      </div>
      
      <div className="weight-stats">
        <div className={`weight-stat-box ${isHealthy ? 'healthy' : 'warning'}`}>
          <span className="label">Current Weight</span>
          <span className="value">{currentWeight.toFixed(1)} {pet.weightUnit || 'kg'}</span>
        </div>
        <div className="weight-stat-box">
          <span className="label">Healthy Range (Est.)</span>
          <span className="value">{healthyRange[0]} - {healthyRange[1]} {pet.weightUnit || 'kg'}</span>
        </div>
        <div className="weight-stat-box">
          <span className="label">Status</span>
          <span className="value">{isHealthy ? 'Optimal' : 'Needs Review'}</span>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ background: '#2c2c2c', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#88d4b4' }}
            />
            <Line type="monotone" dataKey="weight" stroke="#88d4b4" strokeWidth={3} dot={{ r: 4, fill: '#88d4b4' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
