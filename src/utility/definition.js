export function powerMode(value) {
  const options = ['Off', 'Low Power', 'Standard Power', 'Standard ADCS', 'Standard Telecomm', 'Neutron Mission'];
  if (value > 0) {
    return `${options[value]} (${value})`;
  }

  return `${options[0]} (${value})`;
}

export function tempCAndK(tempK) {
  return `${(tempK - 273.15).toFixed(2)}C (${tempK}K)`;
}

export function callConnected(value) {
  const connected = ['Disconnected', 'Connected'];
  return connected[value & 1];
}

export function serviceAvailable(value) {
  const service = ['NO', 'YES'];
  return service[value >> 2 & 1];
}

export function serviceMode(value) {
  const ready = ['Not Ready', 'Ready'];
  return ready[value >> 8 & 0x4];
}

export function registration(value) {
  const registered = ['NO', 'YES'];
  return registered[value >> 3 & 1];
}

export function roaming(value) {
  const options = ['NO', 'YES'];
  return options[value >> 4 & 1];
}

export function callState(value) {
  const options = ['NO', 'YES'];
  return options[value >> 12 & 0x4];
}

export function callType(value) {
  const options = ['NO', 'YES'];
  return options[value >> 16 & 0x3];
}

export function serviceReady(value) {
  const ready = ['Not Ready', 'Ready'];
  return ready[value >> 1 & 1];
}

export function globeFunction(lat, lon = null, h = null) {
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  const rad = 6378137.0;
  const f = 1.0 / 298.257224;
  const C = 1.0 / Math.sqrt(
    cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat,
  );

  if (lat && lon && h) {
    const sinLon = Math.sin(lon);
    return (rad * C + h) * cosLat * sinLon;
  }
  if (lat && lon) {
    const cosLon = Math.cos(lon);
    return (rad * C) * cosLat * cosLon;
  }

  const S = (1.0 - f) * (1.0 - f) * C;
  return (rad * S + h) * sinLat;
}
