import React, { useState, useEffect } from 'react';
import { calculateSystemSize } from '../utils/calculateSystemSize';
import '../styles/ApplianceList.css';
import SystemReport from './SystemReport';

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
    { name: 'Hair Dryer', power: 1500, defaultMinutes: 20 },
    { name: 'Electric Toothbrush Charger', power: 5, defaultMinutes: 1440 },
    { name: 'Electric Shaver', power: 15, defaultMinutes: 20 },
  ],
  LaundryRoom: [
    { name: 'Washing Machine', power: 500, defaultMinutes: 60 },
    { name: 'Clothes Dryer', power: 3000, defaultMinutes: 60 },
    { name: 'Iron', power: 1000, defaultMinutes: 30 },
  ],
  HomeOffice: [
    { name: 'Desktop Computer', power: 200, defaultMinutes: 240 },
    { name: 'Monitor', power: 30, defaultMinutes: 240 },
    { name: 'Printer', power: 50, defaultMinutes: 20 },
    { name: 'Router', power: 10, defaultMinutes: 1440 },
  ],
  Garage: [
    { name: 'Garage Door Opener', power: 400, defaultMinutes: 5 },
    { name: 'Power Tools (avg)', power: 1000, defaultMinutes: 30 },
  ],
  Other: [
    { name: 'Submersible Pump', power: 1000, maxPower: 1500, defaultMinutes: 120 },
    { name: 'Booster Pump', power: 500, maxPower: 750, defaultMinutes: 60 },
  ],
};

const ApplianceList = ({ appliances, addAppliance, updateAppliance, removeAppliance }) => {
  const [selectedAppliances, setSelectedAppliances] = useState({});
  const [newAppliance, setNewAppliance] = useState({ name: '', power: '', hoursPerDay: '', hasPump: false });
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

  const [showNotification, setShowNotification] = useState(false);

  const PEAK_SUN_HOURS = 5;
  const MIN_BATTERY_SIZE = 1000; // Minimum battery size in Wh

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

    // Calculate recommended solar size
    const totalEnergyNeeded = dailyConsumption + newBatterySize;
    const recommendedSolarSize = Math.ceil(totalEnergyNeeded / PEAK_SUN_HOURS / 100) * 100;
    console.log(`Recommended solar size: ${recommendedSolarSize}W`);
    setSolarPanelSize(recommendedSolarSize);

    if (useSolarPanels) {
      const calculatedNumberOfPanels = Math.ceil(recommendedSolarSize / panelWattage);
      setNumberOfPanels(calculatedNumberOfPanels);
      const dailySolarProduction = calculatedNumberOfPanels * panelWattage * PEAK_SUN_HOURS;
      const excessSolarEnergy = Math.max(0, dailySolarProduction - dailyConsumption);
      const newEffectiveBatterySize = Math.max(
        MIN_BATTERY_SIZE,
        newBatterySize - excessSolarEnergy
      );
      setEffectiveBatterySize(Math.round(newEffectiveBatterySize / 100) * 100);
    } else {
      setEffectiveBatterySize(newBatterySize);
    }
  }

  useEffect(() => {
    calculateSystemSize();
  }, [selectedAppliances, batteryBackupHours, useSolarPanels, panelWattage]);

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

  const handleApplianceSelect = (room, appliance) => {
    const applianceKey = `${room}-${appliance.name}`;
    console.log('Selected appliance:', applianceKey);
    setSelectedAppliances(prev => {
      if (prev[applianceKey]) {
        const { [applianceKey]: _, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [applianceKey]: {
            ...appliance,
            quantity: 1,
            hoursPerDay: (appliance.defaultMinutes / 60).toFixed(2),
            isEditing: false,
          }
        };
      }
    });
  };

  const handleInputChange = (applianceKey, field, value) => {
    console.log(`Input change - Appliance: ${applianceKey}, Field: ${field}, Value: ${value}`);
    const parsedValue = value === '' ? '' : parseFloat(value);
    if (value === '' || !isNaN(parsedValue)) {
      setSelectedAppliances(prev => ({
        ...prev,
        [applianceKey]: {
          ...prev[applianceKey],
          [field]: field === 'power' ? Math.round(parsedValue) : parsedValue
        }
      }));
    }
  };

  const handleHoursChange = (applianceKey, value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      const roundedValue = Math.round(parsedValue * 2) / 2; // Round to nearest 0.5 (30 minutes)
      setSelectedAppliances(prev => ({
        ...prev,
        [applianceKey]: {
          ...prev[applianceKey],
          hoursPerDay: roundedValue
        }
      }));
    }
  };

  const formatDuration = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = totalMinutes % 60;
    return `${hoursPart}h ${minutesPart}m/day`;
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
        quantity: 1,
        maxPower: newAppliance.hasPump ? Math.round(Number(newAppliance.power) * 2.2) : undefined
      };
      addAppliance(newApplianceItem);
      setNewlyAddedAppliance(newApplianceItem.name);
      setNewAppliance({ name: '', power: '', hoursPerDay: '', hasPump: false });
      handleApplianceSelect('Other', newApplianceItem);
      roomAppliances.Other.push(newApplianceItem);

      // Show notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
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

  const handleEditAppliance = (applianceKey) => {
    setSelectedAppliances(prev => ({
      ...prev,
      [applianceKey]: {
        ...prev[applianceKey],
        isEditing: !prev[applianceKey].isEditing
      }
    }));
  };

  const handlePanelWattageChange = (event) => {
    setPanelWattage(Number(event.target.value));
  };

  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="appliance-list">
      {showNotification && (
        <div className="notification-popup">
          Appliance added successfully!
        </div>
      )}

      {Object.entries(roomAppliances).map(([room, appliances]) => (
        <div key={room} className="room-section">
          <h2>{room}</h2>
          <div className="appliance-grid">
            {appliances.map(appliance => {
              const applianceKey = `${room}-${appliance.name}`;
              const selectedAppliance = selectedAppliances[applianceKey];
              return (
                <div
                  key={applianceKey}
                  className={`appliance-card ${selectedAppliance ? 'selected' : ''}`}
                  onClick={() => handleApplianceSelect(room, appliance)}
                >
                  <h3>{appliance.name}</h3>
                  <p className="power">{selectedAppliance?.power || appliance.power}W</p>
                  <p className="duration">{selectedAppliance ? formatDuration(selectedAppliance.hoursPerDay) : formatDuration(appliance.defaultMinutes / 60)}</p>
                  {selectedAppliance && (
                    <>
                      <p className="quantity">Quantity: {selectedAppliance.quantity}</p>
                      <div className="edit-controls">
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppliance(applianceKey);
                        }}>
                          {selectedAppliance.isEditing ? 'Save' : 'Edit'}
                        </button>
                        {selectedAppliance.isEditing && (
                          <div className="edit-fields">
                            <label>
                              Qty:
                              <input
                                type="number"
                                value={selectedAppliance.quantity}
                                onChange={(e) => handleInputChange(applianceKey, 'quantity', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </label>
                            <label>
                              Watts:
                              <input
                                type="number"
                                value={selectedAppliance.power}
                                onChange={(e) => handleInputChange(applianceKey, 'power', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </label>
                            <label>
                              Hours:
                              <input
                                type="number"
                                step="0.5"
                                value={selectedAppliance.hoursPerDay}
                                onChange={(e) => handleHoursChange(applianceKey, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="add-appliance-form">
        <h2>Add New Appliance</h2>
        <div className="form-group">
          <label>Appliance Name</label>
          <input
            type="text"
            value={newAppliance.name}
            onChange={(e) => handleNewApplianceChange('name', e.target.value)}
            placeholder="Appliance Name"
          />
        </div>
        <div className="form-group">
          <label>Power (W)</label>
          <input
            type="number"
            value={newAppliance.power}
            onChange={(e) => handleNewApplianceChange('power', e.target.value)}
            placeholder="Power (W)"
          />
        </div>
        <div className="form-group">
          <label>Hours per day</label>
          <input
            type="number"
            value={newAppliance.hoursPerDay}
            onChange={(e) => handleNewApplianceChange('hoursPerDay', e.target.value)}
            placeholder="Hours per day"
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={newAppliance.hasPump}
              onChange={(e) => handleNewApplianceChange('hasPump', e.target.checked)}
            />
            Has Pump
          </label>
          <p className="explainer-text">Note: Appliances with pumps require a higher max power to account for the initial surge when the pump starts. The max power will be set to 2.2 times the wattage entered.</p>
        </div>
        <button onClick={handleAddNewAppliance}>Add Appliance</button>
      </div>

      <div className="floating-appliance-info">
        <h3>Total Consumption</h3>
        <p className="total-kwh">{calculateTotalKWh()} kWh/day</p>
        <div className="selected-appliance-info">
          <h4>Selected Appliances:</h4>
          {Object.entries(roomAppliances).map(([room, appliances]) => {
            const selectedInRoom = appliances.filter(a => selectedAppliances[`${room}-${a.name}`]);
            if (selectedInRoom.length === 0) return null;
            return (
              <div key={room} className="room-group">
                <h5>{room}</h5>
                {selectedInRoom.map(appliance => (
                  <p key={appliance.name}>
                    {appliance.name}: {calculateDailyKWh(selectedAppliances[`${room}-${appliance.name}`])} kWh/day
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="floating-system-info" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '250px', margin: '0 auto 20px auto' }}>
        <h3 style={{ textAlign: 'center', fontSize: '1.2em', cursor: 'pointer' }} onClick={toggleOpen}>
          Recommended<br />System Size
        </h3>
        {isOpen && (
          <>
            <div className="system-info-item" style={{ textAlign: 'center', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
              <span>Min Inverter:</span>
              <span>{inverterSize} W</span>
            </div>
            <div className="system-info-item" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
              <span>Min Battery:</span>
              <span>{batterySize} Wh</span>
            </div>
            {useSolarPanels && (
              <>
                <div className="system-info-item" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                  <span>Eff Battery:</span>
                  <span>{effectiveBatterySize} Wh</span>
                </div>
                <div className="system-info-item" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                  <span>Rec Solar:</span>
                  <span>{solarPanelSize} W</span>
                </div>
                <div className="system-info-item" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                  <span>Panels:</span>
                  <span>{numberOfPanels}</span>
                </div>
                <div className="solar-panel-input" style={{ marginBottom: '10px' }}>
                  <label htmlFor="panel-wattage" style={{ fontSize: '0.9em' }}>Panel Wattage (W):</label>
                  <input
                    type="number"
                    id="panel-wattage"
                    min="100"
                    step="50"
                    value={panelWattage}
                    onChange={handlePanelWattageChange}
                    style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </>
            )}
            <div className="battery-backup-slider" style={{ marginBottom: '10px' }}>
              <label htmlFor="battery-backup-hours" style={{ fontSize: '0.9em' }}>Battery Backup Hours: {batteryBackupHours}</label>
              <input
                type="range"
                id="battery-backup-hours"
                min="1"
                max="48"
                value={batteryBackupHours}
                onChange={handleBatteryBackupHoursChange}
                style={{ width: '100%' }}
              />
            </div>
            <div className="solar-panel-toggle" style={{ textAlign: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9em' }}>
                <input
                  type="checkbox"
                  checked={useSolarPanels}
                  onChange={handleUseSolarPanelsChange}
                />
                Use Solar Panels
              </label>
            </div>
          </>
        )}
      </div>
      <SystemReport
        selectedAppliances={selectedAppliances}
        inverterSize={inverterSize}
        batterySize={batterySize}
        effectiveBatterySize={effectiveBatterySize}
        useSolarPanels={useSolarPanels}
        solarPanelSize={solarPanelSize}
        numberOfPanels={numberOfPanels}
        panelWattage={panelWattage}
      />
    </div>
  );
};

export default ApplianceList;

