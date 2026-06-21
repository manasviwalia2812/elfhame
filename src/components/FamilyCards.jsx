import React, { useState } from 'react';
import familiesData from '../data/families.json';
import familyTreesData from '../data/family_trees.json';
import FairyDust from './FairyDust';
import FamilyTree from './FamilyTree';
import audioSynth from '../utils/audio';
import './FamilyCards.css';

function FamilyEmblem({ id, color }) {
  if (id === 'greenbriar') {
    return (
      <svg className="family-card-emblem" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Crown of Thorns & Oak Leaves */}
        <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Leaves backgrounds */}
          <path d="M60 140 C50 110, 30 120, 40 100 C55 105, 65 95, 70 110" fill="none" opacity="0.6" />
          <path d="M140 140 C150 110, 170 120, 160 100 C145 105, 135 95, 130 110" fill="none" opacity="0.6" />
          {/* Main Thorns ring */}
          <path d="M45 140 Q100 160 155 140" fill="none" strokeWidth="3" />
          <path d="M40 142 L50 132" />
          <path d="M65 148 L60 158" />
          <path d="M100 152 L100 164" />
          <path d="M135 148 L140 158" />
          <path d="M160 142 L150 132" />
          {/* Crown */}
          <path d="M50 135 L60 70 L90 105 L100 60 L110 105 L140 70 L150 135 Z" fill={`${color}22`} strokeWidth="3.5" />
          {/* Gems */}
          <circle cx="60" cy="65" r="4" fill={color} />
          <circle cx="100" cy="55" r="5" fill={color} />
          <circle cx="140" cy="65" r="4" fill={color} />
          <circle cx="100" cy="100" r="3" fill={color} />
          <circle cx="75" cy="120" r="3.5" fill={color} />
          <circle cx="125" cy="120" r="3.5" fill={color} />
          {/* Filigree */}
          <path d="M80 135 Q100 115 120 135" fill="none" />
        </g>
      </svg>
    );
  }
  if (id === 'duarte_madoc') {
    return (
      <svg className="family-card-emblem" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Crossed Swords & Shield */}
        <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Sword 1 */}
          <path d="M45 45 L155 155" strokeWidth="3" />
          <path d="M142 148 L152 138" strokeWidth="3.5" /> {/* Guard */}
          <path d="M148 148 L158 158" strokeWidth="4" /> {/* Hilt */}
          {/* Sword 2 */}
          <path d="M155 45 L45 155" strokeWidth="3" />
          <path d="M58 148 L48 138" strokeWidth="3.5" />
          <path d="M52 148 L42 158" strokeWidth="4" />
          {/* Shield outline */}
          <path d="M70 60 C70 60, 100 50, 130 60 C130 110, 120 145, 100 160 C80 145, 70 110, 70 60 Z" fill="#000000d0" strokeWidth="3" />
          {/* Crest on Shield */}
          <path d="M100 80 Q85 95 100 115 Q115 95 100 80 Z" fill={`${color}44`} />
          <path d="M85 95 Q100 95 100 120" />
          <path d="M115 95 Q100 95 100 120" />
          {/* Crest details */}
          <line x1="100" y1="60" x2="100" y2="150" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>
      </svg>
    );
  }
  if (id === 'undersea') {
    return (
      <svg className="family-card-emblem" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Royal Trident & Waves */}
        <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Swirling Waves background */}
          <path d="M30 150 C50 130, 70 160, 100 140 C130 120, 150 160, 170 145" strokeWidth="2" opacity="0.5" />
          <path d="M40 165 C60 150, 80 175, 100 155 C120 135, 140 175, 160 160" strokeWidth="1.5" opacity="0.3" />
          {/* Trident */}
          <path d="M100 160 L100 50" strokeWidth="3.5" /> {/* Shaft */}
          <path d="M70 70 C75 110, 125 110, 130 70" strokeWidth="3" fill="none" /> {/* Fork outer ring */}
          <path d="M70 70 L70 55 M130 70 L130 55 M100 50 L100 35" strokeWidth="3.5" /> {/* Prongs */}
          {/* Trident Tips */}
          <path d="M67 55 L70 48 L73 55 Z" fill={color} />
          <path d="M97 35 L100 28 L103 35 Z" fill={color} />
          <path d="M127 55 L130 48 L133 55 Z" fill={color} />
          {/* Undersea pearls */}
          <circle cx="60" cy="110" r="3.5" fill={color} />
          <circle cx="140" cy="100" r="2.5" fill={color} opacity="0.8" />
          <circle cx="85" cy="135" r="4.5" fill={color} />
          <circle cx="115" cy="125" r="2" fill={color} opacity="0.9" />
        </g>
      </svg>
    );
  }
  if (id === 'termites') {
    return (
      <svg className="family-card-emblem" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow Pixie Wings & Pin */}
        <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left wing */}
          <path d="M95 100 C70 50, 30 60, 35 90 C38 110, 65 115, 95 100 Z" fill={`${color}15`} strokeWidth="3" />
          <path d="M95 100 C70 120, 45 130, 48 140 C52 148, 70 140, 95 100 Z" fill={`${color}10`} strokeWidth="2" />
          {/* Right wing */}
          <path d="M105 100 C130 50, 170 60, 165 90 C162 110, 135 115, 105 100 Z" fill={`${color}15`} strokeWidth="3" />
          <path d="M105 100 C130 120, 155 130, 152 140 C148 148, 130 140, 105 100 Z" fill={`${color}10`} strokeWidth="2" />
          {/* Wing filigree */}
          <path d="M50 78 Q70 85 95 100" opacity="0.6" strokeWidth="1.5" />
          <path d="M150 78 Q130 85 105 100" opacity="0.6" strokeWidth="1.5" />
          <path d="M60 128 Q75 120 95 100" opacity="0.5" strokeWidth="1.5" />
          <path d="M140 128 Q125 120 105 100" opacity="0.5" strokeWidth="1.5" />
          {/* Center Piercing Needle */}
          <path d="M100 40 L100 160" strokeWidth="3" />
          <circle cx="100" cy="35" r="6" fill={color} />
          {/* Magic Spores */}
          <path d="M80 50 L83 55 M120 50 L117 55 M75 160 L78 155 M125 160 L122 155" strokeWidth="2" opacity="0.8" />
        </g>
      </svg>
    );
  }
  if (id === 'teeth') {
    return (
      <svg className="family-card-emblem" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Feral Teeth & Thorns */}
        <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Northern Ivy wreath */}
          <path d="M100 30 C50 30, 30 70, 30 100 C30 140, 60 170, 100 170 C140 170, 170 140, 170 100 C170 70, 150 30, 100 30 Z" strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />
          {/* Fangs */}
          <path d="M65 70 L70 85 L75 70" fill={color} strokeWidth="2" />
          <path d="M82 65 L88 88 L94 65" fill={color} strokeWidth="2" />
          <path d="M106 65 L112 88 L118 65" fill={color} strokeWidth="2" />
          <path d="M125 70 L130 85 L135 70" fill={color} strokeWidth="2" />
          <path d="M68 130 L73 115 L78 130" fill={color} strokeWidth="2" />
          <path d="M85 135 L90 110 L95 135" fill={color} strokeWidth="2" />
          <path d="M105 135 L110 110 L115 135" fill={color} strokeWidth="2" />
          <path d="M122 130 L127 115 L132 130" fill={color} strokeWidth="2" />
          {/* Center rose */}
          <circle cx="100" cy="100" r="14" fill={`${color}22`} strokeWidth="3" />
          <path d="M93 100 Q100 93 107 100 Q100 107 93 100 Z" />
          <circle cx="100" cy="100" r="3" fill={color} />
          {/* Ivy leaves */}
          <path d="M35 100 Q20 85 30 70 Q45 80 35 100 Z" fill={`${color}44`} />
          <path d="M165 100 Q180 85 170 70 Q155 80 165 100 Z" fill={`${color}44`} />
        </g>
      </svg>
    );
  }
  return null;
}

export default function FamilyCards({ onClose }) {
  const [current, setCurrent] = useState(0);
  const [showTree, setShowTree] = useState(false);

  // Initial display state matching the double buffering logic
  const [displayState, setDisplayState] = useState({
    activeKey: 'A', // 'A' or 'B'
    artA: familiesData[0],
    artB: null,
    artAClass: '',
    artBClass: '',
    copyA: familiesData[0],
    copyB: null,
    copyAClass: '',
    copyBClass: '',
    glow: familiesData[0].glow,
    animating: false
  });

  const goTo = (index) => {
    if (displayState.animating || index === current) return;
    
    // Play transition sound
    audioSynth.playMarkerClick();

    const nextVariant = familiesData[index];
    const nextKey = displayState.activeKey === 'A' ? 'B' : 'A';

    setDisplayState((prev) => {
      const base = {
        ...prev,
        animating: true,
        glow: nextVariant.glow,
      };
      if (nextKey === 'B') {
        return {
          ...base,
          artB: nextVariant,
          artBClass: 'entering-start',
          copyB: nextVariant,
          copyBClass: 'entering-start',
        };
      } else {
        return {
          ...base,
          artA: nextVariant,
          artAClass: 'entering-start',
          copyA: nextVariant,
          copyAClass: 'entering-start',
        };
      }
    });

    // Trigger animations in consecutive frames
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDisplayState((prev) => {
          if (nextKey === 'B') {
            return {
              ...prev,
              artAClass: 'leaving',
              artBClass: 'entering',
              copyAClass: 'leaving',
              copyBClass: 'entering',
            };
          } else {
            return {
              ...prev,
              artBClass: 'leaving',
              artAClass: 'entering',
              copyBClass: 'leaving',
              copyAClass: 'entering',
            };
          }
        });
      });
    });

    // Finalize transition swaps
    setTimeout(() => {
      setDisplayState((prev) => {
        return {
          ...prev,
          activeKey: nextKey,
          artAClass: '',
          artBClass: '',
          copyAClass: '',
          copyBClass: '',
          animating: false,
        };
      });
      setCurrent(index);
    }, 1050);
  };

  const activeFamily = familiesData[current];

  // If hierarchy tree view is active
  if (showTree) {
    const activeTreeKey = activeFamily.id;
    const activeTreeData = familyTreesData[activeTreeKey];
    return (
      <div className="family-cards-modal-wrapper">
        {/* Background Fairy Dust Effect */}
        <FairyDust />

        {/* Modal Close Button */}
        <button 
          className="family-cards-modal-close"
          onClick={() => {
            audioSynth.playMarkerClick();
            onClose();
          }}
          onMouseEnter={() => audioSynth.playMarkerHover()}
        >
          ✕ CLOSE CARDS
        </button>

        <FamilyTree 
          treeData={activeTreeData} 
          onBack={() => setShowTree(false)} 
        />
      </div>
    );
  }

  return (
    <div className="family-cards-modal-wrapper">
      {/* Background Fairy Dust Effect */}
      <FairyDust />

      {/* Modal Close Button */}
      <button 
        className="family-cards-modal-close"
        onClick={() => {
          audioSynth.playMarkerClick();
          onClose();
        }}
        onMouseEnter={() => audioSynth.playMarkerHover()}
      >
        ✕ CLOSE CARDS
      </button>

      {/* Main Flat Family Card Container */}
      <div className="family-card-container">
        <div className="family-card">
          {/* Royal Seal Watermark */}
          <svg className="family-card-seal" viewBox="0 0 100 100">
            <path d="M50 4 L92 50 L50 96 L8 50 Z" fill="none" stroke="#e8b34a" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="#e8b34a" strokeWidth="1.5" />
          </svg>

          <p className="family-card-eyebrow">POLITICAL HOUSEHOLDS</p>

          {/* Semicircular Wipe Artwork Layer */}
          <div className="family-card-stage">
            <div className="family-card-stage-glow" style={{ background: displayState.glow }} />
            
            {displayState.artA && (
              <div 
                className={`family-card-art-layer ${displayState.artAClass}`}
                style={{ 
                  opacity: displayState.activeKey === 'A' ? 1 : 0,
                  zIndex: displayState.activeKey === 'A' ? 1 : 0
                }}
              >
                <FamilyEmblem id={displayState.artA.id} color={displayState.artA.color} />
              </div>
            )}

            {displayState.artB && (
              <div 
                className={`family-card-art-layer ${displayState.artBClass}`}
                style={{ 
                  opacity: displayState.activeKey === 'B' ? 1 : 0,
                  zIndex: displayState.activeKey === 'B' ? 1 : 0
                }}
              >
                <FamilyEmblem id={displayState.artB.id} color={displayState.artB.color} />
              </div>
            )}
          </div>

          {/* Left-to-Right Copy Layer */}
          <div className="family-card-copy">
            {displayState.copyA && (
              <div 
                className={`family-card-copy-layer ${displayState.copyAClass}`}
                style={{ opacity: displayState.activeKey === 'A' ? 1 : 0 }}
              >
                <h2 
                  className="family-card-title"
                  style={{ textShadow: `0 0 10px ${displayState.copyA.color}aa, 0 0 20px ${displayState.copyA.color}46` }}
                >
                  {displayState.copyA.title}
                </h2>
                <p className="family-card-role">{displayState.copyA.role}</p>
                <p className="family-card-desc">{displayState.copyA.desc}</p>
              </div>
            )}

            {displayState.copyB && (
              <div 
                className={`family-card-copy-layer ${displayState.copyBClass}`}
                style={{ opacity: displayState.activeKey === 'B' ? 1 : 0 }}
              >
                <h2 
                  className="family-card-title"
                  style={{ textShadow: `0 0 10px ${displayState.copyB.color}aa, 0 0 20px ${displayState.copyB.color}46` }}
                >
                  {displayState.copyB.title}
                </h2>
                <p className="family-card-role">{displayState.copyB.role}</p>
                <p className="family-card-desc">{displayState.copyB.desc}</p>
              </div>
            )}
          </div>

          {/* Color Swatch Selection */}
          <div className="family-card-swatches">
            {familiesData.map((v, i) => (
              <div
                key={v.id}
                className={`family-card-swatch ${i === current ? 'active' : ''}`}
                style={{ background: v.color }}
                onClick={() => goTo(i)}
                onMouseEnter={() => audioSynth.playMarkerHover()}
              />
            ))}
          </div>

          {/* View Hierarchy Button */}
          <button 
            className="family-card-cta"
            onClick={() => {
              audioSynth.playMarkerClick();
              setShowTree(true);
            }}
            onMouseEnter={() => audioSynth.playMarkerHover()}
          >
            View Hierarchy
          </button>
        </div>
      </div>
    </div>
  );
}
