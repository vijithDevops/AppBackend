export enum SCHEDULER_JOBS {
  SCHEDULED_REMINDER = 'SCHEDULED_REMINDER',
  DAILY_REMINDER = 'DAILY_REMINDER',
  DAILY_DEFAULT_REMINDER = 'DAILY_DEFAULT_REMINDER',
  INTERVAL_JOBS = 'INTERVAL_JOBS',
}

export enum SCHEDULED_REMINDER {
  APPOINTEMNT_REMINDER = 'appointment_reminder',
}

export enum DAILY_REMINDER {
  MEDICATION_REMINDER = 'medication_reminder',
  BREATHING_EXERCISE_REMINDER = 'breathing_exercise_reminder',
  SENSOR_USE_REMINDER = 'sensor_use_reminder',
  HEALTH_INPUT_REMINDER = 'health_input_reminder',
}

export enum INTERVAL_JOBS {
  MEDICAL_ALERTS = 'medical_alerts',
  DP_CACHE_UPDATE = 'dp_cache_update',
}
