export type IssueRecord = {
  number: string;
  url: string;
  note: string;
  savedAt?: string;
};

const KEY = 'darake.issueRecord.v1';

export const emptyIssueRecord: IssueRecord = {
  number: '',
  url: '',
  note: '',
};

export function loadIssueRecord(): IssueRecord {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyIssueRecord, ...JSON.parse(raw) } : emptyIssueRecord;
  } catch {
    return emptyIssueRecord;
  }
}

export function saveIssueRecord(record: IssueRecord): IssueRecord {
  const next = {
    ...record,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}

export function clearIssueRecord(): IssueRecord {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return emptyIssueRecord;
  }

  return emptyIssueRecord;
}
