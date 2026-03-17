"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AVATAR_ICON_MAP } from "@/lib/constants";

export default function UserAvatar({ avatar, t, size = 32, borderRadius = 8, fontSize = 14, style = {} }) {
  const isUrl = avatar?.startsWith("http") || avatar?.startsWith("data:image");

  if (isUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius, overflow: "hidden", flexShrink: 0, ...style }}>
        <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, borderRadius, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize, flexShrink: 0, color: "#fff", ...style }}>
      <FontAwesomeIcon icon={AVATAR_ICON_MAP[avatar] || AVATAR_ICON_MAP.user} />
    </div>
  );
}
