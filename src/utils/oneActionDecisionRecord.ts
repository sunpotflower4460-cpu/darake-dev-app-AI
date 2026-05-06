export type OneActionDecisionRecord = {
  id: string;
  candidateId: string;
  decision: 'ok' | 'stop' | 'later';
  reason: string;
  decidedAt: string;
  followUpNeeded: boolean;
  notes: string;
};

const STORAGE_KEY = 'darake.oneActionDecisionRecords.v1';

export function loadOneActionDecisionRecords(): OneActionDecisionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OneActionDecisionRecord[];
  } catch {
    return [];
  }
}

export function saveOneActionDecisionRecords(
  records: OneActionDecisionRecord[]
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function addOneActionDecisionRecord(
  records: OneActionDecisionRecord[],
  record: Omit<OneActionDecisionRecord, 'id' | 'decidedAt'>
): OneActionDecisionRecord[] {
  const newRecord: OneActionDecisionRecord = {
    ...record,
    id: `oadr-${crypto.randomUUID()}`,
    decidedAt: new Date().toISOString(),
  };
  return [newRecord, ...records];
}

export function updateOneActionDecisionRecord(
  records: OneActionDecisionRecord[],
  id: string,
  changes: Partial<OneActionDecisionRecord>
): OneActionDecisionRecord[] {
  return records.map((r) => (r.id === id ? { ...r, ...changes } : r));
}

export function clearOneActionDecisionRecords(): OneActionDecisionRecord[] {
  return [];
}

export function summarizeOneActionDecisionRecords(
  records: OneActionDecisionRecord[]
): {
  total: number;
  ok: number;
  stop: number;
  later: number;
  followUpNeeded: number;
} {
  return {
    total: records.length,
    ok: records.filter((r) => r.decision === 'ok').length,
    stop: records.filter((r) => r.decision === 'stop').length,
    later: records.filter((r) => r.decision === 'later').length,
    followUpNeeded: records.filter((r) => r.followUpNeeded).length,
  };
}
