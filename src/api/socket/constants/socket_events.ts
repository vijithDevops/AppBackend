export const SERVER_SOCKET_EVENTS = {
  PING: 'ping',
};

export const CLIENT_SOCKET_EVENTS = {
  PONG: 'pong',
  AUTHORIZED: 'authorized',
  ERROR: 'error',
  GATEWAY_STATUS: 'gateway_status',
  SENSOR_STATUS: 'sensor_status',
  // PAIR_SENSOR: 'pair_sensor',
  // UNPAIR_SENSOR: 'unpair_sensor',
  // CLEAR_SENSOR: 'clear_sensor',
  // ASSIGN_DEVICE: 'assign_device',
  // UNASSIGN_DEVICE: 'unassign_device',
  PATIENT_DEVICE_UPDATE: 'patient_device_update',
};
