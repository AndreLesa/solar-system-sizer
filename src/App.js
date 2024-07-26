import React, { useState, useMemo } from 'react';
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

  const totalConsumption = useMemo(() => {
    return appliances.reduce(
      (total, appliance) => total + appliance.power * appliance.quantity * appliance.hoursPerDay,
      0
    );
  }, [appliances]);

  return (
    <div className="App">
      <header className="site-header">
        <h1>Solar System Calculator</h1>
      </header>

      <div className="intro-section">
        <h2>Welcome to the Energy System Calculator</h2>
        <p className="intro-description">This tool helps you estimate the size of the energy system you need based on your appliance usage and specific requirements.</p>
        <div className="feature-list">
          <h3>Here's what you can do:</h3>
          <ul>
            <li>Add appliances to your list, specifying their power consumption, quantity, and daily usage hours.</li>
            <li>Edit or remove appliances as needed to refine your calculation.</li>
            <li>Adjust the number of backup hours you want your system to support.</li>
            <li>Specify the size of solar panels to determine the number of panels needed.</li>
            <li>View the total power consumption based on your appliance list.</li>
            <li>Get a suggestion for an appropriate solar system based on your energy needs and preferences.</li>
          </ul>
        </div>
        <p><strong>If you have any questions or need an installation to be done, send a Whatsapp message to +260973203144 
          (Zambia Only).</strong>
        </p>
        <p className="intro-footer">As you adjust your settings and appliance list, the total consumption and energy system suggestion will update automatically. This helps you understand how different factors impact your energy needs and solar system requirements.</p>
      </div>

      <ApplianceList
        appliances={appliances}
        addAppliance={addAppliance}
        updateAppliance={updateAppliance}
        removeAppliance={removeAppliance}
      />

    </div>
  );
};

export default App;