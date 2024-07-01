

import React, { useState } from 'react';
import ApplianceList from './components/ApplianceList';
import TotalConsumption from './components/TotalConsumption';
import SolarSystemSuggestion from './components/SolarSystemSuggestion';
import './styles/App.css';

// Polyfill for requestIdleCallback using window object
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (handler) {
    let startTime = Date.now();

    return setTimeout(function () {
      handler({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - startTime));
        }
      });
    }, 1);
  };
}

if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}


const App = () => {
  const [appliances, setAppliances] = useState([]);

  const addAppliance = (appliance) => {
    setAppliances([...appliances, appliance]);
  };

  const updateAppliance = (index, updatedAppliance) => {
    const newAppliances = [...appliances];
    newAppliances[index] = updatedAppliance;
    setAppliances(newAppliances);
  };

  const removeAppliance = (index) => {
    const newAppliances = appliances.filter((_, i) => i !== index);
    setAppliances(newAppliances);
  };

  const totalConsumption = appliances.reduce(
    (total, appliance) => total + appliance.power * appliance.quantity * appliance.hoursPerDay,
    0
  );

  return (
    <div className="App">
      <h1>Solar System Sizer</h1>
      <ApplianceList
        appliances={appliances}
        addAppliance={addAppliance}
        updateAppliance={updateAppliance}
        removeAppliance={removeAppliance}
      />
      <TotalConsumption totalConsumption={totalConsumption} />
      <SolarSystemSuggestion totalConsumption={totalConsumption} />
    </div>
  );
};

export default App;
