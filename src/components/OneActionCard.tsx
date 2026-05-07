import { useState } from 'react';

export type OneActionCardProps = {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  detailText?: string;
};

export function OneActionCard({
  title,
  message,
  primaryLabel,
  onPrimary,
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
        >
          {primaryLabel}
        </button>

        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className="oneActionCard__secondaryBtn"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      {detailText && (
        <div className="oneActionCard__detailSection">
          <button
            type="button"
            className="oneActionCard__detailToggle"
            onClick={() => setDetailOpen((v) => !v)}
          >
            {detailOpen ? '詳細を閉じる' : '詳細を見る'}
          </button>
          {detailOpen && (
            <div className="oneActionCard__detailBody">{detailText}</div>
          )}
        </div>
      )}
    </div>
  );
}
