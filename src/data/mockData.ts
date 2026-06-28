export type Source = 'gmail' | 'whatsapp' | 'slack';
export type Category = 'Urgent' | 'Scheduling' | 'Informational' | 'Emergency';

export interface PriorityItem {
  id: string;
  source: Source;
  category: Category;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  urgencyScore: 1 | 2 | 3 | 4 | 5;
  draftReply: string;
  // Send metadata — populated by integration sync, used by Approve & Send
  threadId?: string;       // Gmail thread ID for in-thread reply
  channelId?: string;      // Slack channel ID
  phoneNumber?: string;    // WhatsApp E.164 number
  replyTo?: string;        // Email address to reply to (extracted from sender)
}

export interface SystemStat {
  label: string;
  value: number;
  unit?: string;
}

export const mockPriorityItems: PriorityItem[] = [
  {
    id: '1',
    source: 'gmail',
    category: 'Emergency',
    sender: 'Marcus Webb <m.webb@venturecap.io>',
    subject: 'Series B Term Sheet — Expires 5PM Today',
    preview: 'We need your countersignature on the revised term sheet before close of business. Legal is standing by. If we don\'t hear back, the offer lapses automatically.',
    timestamp: '09:14 AM',
    urgencyScore: 5,
    draftReply: 'Marcus, I\'ve reviewed the revised term sheet. I\'m prepared to countersign subject to one clarification on clause 7.2 (anti-dilution). Can you have legal confirm the broad-based weighted average formula applies? I\'ll sign within the hour upon confirmation.',
  },
  {
    id: '2',
    source: 'slack',
    category: 'Urgent',
    sender: 'Priya Nair · #engineering-leads',
    subject: 'Production API down — 503s across EU region',
    preview: 'We\'ve had 14 minutes of downtime on the EU cluster. Root cause identified as a botched deploy. Rollback is 80% complete. Do you want us to draft a customer comms?',
    timestamp: '09:31 AM',
    urgencyScore: 5,
    draftReply: 'Priya, authorize the rollback immediately. Yes, draft customer comms — keep it factual, ETA-forward, no apology language yet until we confirm SLA breach. Loop in legal if downtime exceeds 30 min. I\'ll join the incident call at 9:45.',
  },
  {
    id: '3',
    source: 'whatsapp',
    category: 'Scheduling',
    sender: 'James Okafor',
    subject: 'Coffee next week?',
    preview: 'Hey — are you free Tuesday or Wednesday morning? Would love to catch up and show you what we\'ve been building. 30 mins max.',
    timestamp: '08:52 AM',
    urgencyScore: 2,
    draftReply: 'James! Great to hear from you. Wednesday at 9:30 AM works well for me. Does that suit? Looking forward to seeing what you\'ve been working on.',
  },
  {
    id: '4',
    source: 'gmail',
    category: 'Urgent',
    sender: 'Finance Team <finance@yourcompany.com>',
    subject: 'Board Deck Numbers — Final Sign-off Required',
    preview: 'The Q2 financials are locked. We need your sign-off on slide 12 (cash runway projection) before the deck goes to the board portal at noon.',
    timestamp: '08:47 AM',
    urgencyScore: 4,
    draftReply: 'Sending approval now. Slide 12 figures are aligned with what we discussed in Monday\'s review. Please proceed to upload to the board portal. Flag me if anything changes before noon.',
  },
  {
    id: '5',
    source: 'slack',
    category: 'Informational',
    sender: 'Lena Richter · #sales',
    subject: 'Closed Acme Corp — $240K ARR',
    preview: 'Huge win! Just got signed docs back from Acme Corp. $240K ARR, 2-year contract. Going live Q3. Champagne emoji warranted.',
    timestamp: '08:19 AM',
    urgencyScore: 1,
    draftReply: 'Incredible work, Lena! This is a landmark deal for us. Make sure Acme gets our white-glove onboarding treatment — assign a dedicated CSM by EOD. I\'ll shout this out in all-hands.',
  },
  {
    id: '6',
    source: 'gmail',
    category: 'Scheduling',
    sender: 'EA · Sophia Chen <sophia@yourcompany.com>',
    subject: 'Thursday all-day blocked — conflict with LP meeting',
    preview: 'Your Thursday schedule has a conflict: the LP quarterly review (10 AM–1 PM) overlaps with the product roadmap session you confirmed last week. Which takes priority?',
    timestamp: '07:58 AM',
    urgencyScore: 3,
    draftReply: 'Sophia — LP quarterly review takes priority. Please reschedule the product roadmap session to Friday at 2 PM and notify the product team. Also add a 15-min prep block before the LP call.',
  },
  {
    id: '7',
    source: 'whatsapp',
    category: 'Informational',
    sender: 'David Park',
    subject: 'TechCrunch piece is live',
    preview: 'The TechCrunch article just dropped. You\'re quoted in paragraphs 3 and 7. Reads well — mostly positive framing. Minor point about competitor comparison in para 9.',
    timestamp: '07:34 AM',
    urgencyScore: 2,
    draftReply: 'Thanks for the heads up, David. I\'ll read the full piece now. If the competitor comparison in para 9 is materially misleading, let\'s have comms prep a response by noon.',
  },
  {
    id: '8',
    source: 'slack',
    category: 'Scheduling',
    sender: 'People Ops · #hr-leadership',
    subject: 'Exec offsite dates — final poll',
    preview: 'We\'re down to two date options for the Q3 exec offsite: Aug 14–16 or Aug 21–23. Poll closes today at 3 PM. 4 votes each so far.',
    timestamp: '07:11 AM',
    urgencyScore: 2,
    draftReply: 'Casting my vote for Aug 21–23. The 14th conflicts with the investor roadshow prep week. Please make sure the agenda includes at least half a day for strategy synthesis, not just status updates.',
  },
];

export const mockSystemStats: SystemStat[] = [
  { label: 'Messages Filtered', value: 247, unit: 'today' },
  { label: 'Drafts Generated', value: 31, unit: 'today' },
  { label: 'Meetings Blocked', value: 8, unit: 'this week' },
  { label: 'Alerts Fired', value: 2, unit: 'today' },
];

export interface AgentLog {
  id: string;
  time: string;
  agent: 'Router' | 'Guardian' | 'Email' | 'Scheduler';
  message: string;
}

export const mockAgentLogs: AgentLog[] = [
  { id: 'l1', time: '09:31 AM', agent: 'Router', message: 'Incoming Slack → Category: Emergency → Delegated to Guardian Agent' },
  { id: 'l2', time: '09:31 AM', agent: 'Guardian', message: 'Anomaly detected: "downtime" + "EU cluster" → Urgency score: 5 → Alert escalated' },
  { id: 'l3', time: '09:14 AM', agent: 'Router', message: 'Incoming Gmail → Category: Emergency → Delegated to Email Agent' },
  { id: 'l4', time: '09:14 AM', agent: 'Email', message: 'Importance score: 5/5 → Draft reply generated (172 tokens)' },
  { id: 'l5', time: '08:52 AM', agent: 'Router', message: 'Incoming WhatsApp → Category: Scheduling → Delegated to Scheduler Agent' },
  { id: 'l6', time: '08:52 AM', agent: 'Scheduler', message: 'Availability parsed: Wednesday 9:30 AM slot available → Draft reply generated' },
  { id: 'l7', time: '08:47 AM', agent: 'Router', message: 'Incoming Gmail → Category: Urgent → Delegated to Email Agent' },
  { id: 'l8', time: '08:19 AM', agent: 'Router', message: 'Incoming Slack → Category: Informational → Delegated to Email Agent' },
  { id: 'l9', time: '08:02 AM', agent: 'Guardian', message: 'Routine scan complete — no anomalies detected in last 30 min window' },
  { id: 'l10', time: '07:58 AM', agent: 'Scheduler', message: 'Calendar conflict detected: Thursday 10 AM → Flagged for executive decision' },
];
