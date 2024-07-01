import React from 'react';

const ApplianceItem = ({ appliance, onUpdate, onRemove }) => {
  // Debugging step 1: Log props
  console.log('ApplianceItem props:', { appliance, onUpdate, onRemove });

  // Debugging step 2: Check if appliance object is valid
  if (!appliance || typeof appliance !== 'object') {
    console.error('Invalid appliance prop:', appliance);
    return <div>Invalid appliance data</div>;
  }

  // Debugging step 3: Ensure onUpdate and onRemove are functions
  if (typeof onUpdate !== 'function' || typeof onRemove !== 'function') {
    console.error('onUpdate or onRemove is not a function');
    return <div>Invalid update or remove function</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Debugging step 4: Log input change
    console.log('Input changed:', { name, value });
    try {
      onUpdate({ ...appliance, [name]: name === 'name' ? value : Number(value) });
    } catch (error) {
      console.error('Error in handleInputChange:', error);
    }
  };

  // Debugging step 5: Wrap the return in a try-catch
  try {
    return (
      <div className="appliance-item">
        <input
          type="text"
          name="name"
          value={appliance.name || ''}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="power"
          value={appliance.power || 0}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="quantity"
          value={appliance.quantity || 0}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="hoursPerDay"
          value={appliance.hoursPerDay || 0}
          onChange={handleInputChange}
        />
        <button onClick={() => {
          // Debugging step 6: Log remove action
          console.log('Remove button clicked');
          onRemove();
        }}>Remove</button>
      </div>
    );
  } catch (error) {
    console.error('Error rendering ApplianceItem:', error);
    return <div>Error rendering appliance item</div>;
  }
};

export default ApplianceItem;
