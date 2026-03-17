import React from "react";
import { Link } from "react-router-dom";

const discordUrl =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

export default function LandingDiscordCTA() {
  return (
    <section className="landing-cta">
      <div className="landing-cta-bg-orb" aria-hidden="true" />
      <div className="landing-section-inner">
        <div className="landing-cta-content">
          <p className="landing-cta-eyebrow">지금 바로 시작하세요</p>
          <h2 className="landing-cta-headline">
            이제 뉴스보다 먼저<br />알 수 있습니다.
          </h2>
          <p className="landing-cta-desc">
            매일 아침 추세 알림을 받거나, 직접 ETF를 탐색해 보세요.
          </p>
          <div className="landing-cta-btns">
            {discordUrl && (
              <a
                className="landing-discord-btn landing-discord-btn--cta"
                href={discordUrl}
                target="_blank"
                rel="noreferrer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 13.894 13.894 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Discord 알림 받기 ↗
              </a>
            )}
            <Link to="/guide" className="landing-explore-btn">
              가이드 보고 시작하기 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
