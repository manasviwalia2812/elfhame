import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Milestone, History, Sparkles } from 'lucide-react';
import FairyDust from './FairyDust';
import towerData from '../data/places/tower_forgetting.json';
import audioSynth from '../utils/audio';

export default function TowerForgettingPage({ setGlobalLocation }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [duration, setDuration] = useState(3); // Fallback to 3s until metadata loads
  const [isFading, setIsFading] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Refs for tracking values within static event listeners
  const currentSceneIndexRef = useRef(0);
  const durationRef = useRef(3);
  const isTransitioning = useRef(false);
  const lastTransitionTime = useRef(0);

  useEffect(() => {
    currentSceneIndexRef.current = currentSceneIndex;
  }, [currentSceneIndex]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Manage custom scene audio and set global location
  useEffect(() => {
    setGlobalLocation('tower_forgetting');
    audioSynth.setScene('tower_forgetting');
    return () => {
      audioSynth.setScene('default');
    };
  }, [setGlobalLocation]);

  const handleReturn = () => {
    audioSynth.playMarkerClick();
    navigate('/book', { state: { returnFrom: 'tower_forgetting' } });
  };

  const handleReturnToMap = () => {
    audioSynth.playMarkerClick();
    navigate('/map');
  };

  // Video transition play forwards
  const advanceScene = () => {
    if (isTransitioning.current || Date.now() - lastTransitionTime.current < 800) return;
    const video = videoRef.current;
    if (!video) return;

    const currentIndex = currentSceneIndexRef.current;
    const nextIndex = currentIndex + 1;
    const checkpoints = [0, 2, durationRef.current];

    // If reaching the end of the video timeline, loop back to the first scene
    if (nextIndex >= checkpoints.length) {
      isTransitioning.current = true;
      setIsFading(true);
      audioSynth.playMarkerClick();

      // Faster loop-back transition timings
      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
        video.playbackRate = 1.0;
        setCurrentSceneIndex(0);

        setTimeout(() => {
          setIsFading(false);
          isTransitioning.current = false;
          lastTransitionTime.current = Date.now();
        }, 150); // fast fade-in completed
      }, 150); // fast fade-out completed
      return;
    }

    const targetTime = checkpoints[nextIndex];
    isTransitioning.current = true;
    audioSynth.playMarkerClick();

    // Fast forward transition by doubling playback rate to 2.5x
    video.playbackRate = 2.5;

    video.play().catch(err => {
      console.warn("Autoplay/Play blocked or failed:", err);
      // Fallback: Seek instantly and unlock
      video.currentTime = targetTime;
      setCurrentSceneIndex(nextIndex);
      isTransitioning.current = false;
      lastTransitionTime.current = Date.now();
    });

    // Check currentTime on every frame using requestAnimationFrame for frame accuracy
    let animationFrameId;
    const checkTime = () => {
      if (video.currentTime >= targetTime - 0.05) {
        video.pause();
        video.currentTime = targetTime; // snap precisely
        video.playbackRate = 1.0; // Reset playback rate
        setCurrentSceneIndex(nextIndex);
        isTransitioning.current = false;
        lastTransitionTime.current = Date.now();
      } else {
        animationFrameId = requestAnimationFrame(checkTime);
      }
    };
    animationFrameId = requestAnimationFrame(checkTime);
  };

  // Video transition play/scrub backwards
  const regressScene = () => {
    if (isTransitioning.current || Date.now() - lastTransitionTime.current < 800) return;
    const video = videoRef.current;
    if (!video) return;

    const currentIndex = currentSceneIndexRef.current;
    const prevIndex = currentIndex - 1;
    const checkpoints = [0, 2, durationRef.current];

    if (prevIndex < 0) return; // Restrict going back beyond Scene 1

    const targetTime = checkpoints[prevIndex];
    isTransitioning.current = true;
    audioSynth.playMarkerClick();

    // Faster backward scrubbing using requestAnimationFrame with larger decay step
    let animationFrameId;
    const scrubBack = () => {
      const current = video.currentTime;
      if (current <= targetTime + 0.05) {
        video.currentTime = targetTime; // snap precisely
        setCurrentSceneIndex(prevIndex);
        isTransitioning.current = false;
        lastTransitionTime.current = Date.now();
      } else {
        // Faster reverse easing step (0.22 factor instead of 0.12, 0.08 min step instead of 0.04)
        const nextTime = current - Math.max(0.08, (current - targetTime) * 0.22);
        video.currentTime = Math.max(targetTime, nextTime);
        animationFrameId = requestAnimationFrame(scrubBack);
      }
    };
    animationFrameId = requestAnimationFrame(scrubBack);
  };

  // Scroll and touch listeners mapping to segment transitions
  useEffect(() => {
    const handleWheel = (e) => {
      // If scroll target is within the sidebar panel, let it scroll natively and do not trigger animation
      if (e.target.closest('.detail-sidebar')) {
        return;
      }

      e.preventDefault(); // Fully prevent standard page scrolling/jacking
      if (isTransitioning.current || Date.now() - lastTransitionTime.current < 800) return;

      if (e.deltaY > 0) {
        advanceScene();
      } else if (e.deltaY < 0) {
        regressScene();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      // If touch target is within the sidebar panel, allow native touch scrolling
      if (e.target.closest('.detail-sidebar')) {
        return;
      }

      if (isTransitioning.current || Date.now() - lastTransitionTime.current < 800 || e.touches.length !== 1) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // Positive swipe up (scroll down)

      if (Math.abs(deltaY) > 50) {
        e.preventDefault();
        if (deltaY > 0) {
          advanceScene();
        } else {
          regressScene();
        }
        touchStartY = touchY; // Reset tracking point
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [duration]); // Rebind listener if video duration changes

  return (
    <div
      ref={containerRef}
      className="full-screen-scene"
      style={{
        background: '#030406',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
        touchAction: 'none'
      }}
    >
      {/* Scroll-driven Background Video */}
      <video
        ref={videoRef}
        src="/environment/forgotten_tower.mp4"
        muted
        playsInline
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          opacity: isFading ? 0 : 0.9,
          transition: 'opacity 0.15s ease-in-out' // Fast opacity transition matching loop back
        }}
      />

      {/* Fairy Dust overlaying the video background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <FairyDust />
      </div>

      {/* Return to book overlay button */}
      <button 
        className="btn-fantasy btn-return-book glow-gold" 
        onClick={handleReturn}
        style={{ zIndex: 30 }}
      >
        📖 RETURN TO BOOK
      </button>

      {/* Sidebar Details Panel */}
      <div
        className="detail-sidebar gothic-border"
        style={{
          zIndex: 15,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          borderColor: towerData.color
        }}
      >
        <button className="btn-back" onClick={handleReturnToMap} style={{ marginBottom: '10px' }}>
          <ArrowLeft size={16} /> Return to Map
        </button>

        <div className="sidebar-divider" />

        <h2 className="location-title" style={{ color: towerData.color }}>
          {towerData.name}
        </h2>
        
        <p className="location-quote">
          {towerData.quote}
        </p>

        <p className="location-desc">
          {towerData.description}
        </p>

        <div className="sidebar-divider" />

        {/* History section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: towerData.color, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <History size={14} /> HISTORY & ORIGIN
          </h4>
          <p style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#b0ab9f' }}>
            {towerData.history}
          </p>
        </div>

        {/* Major Events section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: towerData.color, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Milestone size={14} /> MAJOR EVENTS
          </h4>
          <ul style={{ listStyleType: 'square', marginLeft: '16px', fontSize: '0.8rem', lineHeight: '1.4', color: '#f5f3ef' }}>
            {towerData.events.map((event, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{event}</li>
            ))}
          </ul>
        </div>

        {/* Secrets section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#50c878', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Sparkles size={14} /> COURT SECRETS
          </h4>
          <ul style={{ listStyleType: 'circle', marginLeft: '16px' }}>
            {towerData.secrets.map((secret, idx) => (
              <li key={idx} style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#f5f3ef', marginBottom: '6px' }}>
                {secret}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
