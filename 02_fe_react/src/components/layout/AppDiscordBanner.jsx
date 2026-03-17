import React from "react";

const discordInviteUrl =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

export default function AppDiscordBanner() {
  if (!discordInviteUrl) return null;

  return (
    <div className="app-discord-banner-wrap">
      <div className="app-discord-banner">
        <p className="app-discord-banner-text">
          일간 리포트와 추세 진입/이탈 알림을 디스코드에서 받아보세요.
        </p>
        <a
          className="app-discord-banner-link"
          href={discordInviteUrl}
          target="_blank"
          rel="noreferrer"
        >
          디스코드 입장하기 ↗
        </a>
      </div>
    </div>
  );
}
