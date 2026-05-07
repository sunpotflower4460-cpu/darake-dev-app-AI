import { useState } from 'react';

export type OneActionCardProps = {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  detailText?: string;
};

export function OneActionCard({
  title,
  message,
  primaryLabel,
  onPrimary,
  primaryLoading,
  secondaryLabel,
  onSecondary,
  detailText,
}: OneActionCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="oneActionCard">
      <div className="oneActionCard__title">{title}</div>
      <div className="oneActionCard__message">{message}</div>

      <div className="oneActionCard__actions">
        <button
          type="button"
          className="oneActionCard__primaryBtn"
          onClick={onPrimary}
          disabled={primaryLoading}
        >
          {primaryLoading ? '送信中...' : primaryLabel}
        </button>

        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className="oneActionCard__secondaryBtn"
            onClick={onSecondary}
            disabled={primaryLoading}
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      {detailText && (
        <div className="oneActionCard__detail">
          <button
            type="button"
            className="oneActionCard__detailToggle"
            onClick={() => setDetailOpen((v) => !v)}
          >
            {detailOpen ? '詳細を閉じる' : '詳細を見る'}
          </button>
          {detailOpen && (
            <pre className="oneActionCard__detailText">{detailText}</pre>
          )}
        </div>
      )}
    </div>
  );
}
