import { useEffect, useMemo, useState } from "react";
import Typewriter from "typewriter-effect";
import { useTranslation } from "react-i18next";
import { calculateProgressScore, normalizeScore } from "../utils/score.js";

const typewriterOptions = {
  delay: 10,
  cursor: "",
};

export default function Finish({
  active = false,
  onClose,
  userName,
  startTime,
  lessonNumber = 1,
  totalLessons = 1,
  nodes = [],
  edges = [],
  score,
  token,
}) {
  const { t, i18n } = useTranslation();
  const [transitionState, setTransitionState] = useState(0);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [finishTime, setFinishTime] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [typewriterLine, setTypewriterLine] = useState("");
  const [backendSummary, setBackendSummary] = useState(null);

  const backendName = backendSummary?.username?.trim();
  const displayName = userName?.trim()
    ? userName
    : backendName || t("finish.player");
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language),
    [i18n.language],
  );

  useEffect(() => {
    if (!active) {
      setTransitionState(0);
      setShowTypewriter(false);
      setShowStats(false);
      setScoreDisplay(0);
      setFinishTime(0);
      setBackendSummary(null);
      return;
    }

    const baseline = typeof startTime === "number" ? startTime : Date.now();
    setFinishTime(Math.max(0, Date.now() - baseline));

    const lines = t("finish.typewriterLines", { returnObjects: true });
    const lineList = Array.isArray(lines) ? lines : [lines];
    const chosen = lineList[Math.floor(Math.random() * lineList.length)] || "";
    setTypewriterLine(chosen);

    const transitionTimer = setTimeout(() => setTransitionState(1), 60);
    const typeTimer = setTimeout(() => setShowTypewriter(true), 360);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(typeTimer);
    };
  }, [active, startTime, t]);

  useEffect(() => {
    if (!active || !token) return;
    let cancelled = false;

    async function fetchSummary() {
      try {
        const response = await fetch(
          "https://aiserver.purkynthon.online/api/auth/finish-summary",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jwt_token: token }),
          },
        );
        const data = await response.json();
        if (!cancelled && data?.success) {
          setBackendSummary(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load finish summary", error);
        }
      }
    }

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [active, token]);

  useEffect(() => {
    if (!active || !onClose) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onClose]);

  const scoreTarget = useMemo(() => {
    const backendScore = backendSummary?.score;
    if (typeof backendScore === "number") {
      return normalizeScore(backendScore);
    }
    if (typeof score === "number") {
      return normalizeScore(score);
    }
    return calculateProgressScore({
      completedLessons: lessonNumber,
      totalLessons,
    });
  }, [backendSummary, score, lessonNumber, totalLessons]);

  useEffect(() => {
    if (!showStats) return;
    let rafId = 0;
    const duration = 1400;
    const start = performance.now();
    const startValue = 0;

    const animate = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValue + (scoreTarget - startValue) * eased);
      setScoreDisplay(value);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [showStats, scoreTarget]);

  const formattedTime = useMemo(() => {
    const backendTime = backendSummary?.last_lesson?.time_to_finish;
    const timeSource =
      typeof backendTime === "number" ? backendTime : finishTime;
    const totalSeconds = Math.max(0, Math.floor(timeSource / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours}${t("finish.units.hours")}`);
    }
    parts.push(`${minutes}${t("finish.units.minutes")}`);
    parts.push(`${seconds}${t("finish.units.seconds")}`);
    return parts.join(" ");
  }, [backendSummary, finishTime, t]);

  const stats = useMemo(() => {
    return [
      { label: t("finish.stats.time"), value: formattedTime },
      {
        label: t("finish.stats.lessons"),
        value: `${lessonNumber}/${totalLessons}`,
      },
    ];
  }, [
    formattedTime,
    lessonNumber,
    numberFormatter,
    t,
    totalLessons,
  ]);

  const panelVisible = active && transitionState === 1;

  return (
    <div
      className={`fixed inset-0 z-[99999999999] overflow-hidden transition-opacity duration-700 ${
        active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <style>{`
        @keyframes finish-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes finish-drift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-120px, -80px, 0); }
        }
        @keyframes finish-pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .finish-anim { animation: none !important; transition: none !important; }
        }
      `}</style>
      <div className="absolute inset-0 bg-bg" />
      <div
        className="absolute -inset-[50%] bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.25)_45%,transparent_70%)]"
        style={{
          transform: transitionState === 0 ? "scale(0)" : "scale(1)",
          transformOrigin: "bottom right",
          transition: "transform 1.2s cubic-bezier(0.2, 0.9, 0.2, 1)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30 finish-anim"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          animation: "finish-drift 24s linear infinite",
        }}
      />
      <div
        className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-ctp-blue-500 opacity-20 blur-3xl finish-anim"
        style={{ animation: "finish-pulse 8s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-ctp-green-500 opacity-20 blur-3xl finish-anim"
        style={{ animation: "finish-float 10s ease-in-out infinite" }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-10">
        <div
          className={`relative w-full max-w-5xl rounded-[28px] border border-border bg-runner-bg shadow-[0_30px_120px_rgba(0,0,0,0.5)] transition-all duration-700 ${
            panelVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px]" />
          <div className="relative px-8 py-10 sm:px-12 sm:py-12">
            <div className="flex flex-col gap-8">
              <div className="min-h-[120px]">
                {showTypewriter && (
                  <Typewriter
                    options={typewriterOptions}
                    onInit={(typewriter) => {
                      const line = typewriterLine || "";
                      typewriter
                        .typeString(
                          `<span class="text-4xl sm:text-5xl font-semibold text-text-light">${t(
                            "finish.title",
                          )}</span>`,
                        )
                        .pauseFor(200)
                        .typeString(
                          `<br /><span class="text-lg sm:text-xl text-text-dark">${t(
                            "finish.subtitle",
                          )}</span>`,
                        )
                        .pauseFor(350)
                        .typeString(
                          `<br /><span class="text-base text-text-dark">${line}</span>`,
                        )
                        .pauseFor(200)
                        .callFunction(() => {
                          setShowStats(true);
                        })
                        .start();
                    }}
                  />
                )}
              </div>

              <div
                className={`flex flex-col gap-6 transition-all duration-700 ${
                  showStats
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.35em] text-text-dark">
                      {t("finish.recap")}
                    </div>
                    <div className="text-3xl sm:text-4xl font-semibold text-text-light">
                      {t("finish.scoreLabel")}
                    </div>
                  </div>
                  <div className="text-5xl sm:text-6xl font-bold text-ctp-green-400">
                    {numberFormatter.format(scoreDisplay)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`rounded-2xl border border-border bg-bg px-5 py-4 transition-all duration-700 ${
                        showStats
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${150 + index * 120}ms` }}
                    >
                      <div className="text-[11px] uppercase tracking-[0.3em] text-text-dark">
                        {stat.label}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-text-light">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`text-lg sm:text-xl text-text-light transition-all duration-700 ${
                    showStats
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                  style={{ transitionDelay: "520ms" }}
                >
                  {t("finish.congrats", { name: displayName })}
                </div>
                <div
                  className={`text-sm uppercase tracking-[0.25em] text-text-dark transition-all duration-700 ${
                    showStats ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: "680ms" }}
                >
                  {t("finish.thanks")}
                </div>
              </div>
            </div>
          </div>

          {onClose && (
            <button
              className="absolute right-6 top-6 rounded-xl border border-border bg-button px-4 py-2 text-sm font-semibold text-text-light transition hover:bg-button-hover"
              onClick={onClose}
            >
              {t("finish.close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
