export type CaseType =
  | 'ban'
  | 'unban'
  | 'kick'
  | 'timeout'
  | 'untimeout'
  | 'warn'
  | 'unwarn'
  | 'mute'
  | 'unmute';

export interface ModerationCase {
  caseId: number;
  guildId: string;
  type: CaseType;
  targetId: string;
  moderatorId: string;
  reason: string;
  createdAt: number;
}
