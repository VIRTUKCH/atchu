import React from "react";

const discordInviteUrl =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <span className="app-footer-brand">Atchu</span>
      <p className="app-footer-disclaimer">
        본 서비스는 투자 참고용이며, 매수·매도를 권유하지 않습니다.<br />
        투자 결과에 대한 책임은 투자자 본인에게 있습니다.
      </p>
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
    </footer>
  );
}
