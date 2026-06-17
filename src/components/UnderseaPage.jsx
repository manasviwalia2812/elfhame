import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Milestone, History, Sparkles } from 'lucide-react';
import FairyDust from './FairyDust';
import underseaData from '../data/places/undersea.json';
import audioSynth from '../utils/audio';

export default function UnderseaPage({ setGlobalLocation }) {
  const navigate = useNavigate();

  // Manage custom scene audio and set global location
  useEffect(() => {
    setGlobalLocation('undersea');
    audioSynth.setScene('undersea');
    return () => {
      audioSynth.setScene('default');
    };
  }, [setGlobalLocation]);

  const handleReturn = () => {
    audioSynth.playMarkerClick();
    navigate('/book', { state: { returnFrom: 'undersea' } });
  };

  const handleReturnToMap = () => {
    audioSynth.playMarkerClick();
    navigate('/map');
  };

  return (
    <div className="full-screen-scene" style={{ background: '#020608', overflow: 'hidden' }}>
      {/* HTML5 background video */}
      <video
        src="/environment/undersea_kingdom.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          opacity: 0.95
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

      {/* Sidebar Details Panel - Static div with no transitions to keep it fully visible */}
      <div
        className="detail-sidebar gothic-border"
        style={{
          zIndex: 15,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          borderColor: underseaData.color
        }}
      >
        <button className="btn-back" onClick={handleReturnToMap} style={{ marginBottom: '10px' }}>
          <ArrowLeft size={16} /> Return to Map
        </button>

        <div className="sidebar-divider" />

        <h2 className="location-title" style={{ color: underseaData.color }}>
          {underseaData.name}
        </h2>
        
        <p className="location-quote">
          {underseaData.quote}
        </p>

        <p className="location-desc">
          {underseaData.description}
        </p>

        <div className="sidebar-divider" />

        {/* History section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: underseaData.color, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <History size={14} /> HISTORY & ORIGIN
          </h4>
          <p style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#b0ab9f' }}>
            {underseaData.history}
          </p>
        </div>

        {/* Major Events section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: underseaData.color, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Milestone size={14} /> MAJOR EVENTS
          </h4>
          <ul style={{ listStyleType: 'square', marginLeft: '16px', fontSize: '0.8rem', lineHeight: '1.4', color: '#f5f3ef' }}>
            {underseaData.events.map((event, idx) => (
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
            {underseaData.secrets.map((secret, idx) => (
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
