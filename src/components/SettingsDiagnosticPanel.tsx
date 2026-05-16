import { useEffect, useState } from 'react';
import '../settingsDiagnostic.css';
import {
  buildFallbackDiagnosticReport,
  buildSettingsDiagnosticReport,
  type SettingsDiagnosticReport,
} from '../utils/settingsDiagnosticReport';
import { fetchSetupStatus } from '../utils/setupStatusClient';

const LEVEL_ICON: Record<string, string> = { ok: '✓', missing: '△', blocked: '✕' };

export function SettingsDiagnosticPanel() {
  const [report, setReport] = useState<SettingsDiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function runDiagnostic() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const status = await fetchSetupStatus();
      setReport(buildSettingsDiagnosticReport(status));
    } catch {
      setReport(buildFallbackDiagnosticReport());
      setErrorMsg('Workerに接続できませんでした。Cloudflare Setupを実行してください。');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void runDiagnostic(); }, []);

  const overallLabel = report?.overall === 'all-ok'
    ? 'すべてOK'
    : report?.overall === 'partial'
      ? `${report.readyCount}/${report.totalCount} OK`
      : '設定が必要です';

  return (
    <section className="settingsDiagnostic" aria-label="設定状態診断">
      <div className="settingsDiagnostic__header">
        <span className="settingsDiagnostic__eyebrow">Phase 91</span>
        <h2 className="settingsDiagnostic__title">設定状態を確認する</h2>
      </div>

      {report ? (
        <>
          <div className={`settingsDiagnostic__summary settingsDiagnostic__summary--${report.overall}`}>
            <span>{overallLabel}</span>
          </div>

          <ul className="settingsDiagnostic__list">
            {report.items.map((item) => (
              <li key={item.id} className={`settingsDiagnostic__item settingsDiagnostic__item--${item.level}`}>
                <span className="settingsDiagnostic__dot" aria-hidden="true" />
                <div className="settingsDiagnostic__itemBody">
                  <span className="settingsDiagnostic__itemLabel">
                    {LEVEL_ICON[item.level]} {item.label}
                  </span>
                  <span className="settingsDiagnostic__itemNote">{item.note}</span>
                </div>
              </li>
            ))}
          </ul>

          <p className="settingsDiagnostic__footer">{report.footerMessage}</p>
        </>
      ) : (
        <p className="settingsDiagnostic__footer">確認中です…</p>
      )}

      <div className="settingsDiagnostic__actions">
        <button
          type="button"
          className="settingsDiagnostic__recheck"
          onClick={() => void runDiagnostic()}
          disabled={loading}
        >
          {loading ? '確認中…' : '設定したので再チェック'}
        </button>
        {errorMsg ? <span className="settingsDiagnostic__error">{errorMsg}</span> : null}
      </div>
    </section>
  );
}
