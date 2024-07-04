import React, { useState, useEffect } from 'react';
import { calculateSystemSize } from '../utils/calculateSystemSize';
import '../styles/ApplianceList.css';

const roomAppliances = {
  Lights: [
    { name: 'Inside LED Light Bulb', power: 10, defaultMinutes: 480 },
    { name: 'Outside Light', power: 30, defaultMinutes: 480 },
  ],
  Kitchen: [
    { name: 'Refrigerator', power: 150, maxPower: 600, defaultMinutes: 1440 },
    { name: 'Microwave', power: 1000, maxPower: 1500, defaultMinutes: 30 },
    { name: 'Electric Oven', power: 2400, maxPower: 3000, defaultMinutes: 60 },
    { name: 'Dishwasher', power: 1200, maxPower: 1800, defaultMinutes: 60 },
    { name: 'Coffee Maker', power: 1000, defaultMinutes: 30 },
    { name: 'Toaster', power: 850, defaultMinutes: 10 },
    { name: 'Electric Kettle', power: 1500, defaultMinutes: 20 },
  ],
  LivingRoom: [
    { name: 'LED TV (55")', power: 60, defaultMinutes: 240 },
    { name: 'Cable Box', power: 30, defaultMinutes: 240 },
    { name: 'Gaming Console', power: 150, defaultMinutes: 120 },
    { name: 'Ceiling Fan', power: 60, defaultMinutes: 480 },
    { name: 'Air Conditioner', power: 1000, maxPower: 2200, defaultMinutes: 480 },
  ],
  Bedroom: [
    { name: 'Ceiling Fan', power: 60, defaultMinutes: 480 },
    { name: 'Air Conditioner', power: 1000, maxPower: 2200, defaultMinutes: 480 },
    { name: 'Laptop', power: 50, defaultMinutes: 240 },
    { name: 'Phone Charger', power: 5, defaultMinutes: 480 },
    { name: 'Bedside Lamp', power: 40, defaultMinutes: 120 },
  ],
  Bathroom: [
    { name: 'Hair Dryer', power: 1500, defaultMinutes: 10 },
    { name: 'Electric Toothbrush Charger', power: 5, defaultMinutes: 1440 },
    { name: 'Electric Shaver', power: 15, defaultMinutes: 10 },
  ],
  LaundryRoom: [
    { name: 'Washing Machine', power: 500, defaultMinutes: 60 },
    { name: 'Clothes Dryer', power: 3000, defaultMinutes: 60 },
    { name: 'Iron', power: 1000, defaultMinutes: 30 },
  ],
  HomeOffice: [
    { name: 'Desktop Computer', power: 200, defaultMinutes: 240 },
    { name: 'Monitor', power: 30, defaultMinutes: 240 },
    { name: 'Printer', power: 50, defaultMinutes: 10 },
    { name: 'Router', power: 10, defaultMinutes: 1440 },
  ],
  Garage: [
    { name: 'Garage Door Opener', power: 400, defaultMinutes: 5 },
    { name: 'Power Tools (avg)', power: 1000, defaultMinutes: 30 },
  ],
  Other: [],
};

const ApplianceList = ({ appliances, addAppliance, updateAppliance, removeAppliance }) => {
  const [selectedAppliances, setSelectedAppliances] = useState({});
  const [newAppliance, setNewAppliance] = useState({ name: '', power: '', hoursPerDay: '' });
  const [newlyAddedAppliance, setNewlyAddedAppliance] = useState(null);
  const [visibleSections, setVisibleSections] = useState(Object.keys(roomAppliances));
  const [batteryUsageHours, setBatteryUsageHours] = useState(12);
  const [useSolarPanels, setUseSolarPanels] = useState(false);
  const [useGridPower, setUseGridPower] = useState(false);
  const [gridHours, setGridHours] = useState(12);
  const [batteryCapacity, setBatteryCapacity] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [systemSize, setSystemSize] = useState({});
  const [powerSources, setPowerSources] = useState([]);

  const [inverterSize, setInverterSize] = useState(0);
  const [batterySize, setBatterySize] = useState(0);
  const [effectiveBatterySize, setEffectiveBatterySize] = useState(0);
  const [batteryBackupHours, setBatteryBackupHours] = useState(12);
  const [hourlyConsumption, setHourlyConsumption] = useState(0);
  const [numberOfPanels, setNumberOfPanels] = useState(1);
  const [panelWattage, setPanelWattage] = useState(300);
  const [solarPanelSize, setSolarPanelSize] = useState(0);

  const PEAK_SUN_HOURS = 5;
  const MIN_BATTERY_SIZE = 2556; // Minimum battery size in Wh

  function calculateDailyKWh(appliance) {
    const kWh = ((appliance.power * appliance.hoursPerDay * (appliance.quantity || 1)) / 1000).toFixed(2);
    return isNaN(kWh) ? '0' : kWh;
  }

  function calculateTotalKWh() {
    return Object.values(selectedAppliances).reduce((total, appliance) => {
      return total + Number(calculateDailyKWh(appliance));
    }, 0).toFixed(2);
  }

  function calculateSystemSize() {
    console.log('Selected Appliances:', selectedAppliances);

    const maxPowerTotal = Object.values(selectedAppliances).reduce((sum, appliance) => {
      const appliancePower = appliance.maxPower || appliance.power;
      console.log(`${appliance.name}: Power ${appliancePower}W, Quantity ${appliance.quantity || 1}`);
      return sum + (appliancePower * (appliance.quantity || 1));
    }, 0);
    
    console.log(`Total max power: ${maxPowerTotal}W`);
    const newInverterSize = Math.ceil(maxPowerTotal / 100) * 100;
    console.log(`Calculated inverter size: ${newInverterSize}W`);
    setInverterSize(newInverterSize);

    const dailyConsumption = calculateTotalKWh() * 1000; // Convert to Wh
    
    // Calculate battery size based on backup hours
    const newBatterySize = Math.max(
      Math.ceil((dailyConsumption * batteryBackupHours / 24) / 0.8 / 100) * 100,
      MIN_BATTERY_SIZE
    );
    console.log(`Calculated battery size: ${newBatterySize}Wh for ${batteryBackupHours} hours backup`);
    setBatterySize(newBatterySize);

    if (useSolarPanels) {
      const dailySolarProduction = numberOfPanels * panelWattage * PEAK_SUN_HOURS;
      const excessSolarEnergy = Math.max(0, dailySolarProduction - dailyConsumption);
      const newEffectiveBatterySize = Math.max(
        MIN_BATTERY_SIZE,
        newBatterySize - excessSolarEnergy
      );
      setEffectiveBatterySize(Math.round(newEffectiveBatterySize / 100) * 100);
      setSolarPanelSize(dailySolarProduction);
    } else {
      setEffectiveBatterySize(newBatterySize);
    }
  }

  useEffect(() => {
    calculateSystemSize();
  }, [selectedAppliances, batteryBackupHours, useSolarPanels, numberOfPanels, panelWattage]);

  const handleBatteryUsageHoursChange = (event) => {
    setBatteryUsageHours(parseInt(event.target.value));
  };

  const handleGridHoursChange = (event) => {
    setGridHours(parseInt(event.target.value));
  };

  const handleBatteryBackupHoursChange = (event) => {
    setBatteryBackupHours(Number(event.target.value));
  };

  const handleUseSolarPanelsChange = () => {
    setUseSolarPanels(!useSolarPanels);
  };

  const handleApplianceSelect = (appliance) => {
    console.log('Selected appliance:', appliance);
    setSelectedAppliances(prev => {
      if (prev[appliance.name]) {
        const { [appliance.name]: _, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [appliance.name]: {
            ...appliance,
            quantity: 1,
            hoursPerDay: (appliance.defaultMinutes / 60).toFixed(2),
            isEditing: false,
          }
        };
      }
    });
  };

  const handleInputChange = (applianceName, field, value) => {
    console.log(`Input change - Appliance: ${applianceName}, Field: ${field}, Value: ${value}`);
    const parsedValue = value === '' ? '' : parseFloat(value);
    if (value === '' || !isNaN(parsedValue)) {
      setSelectedAppliances(prev => ({
        ...prev,
        [applianceName]: {
          ...prev[applianceName],
          [field]: field === 'power' ? Math.round(parsedValue) : parsedValue
        }
      }));
    }
  };

  const formatDuration = (hours) => {
    return `${hours}h/day`;
  };

  const handleNewApplianceChange = (field, value) => {
    console.log(`New appliance change - Field: ${field}, Value: ${value}`);
    setNewAppliance(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewAppliance = () => {
    console.log('Adding new appliance:', newAppliance);
    if (newAppliance.name && newAppliance.power && newAppliance.hoursPerDay) {
      const newApplianceItem = {
        ...newAppliance,
        power: Math.round(Number(newAppliance.power)),
        defaultMinutes: Number(newAppliance.hoursPerDay) * 60,
        quantity: 1
      };
      addAppliance(newApplianceItem);
      setNewlyAddedAppliance(newApplianceItem.name);
      setNewAppliance({ name: '', power: '', hoursPerDay: '' });
      handleApplianceSelect(newApplianceItem);
      roomAppliances.Other.push(newApplianceItem);
    }
  };

  const toggleSection = (section) => {
    console.log('Toggling section:', section);
    setVisibleSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleEditAppliance = (applianceName) => {
    setSelectedAppliances(prev => ({
      ...prev,
      [applianceName]: {
        ...prev[applianceName],
        isEditing: !prev[applianceName].isEditing
      }
    }));
  };

  const handleNumberOfPanelsChange = (event) => {
    setNumberOfPanels(Number(event.target.value));
  };

  const handlePanelWattageChange = (event) => {
    setPanelWattage(Number(event.target.value));
  };

  return (
    <div className="appliance-list">
      {Object.entries(roomAppliances).map(([room, appliances]) => (
        <div key={room} className="room-section">
          <h2>{room}</h2>
          <div className="appliance-grid">
            {appliances.map(appliance => (
              <div
                key={appliance.name}
                className={`appliance-card ${selectedAppliances[appliance.name] ? 'selected' : ''}`}
                onClick={() => handleApplianceSelect(appliance)}
              >
                <h3>{appliance.name}</h3>
                <p className="power">{selectedAppliances[appliance.name]?.power || appliance.power}W</p>
                <p className="duration">{formatDuration(appliance.defaultMinutes / 60)}</p>
                {selectedAppliances[appliance.name] && (
                  <div className="edit-controls">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleEditAppliance(appliance.name);
                    }}>
                      {selectedAppliances[appliance.name].isEditing ? 'Save' : 'Edit'}
                    </button>
                    {selectedAppliances[appliance.name].isEditing && (
                      <div className="edit-fields">
                        <label>
                          Qty:
                          <input
                            type="number"
                            value={selectedAppliances[appliance.name].quantity}
                            onChange={(e) => handleInputChange(appliance.name, 'quantity', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                        <label>
                          Watts:
                          <input
                            type="number"
                            value={selectedAppliances[appliance.name].power}
                            onChange={(e) => handleInputChange(appliance.name, 'power', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="add-appliance-form">
        <h2>Add New Appliance</h2>
        <input
          type="text"
          value={newAppliance.name}
          onChange={(e) => handleNewApplianceChange('name', e.target.value)}
          placeholder="Appliance Name"
        />
        <input
          type="number"
          value={newAppliance.power}
          onChange={(e) => handleNewApplianceChange('power', e.target.value)}
          placeholder="Power (W)"
        />
        <input
          type="number"
          value={newAppliance.hoursPerDay}
          onChange={(e) => handleNewApplianceChange('hoursPerDay', e.target.value)}
          placeholder="Hours per day"
        />
        <button onClick={handleAddNewAppliance}>Add Appliance</button>
      </div>

      <div className="floating-appliance-info">
        <h3>Total Consumption</h3>
        <p className="total-kwh">{calculateTotalKWh()} kWh/day</p>
        <div className="selected-appliance-info">
          <h4>Selected Appliances:</h4>
          {Object.entries(roomAppliances).map(([room, appliances]) => {
            const selectedInRoom = appliances.filter(a => selectedAppliances[a.name]);
            if (selectedInRoom.length === 0) return null;
            return (
              <div key={room} className="room-group">
                <h5>{room}</h5>
                {selectedInRoom.map(appliance => (
                  <p key={appliance.name}>
                    {appliance.name}: {calculateDailyKWh(selectedAppliances[appliance.name])} kWh/day
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="floating-system-info">
        <h3>System Size</h3>
        <div className="system-info-item">
          <span>Inverter:</span>
          <span>{inverterSize} W</span>
        </div>
        <div className="system-info-item">
          <span>Battery:</span>
          <span>{batterySize} Wh</span>
        </div>
        {useSolarPanels && (
          <div className="system-info-item">
            <span>Effective Battery:</span>
            <span>{effectiveBatterySize} Wh</span>
          </div>
        )}
        <div className="battery-backup-slider">
          <label htmlFor="battery-backup-hours">Battery Backup Hours: {batteryBackupHours}</label>
          <input
            type="range"
            id="battery-backup-hours"
            min="1"
            max="48"
            value={batteryBackupHours}
            onChange={handleBatteryBackupHoursChange}
          />
        </div>
        <div className="solar-panel-toggle">
          <label>
            <input
              type="checkbox"
              checked={useSolarPanels}
              onChange={handleUseSolarPanelsChange}
            />
            Use Solar Panels
          </label>
        </div>
        {useSolarPanels && (
          <>
            <div className="solar-panel-input">
              <label htmlFor="number-of-panels">Number of Panels:</label>
              <input
                type="number"
                id="number-of-panels"
                min="1"
                value={numberOfPanels}
                onChange={handleNumberOfPanelsChange}
              />
            </div>
            <div className="solar-panel-input">
              <label htmlFor="panel-wattage">Panel Wattage (W):</label>
              <input
                type="number"
                id="panel-wattage"
                min="100"
                step="50"
                value={panelWattage}
                onChange={handlePanelWattageChange}
              />
            </div>
            <div className="system-info-item">
              <span>Total Solar Capacity:</span>
              <span>{solarPanelSize} Wh/day</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplianceList;
