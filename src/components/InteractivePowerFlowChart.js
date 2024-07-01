import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/InteractivePowerFlowChart.css';
import { calculateSystemSize } from '../utils/calculateSystemSize';

const InteractivePowerFlowChart = ({
  systemSize,
  useSolarPanels,
  useGridPower,
  gridHours,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [gridStartHour, setGridStartHour] = useState(0);
  const [gridEndHour, setGridEndHour] = useState(24);
  const [solarCapacity, setSolarCapacity] = useState(5000);
  const [data, setData] = useState([]);

  const PEAK_SUN_HOURS = 5;
  const MAX_GRID_POWER = 4000; // 4kW per hour

  useEffect(() => {
    simulatePowerFlow();
  }, [gridHours, systemSize, useSolarPanels, useGridPower]);

  const simulatePowerFlow = () => {
    const newData = [];
    let batteryCharge = 0;

    for (let hour = 0; hour < 24; hour++) {
      const consumption = systemSize.totalConsumption / 24;
      let solar = 0;
      let grid = 0;
      let battery = 0;

      if (useSolarPanels && hour >= 6 && hour < 18) {
        const solarStrength = Math.sin((hour - 6) * Math.PI / 11);
        solar = solarCapacity * solarStrength;
      }

      if (useGridPower && hour >= (24 - gridHours)) {
        grid = MAX_GRID_POWER;
      }

      const totalPower = solar + grid;
      if (totalPower > consumption) {
        batteryCharge = Math.min(batteryCharge + (totalPower - consumption), systemSize.batteryCapacity);
      } else {
        const needed = consumption - totalPower;
        battery = Math.min(needed, batteryCharge);
        batteryCharge -= battery;
      }

      newData.push({
        hour,
        solar,
        grid,
        battery,
        consumption,
        batteryCharge
      });
    }

    setData(newData);
  };

  const handleInputChange = (setter) => (event) => {
    setter(Number(event.target.value));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`interactive-power-flow-chart ${isExpanded ? 'expanded' : ''}`}>
      <h2 onClick={toggleExpand}>
        Interactive Power Flow Chart
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </h2>
      {isExpanded && (
        <div className="chart-content">
          <div className="controls">
            <div className="control-group">
              <label>Grid Start Hour:</label>
              <input
                type="range"
                min="0"
                max="23"
                value={gridStartHour}
                onChange={handleInputChange(setGridStartHour)}
              />
              <span>{gridStartHour}:00</span>
            </div>
            <div className="control-group">
              <label>Grid End Hour:</label>
              <input
                type="range"
                min="1"
                max="24"
                value={gridEndHour}
                onChange={handleInputChange(setGridEndHour)}
              />
              <span>{gridEndHour}:00</span>
            </div>
            <div className="control-group">
              <label>Solar Capacity (W):</label>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={solarCapacity}
                onChange={handleInputChange(setSolarCapacity)}
              />
              <span>{solarCapacity}W</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="solar" stackId="1" stroke="#FFD700" fill="#FFD700" name="Solar" />
                <Area type="monotone" dataKey="grid" stackId="1" stroke="#00CED1" fill="#00CED1" name="Grid" />
                <Area type="monotone" dataKey="battery" stackId="1" stroke="#32CD32" fill="#32CD32" name="Battery" />
                <Area type="monotone" dataKey="consumption" stroke="#FF4500" fill="none" name="Consumption" />
                <Area type="monotone" dataKey="batteryCharge" stroke="#4169E1" fill="none" name="Battery Charge" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="summary">
            <h3>Power Flow Summary</h3>
            <p>Total Consumption: {(systemSize.totalConsumption / 1000).toFixed(2)} kWh</p>
            <p>Battery Capacity: {systemSize.batteryCapacity} Wh</p>
            <p>Use Solar Panels: {useSolarPanels ? 'Yes' : 'No'}</p>
            <p>Use Grid Power: {useGridPower ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractivePowerFlowChart;
