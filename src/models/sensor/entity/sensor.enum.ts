export enum SensorType {
  GEN = 'GEN',
  RR = 'RR',
  SPO2 = 'SPO2',
}

export enum SensorProcessState {
  AVAILABLE = 'available',
  ASSIGN = 'assign',
  PAIR = 'pair',
  UNPAIR = 'unpair',
  CLEAR = 'clear',
}

export enum SensorProcessStateStatus {
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum SensorState {
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export enum SensorStateStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum DeviceConnectionMode {
  GATEWAY_MODE = 'gateway_mode',
  APPLICATION_MODE = 'application_mode',
}
