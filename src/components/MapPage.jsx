import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import MapScene from './MapScene';
import { placesData } from '../data/places';
import audioSynth from '../utils/audio';

export default function MapPage({ setGlobalLocation }) {
  const navigate = useNavigate();
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [gameState, setGameState] = useState('overview'); // 'overview', 'zoomed_in'

  // Update global guide location so Jude speaks about the current place
  useEffect(() => {
    setGlobalLocation(selectedLoc || 'map');
  }, [selectedLoc, setGlobalLocation]);

  const handleTransitionComplete = () => {
    if (selectedLoc === 'palace') {
      navigate('/palace');
    } else if (selectedLoc === 'undersea') {
      navigate('/undersea');
    } else if (selectedLoc === 'crown_forest') {
      navigate('/crown_forest');
    } else if (selectedLoc === 'tower_forgetting') {
      navigate('/tower_forgetting');
    } else if (selectedLoc) {
      setGameState('zoomed_in');
    }
  };

  const handleBackToOverview = () => {
    audioSynth.playMarkerClick();
    setGameState('overview');
    setSelectedLoc(null);
  };

  const activeLocData = placesData.find(l => l.id === selectedLoc);

  return (
    <div className="full-screen-scene">
      {/* 3D R3F Map Scene */}
      <MapScene
        selectedLocation={selectedLoc}
        onSelectLocation={(id) => setSelectedLoc(id)}
        onTransitionComplete={handleTransitionComplete}
        activeScene="map"
      />

      {/* Return to book overlay button */}
      <button 
        className="btn-fantasy btn-return-book glow-gold" 
        onClick={() => {
          audioSynth.playMarkerClick();
          navigate('/book', { state: { returnFrom: 'map' } });
        }}
      >
        📖 RETURN TO BOOK
      </button>

      {/* Sidebar Details Panel */}
      <AnimatePresence>
        {gameState === 'zoomed_in' && activeLocData && (
          <motion.div
            className="detail-sidebar gothic-border"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <button className="btn-back" onClick={handleBackToOverview}>
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
                {activeLocData.secrets && activeLocData.secrets.map((secret, idx) => (
                  <li key={idx}>{secret}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK SELECT QUICK NAVIGATION (Bottom Center-Right) */}
      {gameState === 'overview' && (
        <div className="quick-nav-bar">
          <span className="quick-nav-title">REALMS OF ELFHAME</span>
          <div className="quick-nav-links">
            {placesData.map(loc => (
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
    </div>
  );
}
