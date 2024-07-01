export const calculateSystemSize = ({
  appliances,
  useGridPower,
  useSolarPanels,
  gridHours,
  batteryUsageHours,
  selectedAppliances,
}) => {
  const PEAK_SUN_HOURS = 5;
  const SYSTEM_EFFICIENCY = 0.8;
  const INVERTER_EFFICIENCY = 0.97;
  const BATTERY_DOD = 0.8;
  const PANEL_WATTAGES = [550, 440, 220];
  const BATTERY_CAPACITIES = [5000, 10000, 12000, 15600];

  let totalDailyConsumption = 0;
  let peakPower = 0;

  appliances.forEach(appliance => {
    totalDailyConsumption += appliance.power * appliance.hoursPerDay;
    peakPower = Math.max(peakPower, appliance.power);
  });

  let requiredBatteryCapacity = totalDailyConsumption;

  if (useGridPower) {
    requiredBatteryCapacity *= (24 - gridHours) / 24;
  }

  if (useSolarPanels) {
    requiredBatteryCapacity *= 0.7;
  }

  requiredBatteryCapacity *= 1.2;

  const totalConsumption = parseFloat(totalDailyConsumption) * 1000;

  const peakPowerDemand = Object.values(selectedAppliances).reduce((peak, appliance) => {
    const applianceMaxPower = appliance.maxPower || appliance.power;
    return peak + (applianceMaxPower * appliance.quantity);
  }, 0);

  const normalPowerDemand = Object.values(selectedAppliances).reduce((total, appliance) => {
    return total + (appliance.power * appliance.quantity);
  }, 0);

  let systemVoltage = '12V';
  if (peakPowerDemand > 1000 && peakPowerDemand <= 4000) {
    systemVoltage = '24V';
  } else if (peakPowerDemand > 4000) {
    systemVoltage = '48V';
  }

  const inverterSize = Math.ceil(peakPowerDemand / INVERTER_EFFICIENCY / 1000) * 1000;

  const dailyConsumptionPerHour = totalConsumption / 24;

  let adjustedBatteryUsageHours = batteryUsageHours;
  if (useGridPower) {
    adjustedBatteryUsageHours -= gridHours;
  }

  let requiredPanelWattage = 0;
  let suggestedPanelWattage = 0;
  let numberOfPanels = 0;
  let solarContribution = 0;

  if (useSolarPanels) {
    requiredPanelWattage = Math.ceil(totalConsumption / (PEAK_SUN_HOURS * SYSTEM_EFFICIENCY));
    suggestedPanelWattage = PANEL_WATTAGES.find(wattage => wattage * Math.ceil(requiredPanelWattage / wattage) >= requiredPanelWattage);
    numberOfPanels = Math.ceil(requiredPanelWattage / suggestedPanelWattage);
    solarContribution = (PEAK_SUN_HOURS * SYSTEM_EFFICIENCY * suggestedPanelWattage * numberOfPanels);
  }

  const adjustedDailyConsumption = dailyConsumptionPerHour * 24 - solarContribution;
  let batteryCapacity = Math.ceil((adjustedDailyConsumption * adjustedBatteryUsageHours) / (BATTERY_DOD * SYSTEM_EFFICIENCY) / 1000) * 1000;

  if (batteryCapacity > 15600) {
    batteryCapacity = Math.ceil(batteryCapacity / 5000) * 5000;
  }

  const suggestedBatteryCapacity = BATTERY_CAPACITIES.find(cap => cap >= batteryCapacity) || batteryCapacity;

  let totalConsumptionWithBattery = totalConsumption;
  if (useSolarPanels) {
    totalConsumptionWithBattery -= solarContribution;
    totalConsumptionWithBattery += (batteryCapacity / batteryUsageHours);
  }

  if (useGridPower) {
    const gridConsumption = 0.5 * totalConsumption;
    totalConsumptionWithBattery -= gridConsumption;
  }

  return {
    systemVoltage,
    inverterSize,
    batteryCapacity: suggestedBatteryCapacity,
    panelWattage: suggestedPanelWattage,
    numberOfPanels,
    peakPowerDemand,
    normalPowerDemand,
    totalConsumption,
  };
};
