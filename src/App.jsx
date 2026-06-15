import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, MapPin, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapScene, { locations } from './components/MapScene';
import PalaceScene from './components/PalaceScene';
import CharacterGuide from './components/CharacterGuide';
import audioSynth from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState('landing'); // 'landing', 'map', 'zoomed_in'
  const [selectedLoc, setSelectedLoc] = useState(null); // id of selected location
  const [activeScene, setActiveScene] = useState('map'); // 'map', 'palace'
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [showHelp, setShowHelp] = useState(false);

  // Manage Web Audio initialization and toggles
  const handleToggleAudio = () => {
    if (audioEnabled) {
      audioSynth.stop();
      setAudioEnabled(false);
    } else {
      audioSynth.start();
      audioSynth.setVolume(volume);
      setAudioEnabled(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
  };

  // Start experience from Landing page
  const handleStart = () => {
    setGameState('map');
    // Start audio on user gesture
    audioSynth.start();
    audioSynth.setVolume(volume);
    setAudioEnabled(true);
  };

  // Transition handler when camera zoom is complete
  const handleTransitionComplete = () => {
    if (selectedLoc === 'palace') {
      // Switch active 3D scene from the map to the palace
      setActiveScene('palace');
      setGameState('zoomed_in');
    } else if (selectedLoc) {
      // For other locations, we stay on map but zoom-in and show details overlay
      setGameState('zoomed_in');
    }
  };

  // Handle returning to the main world map
  const handleBackToMap = () => {
    audioSynth.playMarkerClick();
    setGameState('map');
    setSelectedLoc(null);
    setActiveScene('map');
  };

  // Safe fallback if user wants to return during a zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && gameState === 'zoomed_in') {
        handleBackToMap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const activeLocData = locations.find(l => l.id === selectedLoc);

  return (
    <div className="elfhame-app">
      {/* Mystical Background Mist */}
      <div className="mist-layer" />
      <div className="vignette" />
      <div className="overlay-particles" />

      {/* AUDIO CONTROL BAR (Top Right) */}
      {gameState !== 'landing' && (
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
      {gameState !== 'landing' && (
        <header className="app-header">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="header-title"
            onClick={handleBackToMap}
          >
            ELFHAME
          </motion.h2>
          <p className="header-subtitle">THE LIVING ATLAS</p>
        </header>
      )}

      {/* LANDING EXPERIENCE */}
      <AnimatePresence>
        {gameState === 'landing' && (
          <motion.div 
            className="landing-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <div className="landing-content gothic-border">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
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
            </div>
            
            <div className="landing-footer">
              Inspired by Holly Black's <i>The Cruel Prince</i> Trilogy.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* 3D CANVAS WORLD MAP SCENE */}
      <MapScene
        selectedLocation={selectedLoc}
        onSelectLocation={(id) => setSelectedLoc(id)}
        onTransitionComplete={handleTransitionComplete}
        activeScene={activeScene}
      />

      {/* 3D PALACE OF ELFHAME SCENE */}
      {activeScene === 'palace' && (
        <PalaceScene activeScene={activeScene} />
      )}

      {/* JUDE DUARTE GUIDE PANEL */}
      <CharacterGuide
        currentLocation={selectedLoc || 'map'}
        isVisible={gameState !== 'landing'}
      />

      {/* LOCATION DETAIL SIDE PANEL OVERLAY */}
      <AnimatePresence>
        {gameState === 'zoomed_in' && activeLocData && (
          <motion.div
            className="detail-sidebar gothic-border"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <button className="btn-back" onClick={handleBackToMap}>
              <ArrowLeft size={16} /> Return to Map
            </button>

            <div className="sidebar-divider" />

            <h2 className="location-title" style={{ color: activeLocData.color }}>
              {activeLocData.name}
            </h2>
            
            <p className="location-quote">
              {activeLocData.quote}
            </p>

            <p className="location-desc">
              {activeLocData.description}
            </p>

            <div className="sidebar-decor">
              <MapPin size={24} style={{ color: activeLocData.color }} />
            </div>

            <div className="location-secrets gothic-border">
              <h4>COURT SECRETS</h4>
              <ul>
                {selectedLoc === 'palace' && (
                  <>
                    <li>Cardan\'s crown is made of hollow gold and silver oak leaves.</li>
                    <li>Valerian is plotting with the exiled royalty to overthrow the throne.</li>
                    <li>The Court of Shadows has placed spies behind the throne draperies.</li>
                  </>
                )}
                {selectedLoc === 'hollow_hall' && (
                  <>
                    <li>Madoc keeps a vial of poisonous Blisterlamp sap in his desk.</li>
                    <li>Taryn has secretly met with Locke in the east pavilion.</li>
                  </>
                )}
                {selectedLoc === 'tower_forgetting' && (
                  <>
                    <li>A secret key is hidden under the loose slate of the third pier.</li>
                    <li>Glamour rings are used to keep guards awake.</li>
                  </>
                )}
                {selectedLoc === 'locke_estate' && (
                  <>
                    <li>Locke\'s mother left a magical lute that charms listeners.</li>
                    <li>The wine served in the garden ruins is spiced with faerie fruit.</li>
                  </>
                )}
                {selectedLoc === 'lake_masks' && (
                  <>
                    <li>The lake water is fed by a spring that drains memories.</li>
                    <li>The reflection of Jude Duarte shows her holding the High King\'s crown.</li>
                  </>
                )}
                {selectedLoc === 'crown_forest' && (
                  <>
                    <li>The Roach keeps a hideout in the hollow of the Ironwood tree.</li>
                    <li>Ragwort horses roam the glade at midnight.</li>
                  </>
                )}
                {selectedLoc === 'undersea' && (
                  <>
                    <li>Queen Orlagh is vulnerable to cold-iron spears.</li>
                    <li>Nicasia\'s sapphire necklace contains captured sea storm wind.</li>
                  </>
                )}
                {selectedLoc === 'market' && (
                  <>
                    <li>The goblin merchant trades rowan wood berries for mortal teeth.</li>
                    <li>The Roach\'s scouts purchase nightshade concentrate here.</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK SELECT QUICK NAVIGATION (Bottom Center-Right) */}
      {gameState === 'map' && (
        <div className="quick-nav-bar">
          <span className="quick-nav-title">REALMS OF ELFHAME</span>
          <div className="quick-nav-links">
            {locations.map(loc => (
              <button 
                key={loc.id} 
                className="btn-quick-nav glow-gold"
                onClick={() => {
                  audioSynth.playMarkerClick();
                  setSelectedLoc(loc.id);
                }}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Stylesheet for application layout */}
      <style>{`
        .elfhame-app {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #050709;
        }

        /* LANDING OVERLAY styling */
        .landing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, #0c1218 0%, #030406 100%);
          z-index: 99;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .landing-content {
          background: rgba(11, 15, 20, 0.88);
          border: 1px solid var(--gold-dark);
          padding: 45px 60px;
          max-width: 700px;
          text-align: center;
          backdrop-filter: blur(12px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.8);
        }

        .landing-title {
          font-size: 3.5rem;
          color: var(--gold-light);
          letter-spacing: 0.15em;
          text-shadow: 0 0 15px var(--gold-glow);
          margin-bottom: 10px;
        }

        .landing-divider {
          width: 80px;
          height: 1px;
          background: var(--gold-primary);
          margin: 15px auto;
          position: relative;
        }

        .landing-divider::before {
          content: '👑';
          position: absolute;
          top: -8px;
          left: calc(50% - 10px);
          font-size: 10px;
          background: #0b0f14;
          padding: 0 4px;
        }

        .landing-tagline {
          font-style: italic;
          color: var(--gold-primary);
          margin-bottom: 25px;
          font-size: 1.1rem;
        }

        .landing-intro {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin-bottom: 30px;
        }

        .btn-enter {
          padding: 12px 36px;
          font-size: 1rem;
        }

        .landing-footer {
          position: absolute;
          bottom: 24px;
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--gold-dark);
          letter-spacing: 0.05em;
        }

        /* HEADER styling */
        .app-header {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          text-align: center;
          pointer-events: auto;
        }

        .header-title {
          font-size: 1.8rem;
          letter-spacing: 0.25em;
          color: var(--gold-light);
          text-shadow: 0 0 10px var(--gold-glow);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .header-title:hover {
          color: #fff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        }

        .header-subtitle {
          font-family: var(--font-display);
          font-size: 0.6rem;
          letter-spacing: 0.4em;
          color: var(--gold-primary);
          margin-top: 4px;
        }

        /* AUDIO CONTROLS styling */
        .audio-controls-container {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 25;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-audio-toggle {
          background: rgba(11, 15, 20, 0.7);
          border: 1px solid var(--gold-dark);
          color: var(--gold-light);
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .btn-audio-toggle:hover {
          background: var(--gold-primary);
          color: var(--text-dark);
        }

        .volume-slider {
          width: 80px;
          height: 3px;
          background: var(--gold-dark);
          outline: none;
          -webkit-appearance: none;
          border-radius: 2px;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--gold-primary);
          box-shadow: 0 0 8px var(--gold-glow);
        }

        /* HELP MODAL styling */
        .help-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.85);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .help-modal {
          background: #0b0f14;
          padding: 30px;
          max-width: 480px;
          width: 100%;
          border-radius: 4px;
          border: 1px solid var(--gold-primary);
          box-shadow: 0 10px 40px rgba(0,0,0,0.7);
        }

        .help-modal h3 {
          color: var(--gold-light);
          margin-bottom: 8px;
        }

        .help-modal p {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .help-modal ul {
          margin-left: 20px;
          color: var(--text-light);
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .help-modal ul li {
          margin-bottom: 6px;
        }

        /* SIDEBAR styling */
        .detail-sidebar {
          position: absolute;
          top: 24px;
          right: 24px;
          bottom: 24px;
          width: 380px;
          background: rgba(7, 10, 14, 0.95);
          border: 1px solid var(--gold-dark);
          border-radius: 4px;
          padding: 24px;
          z-index: 15;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          box-shadow: -10px 0 30px rgba(0,0,0,0.6);
        }

        .btn-back {
          background: transparent;
          border: none;
          color: var(--gold-primary);
          font-family: var(--font-display);
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          align-self: flex-start;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .btn-back:hover {
          color: var(--gold-light);
          transform: translateX(-4px);
        }

        .sidebar-divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold-dark) 0%, transparent 100%);
          margin: 16px 0;
        }

        .location-title {
          font-size: 1.8rem;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          text-shadow: 0 0 10px rgba(0,0,0,0.5);
        }

        .location-quote {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.95rem;
          color: var(--gold-light);
          opacity: 0.9;
          margin-bottom: 16px;
          line-height: 1.4;
          padding-left: 10px;
          border-left: 2px solid var(--gold-primary);
        }

        .location-desc {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .sidebar-decor {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          opacity: 0.6;
        }

        .location-secrets {
          flex-grow: 1;
          background: rgba(11, 15, 20, 0.5);
          border-radius: 4px;
          padding: 14px 18px;
          overflow-y: auto;
        }

        .location-secrets h4 {
          font-size: 0.75rem;
          color: var(--gold-primary);
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .location-secrets ul {
          list-style-type: circle;
          margin-left: 16px;
        }

        .location-secrets li {
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--text-light);
          margin-bottom: 6px;
        }

        /* QUICK NAV BAR styling */
        .quick-nav-bar {
          position: absolute;
          bottom: 24px;
          right: 24px;
          z-index: 10;
          text-align: right;
        }

        .quick-nav-title {
          font-family: var(--font-display);
          font-size: 0.65rem;
          color: var(--gold-primary);
          letter-spacing: 0.2em;
          display: block;
          margin-bottom: 8px;
        }

        .quick-nav-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          max-width: 600px;
        }

        .btn-quick-nav {
          background: rgba(11, 15, 20, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 0.65rem;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .btn-quick-nav:hover {
          color: var(--gold-light);
          border-color: var(--gold-primary);
          background: rgba(11, 15, 20, 0.95);
        }

        @media (max-width: 900px) {
          .detail-sidebar {
            width: calc(100% - 48px);
            top: auto;
            bottom: 24px;
            height: 40%;
          }
          .quick-nav-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
