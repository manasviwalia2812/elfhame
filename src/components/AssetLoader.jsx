import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
  AssetLoader
  -----------
  Preloads every asset your app needs (images, audio, video, fonts) BEFORE
  rendering children, so nothing buffers or pops in once the user is inside
  the experience.
*/

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ url, ok: true });
    img.onerror = () => resolve({ url, ok: false });
    img.src = url;
  });
}

function loadAudio(url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'auto';
    const done = (ok) => resolve({ url, ok });
    audio.addEventListener('canplaythrough', () => done(true), { once: true });
    audio.addEventListener('error', () => done(false), { once: true });
    audio.src = url;
    audio.load();
  });
}

function loadVideo(url) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    const done = (ok) => resolve({ url, ok });
    video.addEventListener('canplaythrough', () => done(true), { once: true });
    video.addEventListener('error', () => done(false), { once: true });
    video.src = url;
    video.load();
  });
}

function loadFont(url) {
  // Expects the @font-face to already be declared in CSS with this same url.
  return new Promise((resolve) => {
    if (!('FontFace' in window)) {
      resolve({ url, ok: true });
      return;
    }
    fetch(url)
      .then((res) => res.ok ? resolve({ url, ok: true }) : resolve({ url, ok: false }))
      .catch(() => resolve({ url, ok: false }));
  });
}

const LOADERS = {
  image: loadImage,
  audio: loadAudio,
  video: loadVideo,
  font: loadFont
};

export default function AssetLoader({ manifest = [], children, minDisplayTime = 1800 }) {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const startTimeRef = useRef(Date.now());
  const failedRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    const total = manifest.length || 1;

    if (manifest.length === 0) {
      setProgress(100);
      setIsReady(true);
      return;
    }

    let completed = 0;

    const promises = manifest.map((asset) => {
      const loader = LOADERS[asset.type] || loadImage;
      return loader(asset.url).then((result) => {
        if (cancelled) return result;
        if (!result.ok) failedRef.current.push(result.url);
        completed += 1;
        setLoadedCount(completed);
        setProgress(Math.round((completed / total) * 100));
        return result;
      });
    });

    Promise.all(promises).then(() => {
      if (cancelled) return;
      if (failedRef.current.length > 0) {
        console.warn('AssetLoader: some assets failed to preload', failedRef.current);
      }
      setIsReady(true);
    });

    return () => { cancelled = true; };
  }, [manifest]);

  useEffect(() => {
    if (!isReady) return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    const timer = setTimeout(() => setShowLoader(false), remaining);
    return () => clearTimeout(timer);
  }, [isReady, minDisplayTime]);

  return (
    <>
      <AnimatePresence>
        {showLoader && (
          <MagicalLoadingScreen
            progress={progress}
            loadedCount={loadedCount}
            total={manifest.length}
          />
        )}
      </AnimatePresence>
      {!showLoader && children}
    </>
  );
}

function MagicalLoadingScreen({ progress, loadedCount, total }) {
  const sparkles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      size: 2 + Math.random() * 3
    }))
  ).current;

  return (
    <motion.div
      className="magical-loader-root"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="magical-loader-sparkle-field">
        {sparkles.map((s) => (
          <span
            key={s.id}
            className="magical-loader-sparkle"
            style={{
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`
            }}
          />
        ))}
      </div>

      <div className="magical-loader-content">
        <div className="magical-loader-sigil">
          <svg viewBox="0 0 100 100" width="84" height="84">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(212,175,55,0.18)"
              strokeWidth="1.5"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="264"
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              transform="rotate(-90 50 50)"
            />
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '50px', originY: '50px' }}
            >
              <path
                d="M50 20 L54 46 L80 50 L54 54 L50 80 L46 54 L20 50 L46 46 Z"
                fill="#d4af37"
                opacity="0.85"
              />
            </motion.g>
          </svg>
        </div>

        <h2 className="magical-loader-title">Opening the Atlas</h2>
        <p className="magical-loader-subtitle">
          Gathering the ink, the parchment, and the old magic
        </p>

        <div className="magical-loader-progress-track">
          <motion.div
            className="magical-loader-progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="magical-loader-count">{progress}%{total > 0 ? ` (${loadedCount}/${total})` : ''}</p>
      </div>

      <style>{`
        .magical-loader-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0b0f14;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .magical-loader-sparkle-field {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .magical-loader-sparkle {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          background: #d4af37;
          opacity: 0;
          animation-name: magicalLoaderRise;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
          box-shadow: 0 0 4px 1px rgba(212,175,55,0.6);
        }

        @keyframes magicalLoaderRise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-90vh) translateX(20px);
            opacity: 0;
          }
        }

        .magical-loader-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 24px;
        }

        .magical-loader-sigil {
          margin-bottom: 24px;
        }

        .magical-loader-title {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          color: #e8d9a8;
          letter-spacing: 0.08em;
          margin: 0 0 8px;
        }

        .magical-loader-subtitle {
          font-family: var(--font-body, serif);
          font-size: 0.85rem;
          font-style: italic;
          color: #8a7a52;
          margin: 0 0 28px;
        }

        .magical-loader-progress-track {
          width: 240px;
          height: 4px;
          background: rgba(212,175,55,0.15);
          border-radius: 2px;
          overflow: hidden;
        }

        .magical-loader-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8a6f27, #d4af37);
          border-radius: 2px;
        }

        .magical-loader-count {
          margin-top: 10px;
          font-family: var(--font-body, monospace);
          font-size: 0.75rem;
          color: #6b5d3c;
          letter-spacing: 0.05em;
        }
      `}</style>
    </motion.div>
  );
}
