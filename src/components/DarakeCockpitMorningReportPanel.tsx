import React, { useState, useEffect } from 'react';
import {
  type DarakeCockpitMorningReport,
  loadCockpitMorningReports,
  buildCockpitMorningReport,
  saveMorningReport,
} from '../utils/darakeCockpitMorningReport';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';

function ReportCard({ report }: { report: DarakeCockpitMorningReport }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="cockpitMorningReport__card">
      <div className="cockpitMorningReport__cardHeader">
        <div>
          <div className="cockpitMorningReport__reportTitle">{report.title}</div>
          <div className="cockpitMorningReport__reportDate">
            {new Date(report.createdAt).toLocaleString('ja-JP')}
          </div>
        </div>
        <button
          className="cockpitMorningReport__expandBtn"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? '閉じる' : '詳細'}
        </button>
      </div>
      <div className="cockpitMorningReport__summary">{report.summary}</div>

      {expanded && (
        <div className="cockpitMorningReport__details">
          {report.completedTaskIds.length > 0 && (
            <div className="cockpitMorningReport__section cockpitMorningReport__section--green">
              <div className="cockpitMorningReport__sectionTitle">🎉 昨夜進んだこと・完了したこと</div>
              <div className="cockpitMorningReport__count">{report.completedTaskIds.length}件完了</div>
            </div>
          )}
          {report.askLaterTaskIds.length > 0 && (
            <div className="cockpitMorningReport__section cockpitMorningReport__section--amber">
              <div className="cockpitMorningReport__sectionTitle">後で聞くこと</div>
              <div className="cockpitMorningReport__count">{report.askLaterTaskIds.length}件</div>
            </div>
          )}
          {report.blockedHardTaskIds.length > 0 && (
            <div className="cockpitMorningReport__section cockpitMorningReport__section--red">
              <div className="cockpitMorningReport__sectionTitle">⚠️ Hard Stop</div>
              <div className="cockpitMorningReport__count">{report.blockedHardTaskIds.length}件</div>
            </div>
          )}
          {report.nextRecommendedAction && (
            <div className="cockpitMorningReport__section cockpitMorningReport__section--blue">
              <div className="cockpitMorningReport__sectionTitle">次のおすすめ</div>
              <div className="cockpitMorningReport__nextAction">{report.nextRecommendedAction}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DarakeCockpitMorningReportPanel() {
  const [reports, setReports] = useState<DarakeCockpitMorningReport[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setReports(loadCockpitMorningReports());
  }, []);

  const refresh = () => setReports(loadCockpitMorningReports());

  const handleGenerate = () => {
    const tasks = loadDarakeTaskQueue();
    const report = buildCockpitMorningReport(tasks);
    saveMorningReport(report);
    refresh();
    setMessage('レポートを生成しました');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="cockpitMorningReport">
      <div className="cockpitMorningReport__header">
        <h2 className="cockpitMorningReport__title">朝レポート</h2>
        <button
          className="cockpitMorningReport__generateBtn"
          onClick={handleGenerate}
        >
          今のキューからレポートを生成
        </button>
      </div>

      {message && (
        <div className="cockpitMorningReport__message">{message}</div>
      )}

      {reports.length === 0 && (
        <div className="cockpitMorningReport__empty">朝レポートはまだありません</div>
      )}

      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
