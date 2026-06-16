import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import MapScene, { locations } from './MapScene';
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
    } else if (selectedLoc) {
      setGameState('zoomed_in');
    }
  };

  const handleBackToOverview = () => {
    audioSynth.playMarkerClick();
    setGameState('overview');
    setSelectedLoc(null);
  };

  const activeLocData = locations.find(l => l.id === selectedLoc);

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
                    <li>Locke's mother left a magical lute that charms listeners.</li>
                    <li>The wine served in the garden ruins is spiced with faerie fruit.</li>
                  </>
                )}
                {selectedLoc === 'lake_masks' && (
                  <>
                    <li>The lake water is fed by a spring that drains memories.</li>
                    <li>The reflection of Jude Duarte shows her holding the High King's crown.</li>
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
                    <li>Nicasia's sapphire necklace contains captured sea storm wind.</li>
                  </>
                )}
                {selectedLoc === 'market' && (
                  <>
                    <li>The goblin merchant trades rowan wood berries for mortal teeth.</li>
                    <li>The Roach's scouts purchase nightshade concentrate here.</li>
                  </>
                )}
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
    </div>
  );
}
