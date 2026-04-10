import React from "react";
import { Link } from "react-router-dom";

const discordInviteUrl =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <span className="app-footer-brand">Atchu</span>
      <p className="app-footer-disclaimer">
        본 서비스는 투자 참고용 데이터이며, 매수·매도를 권유하지 않습니다.<br />
        과거 백테스트 결과이며 미래 수익을 보장하지 않습니다.<br />
        투자 결정과 책임은 전적으로 본인에게 있습니다.<br />
        데이터 출처: EODHD
      </p>
      <div className="app-footer-links">
        <Link to="/terms" className="app-footer-link">이용약관</Link>
        <Link to="/privacy" className="app-footer-link">개인정보 처리방침</Link>
        {discordInviteUrl && (
          <a
            className="app-footer-discord"
            href={discordInviteUrl}
            target="_blank"
            rel="noreferrer"
          >
            Discord ↗
          </a>
        )}
      </div>
    </footer>
  );
}
