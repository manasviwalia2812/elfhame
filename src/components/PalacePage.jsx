import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import PalaceScene from './PalaceScene';
import audioSynth from '../utils/audio';

export default function PalacePage({ setGlobalLocation }) {
  const navigate = useNavigate();

  // Update global guide location so Jude speaks about the Palace
  useEffect(() => {
    setGlobalLocation('palace');
  }, [setGlobalLocation]);

  const handleReturn = () => {
    audioSynth.playMarkerClick();
    navigate('/book', { state: { returnFrom: 'palace' } });
  };

  return (
    <div className="full-screen-scene">
      {/* 3D R3F Palace Scene */}
      <PalaceScene activeScene="palace" />

      {/* Return to book overlay button */}
      <button 
        className="btn-fantasy btn-return-book glow-gold" 
        onClick={handleReturn}
      >
        📖 RETURN TO BOOK
      </button>

      {/* Sidebar Details Panel (always visible in Palace Page) */}
      <motion.div
        className="detail-sidebar gothic-border"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        <button className="btn-back" onClick={handleReturn}>
          <ArrowLeft size={16} /> Return to Chapters
        </button>

        <div className="sidebar-divider" />

        <h2 className="location-title" style={{ color: '#d4af37' }}>
          Palace of Elfhame
        </h2>
        
        <p className="location-quote">
          "Most of all, I hate him because I think of him, often. It's like a disease."
        </p>

        <p className="location-desc">
          The royal seat of the High King, balancing on trees and stone columns above the sea. Beautiful, intimidating, and filled with dark court intrigue.
        </p>

        <div className="sidebar-decor">
          <MapPin size={24} style={{ color: '#d4af37' }} />
        </div>

        <div className="location-secrets gothic-border">
          <h4>COURT SECRETS</h4>
          <ul>
            <li>Cardan's crown is made of hollow gold and silver oak leaves.</li>
            <li>Valerian is plotting with the exiled royalty to overthrow the throne.</li>
            <li>The Court of Shadows has placed spies behind the throne draperies.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
