export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'requesting_code'
  | 'pairing'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface SessionData {
  id: string;
  phoneNumber: string;
  pairingCode?: string;
  pairingExpiresAt?: number;
  credsContent?: string;
  connectedAt?: number;
  lastActive?: number;
  deviceName: string;
  platform: string;
  clientId: string;
}

export interface AntiSleepState {
  wakeLockActive: boolean;
  silentAudioActive: boolean;
  workerPulseActive: boolean;
  autoReconnect: boolean;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  reconnectAttempts: number;
  uptimeSeconds: number;
  lastPulseTime: number;
}

export interface LocalStorageMetrics {
  usedBytes: number;
  quotaBytes: number;
  usagePercentage: number;
  indexedDbSizeKb: number;
  logsCount: number;
  filesCount: number;
  cacheSizeKb: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'baileys' | 'cmd' | 'daemon';
  message: string;
  tag?: string;
}

export interface ScriptFile {
  id: string;
  name: string;
  content: string;
  description: string;
  isEntry?: boolean;
}

export interface CustomCommandRule {
  id: string;
  trigger: string;
  response: string;
  enabled: boolean;
  type: 'text' | 'random' | 'eval';
  usageCount: number;
}

export interface SimulatorMessage {
  id: string;
  sender: 'user' | 'bot';
  senderName: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}
