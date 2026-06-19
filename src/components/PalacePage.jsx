import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Milestone, History, Sparkles } from 'lucide-react';
import FairyDust from './FairyDust';
import audioSynth from '../utils/audio';

// Updated three-scene data with descriptive content and dialogues mapping to each scene
export const palaceScenes = [
  {
    name: "Palace of Elfhame",
    quote: "\"Most of all, I hate him because I think of him, often. It's like a disease.\"",
    description: "The royal seat of the High King, balancing on trees and stone columns above the sea. Beautiful, intimidating, and filled with dark court intrigue.",
    history: "Built upon massive, ancient ironwood trees and stone columns rising directly from the sea, the Palace of Elfhame has stood for centuries as the heart of faerie power. It represents both the beauty and the lethal dangers of the High Court, where mortal lives are traded for amusement and royal lineages are forged in blood.",
    events: [
      "Coronation of High King Cardan Greenbriar by the mortal Jude Duarte.",
      "The bloodbath of the coronation feast where Prince Dain was murdered.",
      "The treaty signing between the High Court of Elfhame and Queen Orlagh of the Undersea."
    ],
    secrets: [
      "Cardan's crown is made of hollow gold and silver oak leaves.",
      "Valerian is plotting with the exiled royalty to overthrow the throne.",
      "The Court of Shadows has placed spies behind the throne draperies."
    ],
    dialogue: {
      greeting: "The Palace of Elfhame",
      text: "The center of court intrigue, balancing above the churning sea. High King Cardan sits on the throne of thorns, drinking wine and mocking his subjects. It is a nest of vipers, gold, and hidden daggers. Do not let your guard down.",
      quote: "\"Most of all, I hate him because I think of him, often. It's like a disease.\""
    },
    audioTrack: 'kingdom'
  },
  {
    name: "The Throne Room & Blood Crown",
    quote: "\"Balekin's ambition cost Dain his life, and cost the realm its peace.\"",
    description: "The majestic golden hall where Prince Balekin betrayed his siblings, leading to a bloodbath that was ultimately usurped by Jude Duarte crowning Cardan as the High King.",
    history: "The throne room witnessed Balekin's ultimate treachery, slaughtering Prince Dain at the coronation feast. Yet, before Balekin could place the crown on his own head, Jude Duarte forced Cardan onto the throne, binding him to her command.",
    events: [
      "Prince Balekin's assassination of Prince Dain and Dain's personal guard.",
      "Jude Duarte's secret hostage negotiation with Cardan in the side chambers.",
      "The crowning of Cardan Greenbriar under Balekin's nose by Jude Duarte."
    ],
    secrets: [
      "Balekin forged an alliance with the Court of Shadows' traitors.",
      "The crown's blood stains are covered by thin layers of gold leaf.",
      "Cardan was forced to accept the crown under threat of a mortal blade."
    ],
    dialogue: {
      greeting: "The Throne of Thorns",
      text: "Balekin's betrayal stained these golden floors. He killed Dain for a crown he would never wear. I forced Cardan onto this throne to keep my brother safe. Power here is won with blood and held with lies.",
      quote: "\"I want to win. I do not yearn to be good.\""
    },
    audioTrack: 'rains'
  },
  {
    name: "The Court of Shadows",
    quote: "\"We strike from the dark, unseen and unheard.\"",
    description: "Located in the hidden crawlspaces and sea tunnels beneath the Palace of Elfhame, this espionage network gathers the whispers that shake the high court.",
    history: "Founded by Prince Dain to serve as his personal spy agency, it was later decimated by the Ghost's betrayal. Under Jude Duarte's leadership, the Court of Shadows rose again to manipulate the crowns of faerie from the dark.",
    events: [
      "The founding of the Court of Shadows by Prince Dain using outcasts.",
      "The Ghost's tragic betrayal and the near-total destruction of their agents.",
      "Jude Duarte taking command and using their tunnels to spy on Balekin."
    ],
    secrets: [
      "The Ghost sold royal secrets to Balekin for gold.",
      "Under-floor grates allow agents to hear every whisper in the throne room.",
      "The Roach knows the true names of half the High Council."
    ],
    dialogue: {
      greeting: "Whispers in the Dark",
      text: "The Court of Shadows was founded by Prince Dain, but it was almost completely destroyed by the Ghost's betrayal. Now, we use their tunnels to make sure no secret in Elfhame stays hidden. In the dark, we are kings.",
      quote: "\"Secrets are the most valuable currency in all of Elfhame.\""
    },
    audioTrack: 'sonicon'
  }
];

export default function PalacePage({ setGlobalLocation, onSceneChange }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [duration, setDuration] = useState(8); // Fallback until metadata loads
  const [isFading, setIsFading] = useState(false);

  // Keep state updated in refs for event listeners to avoid stale values
  const currentSceneIndexRef = useRef(0);
  const durationRef = useRef(8);
  const isTransitioning = useRef(false);
  const lastTransitionTime = useRef(0); // Track timestamp to prevent inertia double-triggering

  useEffect(() => {
    currentSceneIndexRef.current = currentSceneIndex;
  }, [currentSceneIndex]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Set global location, scene data callback, and start ambient music
  useEffect(() => {
    setGlobalLocation('palace');
    audioSynth.setScene('palace');
    audioSynth.setPalaceTrack('kingdom');
    
    // Set initial scene data on load
    if (onSceneChange) {
      onSceneChange(palaceScenes[0]);
    }

    return () => {
      audioSynth.setScene('default');
      // Reset scene data when component unmounts
      if (onSceneChange) {
        onSceneChange(null);
      }
    };
  }, [setGlobalLocation, onSceneChange]);

  const handleReturn = () => {
    audioSynth.playMarkerClick();
    navigate('/book', { state: { returnFrom: 'palace' } });
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
    const checkpoints = [0, 3, durationRef.current];

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
        audioSynth.setPalaceTrack('kingdom');
        if (onSceneChange) onSceneChange(palaceScenes[0]);

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
      audioSynth.setPalaceTrack(palaceScenes[nextIndex].audioTrack);
      if (onSceneChange) onSceneChange(palaceScenes[nextIndex]);
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
        audioSynth.setPalaceTrack(palaceScenes[nextIndex].audioTrack);
        if (onSceneChange) onSceneChange(palaceScenes[nextIndex]);
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
    const checkpoints = [0, 3, durationRef.current];

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
        audioSynth.setPalaceTrack(palaceScenes[prevIndex].audioTrack);
        if (onSceneChange) onSceneChange(palaceScenes[prevIndex]);
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
        background: '#020504',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
        touchAction: 'none'
      }}
    >
      {/* Scroll-driven Background Video */}
      <video
        ref={videoRef}
        src="/environment/palace_elfhame.mp4"
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

      {/* Left detail description panel sidebar */}
      <DescriptionPanel
        sceneData={palaceScenes[currentSceneIndex]}
        handleReturnToMap={handleReturnToMap}
      />
    </div>
  );
}

// Sidebar details panel component structured exactly as original but dynamic
function DescriptionPanel({ sceneData, handleReturnToMap }) {
  if (!sceneData) return null;

  return (
    <div
      className="detail-sidebar gothic-border"
      style={{
        zIndex: 15,
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto'
      }}
    >
      <button className="btn-back" onClick={handleReturnToMap} style={{ marginBottom: '10px' }}>
        <ArrowLeft size={16} /> Return to Map
      </button>

      <div className="sidebar-divider" />

      <h2 className="location-title" style={{ color: '#d4af37' }}>
        {sceneData.name}
      </h2>
      
      <p className="location-quote">
        {sceneData.quote}
      </p>

      <p className="location-desc">
        {sceneData.description}
      </p>

      <div className="sidebar-divider" />

      {/* History section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
          <History size={14} /> HISTORY & ORIGIN
        </h4>
        <p style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#b0ab9f' }}>
          {sceneData.history}
        </p>
      </div>

      {/* Major Events section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
          <Milestone size={14} /> MAJOR EVENTS
        </h4>
        <ul style={{ listStyleType: 'square', marginLeft: '16px', fontSize: '0.8rem', lineHeight: '1.4', color: '#f5f3ef' }}>
          {sceneData.events.map((event, idx) => (
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
          {sceneData.secrets.map((secret, idx) => (
            <li key={idx} style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#f5f3ef', marginBottom: '6px' }}>
              {secret}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
