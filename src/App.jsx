import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import BookAtlas from './components/BookAtlas';
import MapPage from './components/MapPage';
import PalacePage from './components/PalacePage';
import UnderseaPage from './components/UnderseaPage';
import CrownForestPage from './components/CrownForestPage';
import TowerForgettingPage from './components/TowerForgettingPage';
import CharacterGuide from './components/CharacterGuide';
import FairyDust from './components/FairyDust';
import FolkGallery from './components/FolkGallery';
import audioSynth from './utils/audio';
import AssetLoader from './components/AssetLoader';
import { ASSET_MANIFEST } from './data/assetManifest';

export default function App() {
  return (
    <AssetLoader manifest={ASSET_MANIFEST}>
      <Router>
        <AppContent />
      </Router>
    </AssetLoader>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('elfhame_audio_enabled') === 'true';
  });
  const [volume, setVolume] = useState(0.35);
  const [showHelp, setShowHelp] = useState(false);
  const [showLandingContent, setShowLandingContent] = useState(false);
  const [globalLocation, setGlobalLocation] = useState('landing');
  const [welcomeActive, setWelcomeActive] = useState(false);

  const isLanding = location.pathname === '/';

  // Restore audio synth on mount if enabled
  useEffect(() => {
    if (audioEnabled) {
      audioSynth.start();
      audioSynth.setVolume(volume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Landing content delay timer
  useEffect(() => {
    if (isLanding) {
      setGlobalLocation('landing');
      const timer = setTimeout(() => {
        setShowLandingContent(true);
      }, 4500); // 4.5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [isLanding]);

  const handleToggleAudio = () => {
    if (audioEnabled) {
      audioSynth.stop();
      setAudioEnabled(false);
      localStorage.setItem('elfhame_audio_enabled', 'false');
    } else {
      audioSynth.start();
      audioSynth.setVolume(volume);
      setAudioEnabled(true);
      localStorage.setItem('elfhame_audio_enabled', 'true');
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
  };

  const handleStart = () => {
    audioSynth.start();
    audioSynth.setVolume(volume);
    setAudioEnabled(true);
    localStorage.setItem('elfhame_audio_enabled', 'true');
    setWelcomeActive(true);
    navigate('/book');
  };

  const isPalace = location.pathname === '/palace';
  const isUndersea = location.pathname === '/undersea';
  const isForest = location.pathname === '/crown_forest';
  const isTower = location.pathname === '/tower_forgetting';
  const hideGlobalOverlays = isPalace || isUndersea || isForest || isTower;

  return (
    <div className="elfhame-app">
      {/* Mystical Background Mist */}
      {!hideGlobalOverlays && <div className="mist-layer" />}
      {!hideGlobalOverlays && <div className="vignette" />}
      {!hideGlobalOverlays && <div className="overlay-particles" />}

      {/* AUDIO CONTROL BAR (Top Right) */}
      {!isLanding && (
        <div className="audio-controls-container">
          <button 
            className="btn-audio-toggle glow-gold" 
            onClick={handleToggleAudio}
            title={audioEnabled ? 'Mute Ambiance' : 'Unmute Ambiance'}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {audioEnabled && (
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          )}
          
          <button 
            className="btn-audio-toggle glow-gold"
            onClick={() => setShowHelp(!showHelp)}
            title="Help & Lore"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      )}

      {/* TOP HEADER (Centered) */}
      {!isLanding && (
        <header className="app-header">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="header-title"
            onClick={() => {
              audioSynth.playMarkerClick();
              navigate('/book');
            }}
          >
            ELFHAME
          </motion.h2>
          <p className="header-subtitle">THE LIVING ATLAS</p>
        </header>
      )}

      {/* ROUTES CONFIGURATION */}
      <Routes>
        {/* Landing View */}
        <Route path="/" element={
          <AnimatePresence>
            {isLanding && (
              <motion.div 
                className="landing-overlay"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
              >
                <video
                  className="landing-video"
                  src="/environment/entrytoelfhame.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <FairyDust />
                <AnimatePresence>
                  {showLandingContent && (
                    <>
                      <motion.div 
                        className="landing-content gothic-border"
                        initial={{ opacity: 0, y: 35, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h1 className="landing-title">ELFHAME</h1>
                        <div className="landing-divider" />
                        <p className="landing-tagline">
                          "If I cannot be better than them, I will become so much worse."
                        </p>
                        <p className="landing-intro">
                          You stand at the border of the mortal world and the faerie courts. 
                          A world of glassmorphic magic, silver promises, emerald poisons, and royal betrayal. 
                          Open the enchanted atlas and claim your place in the court.
                        </p>
                        <button className="btn-fantasy btn-enter glow-gold" onClick={handleStart}>
                          ENTER THE COURT
                        </button>
                      </motion.div>

                      <motion.div 
                        className="landing-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      >
                        Inspired by Holly Black's <i>The Cruel Prince</i> Trilogy.
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        } />

        {/* Book Atlas View */}
        <Route path="/book" element={
          <BookAtlas setGlobalLocation={setGlobalLocation} />
        } />

        {/* Folk Gallery View */}
        <Route path="/gallery" element={
          <FolkGallery setGlobalLocation={setGlobalLocation} />
        } />

        {/* 3D Atlas Map View */}
        <Route path="/map" element={
          <MapPage setGlobalLocation={setGlobalLocation} />
        } />

        {/* 3D Palace Hall View */}
        <Route path="/palace" element={
          <PalacePage setGlobalLocation={setGlobalLocation} />
        } />

        {/* Undersea Kingdom View */}
        <Route path="/undersea" element={
          <UnderseaPage setGlobalLocation={setGlobalLocation} />
        } />

        {/* Crown Forest View */}
        <Route path="/crown_forest" element={
          <CrownForestPage setGlobalLocation={setGlobalLocation} />
        } />

        {/* Tower of Forgetting View */}
        <Route path="/tower_forgetting" element={
          <TowerForgettingPage setGlobalLocation={setGlobalLocation} />
        } />
      </Routes>

      {/* Global Fairy Dust overlaying the 3D Scenes */}
      {!isLanding && !welcomeActive && location.pathname !== '/gallery' && location.pathname !== '/palace' && location.pathname !== '/undersea' && location.pathname !== '/crown_forest' && location.pathname !== '/tower_forgetting' && <FairyDust />}

      {/* WELCOME INTRO OVERLAY */}
      <AnimatePresence>
        {welcomeActive && (
          <motion.div 
            className="welcome-black-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: '#000000',
              zIndex: 80,
              pointerEvents: 'all',
            }}
          >
            <FairyDust />
          </motion.div>
        )}
      </AnimatePresence>

      {/* JUDE DUARTE GUIDE PANEL */}
      <CharacterGuide
        currentLocation={welcomeActive ? 'landing' : globalLocation}
        isVisible={!isLanding}
        isWelcomeActive={welcomeActive}
        onCloseWelcome={() => setWelcomeActive(false)}
      />

      {/* HELP MODAL */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            className="help-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              className="help-modal gothic-border"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>ELFHAME COMPANION</h3>
              <div className="landing-divider" />
              <p>Explore Holly Black's mystical realm. Navigate using the living parchment map:</p>
              <ul>
                <li><strong>Interactive Map</strong>: Drag/move your cursor to trigger 3D camera parallax.</li>
                <li><strong>Glow Markers</strong>: Pulse with faerie magic. Click a location to zoom camera.</li>
                <li><strong>Jude Duarte</strong>: Your guide who warns you of the dangers of the court.</li>
                <li><strong>Palace of Elfhame</strong>: Transitions into a fully immersive, 3D golden hall.</li>
              </ul>
              <button className="btn-fantasy" onClick={() => setShowHelp(false)}>CLOSE</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
