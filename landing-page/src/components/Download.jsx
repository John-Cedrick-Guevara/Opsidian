import React, { useState } from "react";

import { Icons } from "./Icons";

import { useReveal } from "../hooks/useReveal";

import DownloadWarningModal from "./DownloadWarningModal";

const GITHUB_URL = "https://github.com/John-Cedrick-Guevara/Opsidian.git";

const Download = () => {
  const [ref, visible] = useReveal();

  const [warningOpen, setWarningOpen] = useState(false);

  const [pendingDownload, setPendingDownload] = useState(null);

  const platforms = [
    {
      icon: <Icons.Apple />,

      name: "macOS",

      meta: "Universal · 124 MB",

      body: "Apple Silicon and Intel. DMG install. Minimum macOS 11.",

      action: "Download .dmg",

      available: false,

      filename: "Opsidian-0.1.0-mac.dmg",
    },

    {
      icon: <Icons.Windows />,

      name: "Windows",

      meta: "x64 installer",

      body: "Windows 10 and 11. Run the installer — no account required.",

      action: "Download .exe",

      available: true,

      filename: "Opsidian-0.1.0-win.exe",

      warnBeforeDownload: true,
    },

    {
      icon: <Icons.Linux />,

      name: "Linux",

      meta: "AppImage",

      body: "AppImage for most distros. Works on Wayland and X11.",

      action: "Download",

      available: false,

      filename: "Opsidian-0.1.0-linux.AppImage",
    },

    {
      icon: <Icons.Apple />,

      name: "iOS",

      meta: "iPhone & iPad",

      body: "Native iOS app, end-to-end encrypted sync with your desktop. Reads the same markdown.",

      action: "Coming soon",

      available: false,
    },

    {
      icon: <Icons.Android />,

      name: "Android",

      meta: "Android 10+",

      body: "Native Android, same CRDT sync. APK and Play Store. Reads the same markdown.",

      action: "Coming soon",

      available: false,
    },

    {
      icon: <Icons.GitHub />,

      name: "Build from source",

      meta: "MIT licensed",

      body: "The desktop client is open source. Clone, build, audit, fork. The sync server is a separate binary.",

      action: "View on GitHub",

      available: true,

      github: true,
    },
  ];

  const startDownload = (filename) => {
    const link = document.createElement("a");

    link.href = `/releases/${filename}`;

    link.download = filename;

    link.rel = "noopener";

    document.body.appendChild(link);

    link.click();

    link.remove();
  };

  const handleDownloadClick = (e, platform) => {
    if (platform.github) return;

    if (platform.warnBeforeDownload) {
      e.preventDefault();

      setPendingDownload(platform.filename);

      setWarningOpen(true);
    }
  };

  const handleConfirmDownload = () => {
    if (pendingDownload) startDownload(pendingDownload);

    setWarningOpen(false);

    setPendingDownload(null);
  };

  const handleCloseWarning = () => {
    setWarningOpen(false);

    setPendingDownload(null);
  };

  return (
    <section className="download" id="download">
      <div className="container">
        <div
          ref={ref}
          className={`reveal download__header${visible ? " is-visible" : ""}`}
        >
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            Download
          </div>

          <h2 className="download__title">Get Opsidian.</h2>

          <p className="download__sub">
            Free during beta. Local-first forever. No account, no telemetry, no
            upgrade tiers.
          </p>
        </div>

        <div className="download__cards">
          {platforms.map((p, i) => (
            <div
              className={`dl-card${!p.available && !p.github ? " dl-card--soon" : ""}`}
              key={i}
            >
              <div className="dl-card__top">
                <div className="dl-card__icon">{p.icon}</div>

                <div>
                  <div className="dl-card__name">{p.name}</div>

                  <div className="dl-card__meta">{p.meta}</div>
                </div>
              </div>

              <div className="dl-card__body">{p.body}</div>

              {p.available ? (
                <a
                  className="dl-card__action"
                  href={p.github ? GITHUB_URL : `/releases/${p.filename}`}
                  download={p.github ? undefined : p.filename}
                  target={p.github ? "_blank" : undefined}
                  rel={p.github ? "noopener noreferrer" : undefined}
                  onClick={(e) => handleDownloadClick(e, p)}
                >
                  <span>{p.action}</span>

                  <Icons.ArrowRight />
                </a>
              ) : (
                <div className="dl-card__action dl-card__action--soon">
                  <span>{p.action}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="download__footnote">
          Desktop beta is stable enough for daily use. Mobile is in private
          TestFlight — <a href="#top">join the waitlist</a>.
        </p>
      </div>

      <DownloadWarningModal
        open={warningOpen}
        onClose={handleCloseWarning}
        onConfirm={handleConfirmDownload}
        filename={pendingDownload}
      />
    </section>
  );
};

export default Download;
