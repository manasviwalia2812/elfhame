import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import charactersData from '../data/characters.json';
import audioSynth from '../utils/audio';
import FairyDust from './FairyDust';

// Map of tags for each character to match the visual styling
const characterTags = {
  jude: ["Mortal", "Seneschal", "Queen"],
  cardan: ["High Fae", "King", "Prince"],
  madoc: ["Redcap", "General", "Warrior"],
  taryn: ["Mortal", "Lady", "Twin"],
  locke: ["Gentry", "Revels", "Trickster"],
  roach: ["Goblin", "Spymaster", "Shadow"],
  bomb: ["Sprite", "Liliver", "Shadow"],
  ghost: ["Half-Fae", "Garrett", "Shadow"],
  nicassia: ["Undersea", "Princess", "Gentry"],
  oak: ["High Fae", "Prince", "Heir"],
  dain: ["High Fae", "Prince", "Falcon"],
  balekin: ["High Fae", "Prince", "Grackle"],
  eldred: ["High Fae", "King", "Royal"],
  grimson: ["Artisan", "Blacksmith", "Exile"],
  vivienne: ["Half-Fae", "Lady", "Protector"],
  valerian: ["High Fae", "Noble", "Cruel"],
  heather: ["Mortal", "Companion", "Artist"],
  oriana: ["High Fae", "Lady", "Pragmatic"]
};

export default function FolkGallery({ setGlobalLocation }) {
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState('jude');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Set the global location state for Jude Duarte's guiding voice lines
  useEffect(() => {
    if (setGlobalLocation) {
      setGlobalLocation('gallery');
    }
  }, [setGlobalLocation]);

  // Find the list of 5 active items centered around currentId
  const getActiveItems = () => {
    const idx = charactersData.findIndex(item => item.id === currentId);
    if (idx === -1) return [];
    
    const getCircular = (offset) => {
      const n = charactersData.length;
      return charactersData[(idx + offset + n) % n];
    };

    return [
      getCircular(-2),
      getCircular(-1),
      charactersData[idx],
      getCircular(1),
      getCircular(2)
    ];
  };

  const activeItems = getActiveItems();

  const handleMove = (goRight) => {
    audioSynth.playMarkerClick();
    const idx = charactersData.findIndex(item => item.id === currentId);
    const n = charactersData.length;
    const nextIdx = goRight ? (idx + 1) % n : (idx - 1 + n) % n;
    setCurrentId(charactersData[nextIdx].id);
  };

  const next = () => handleMove(true);
  const prev = () => handleMove(false);

  // Handle hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If modal is open, only check Escape to close it
      if (selectedCharacter) {
        if (e.code === 'Escape') {
          e.preventDefault();
          audioSynth.playMarkerClick();
          setSelectedCharacter(null);
        }
        return;
      }

      if (e.code === 'ArrowRight' || e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        next();
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
        e.preventDefault();
        prev();
      } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        const activeChar = charactersData.find(item => item.id === currentId);
        if (activeChar) {
          audioSynth.playMarkerClick();
          setSelectedCharacter(activeChar);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentId, selectedCharacter]);

  const handleCardClick = (item, index) => {
    if (index === 2) {
      // Centered card: Open full details modal
      audioSynth.playMarkerClick();
      setSelectedCharacter(item);
    } else {
      // Adjacent card: shift to make it centered
      // If index is 0 or 1, move left. If 3 or 4, move right.
      audioSynth.playMarkerClick();
      setCurrentId(item.id);
    }
  };

  return (
    <div className="gallery-root">
      {/* Fairy Dust behind the carousel wrapper */}
      <FairyDust />

      {/* Return to Map/Book buttons */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 30, display: 'flex', gap: '12px' }}>
        <button 
          className="btn-fantasy glow-gold" 
          onClick={() => {
            audioSynth.playMarkerClick();
            navigate('/book', { state: { returnFrom: 'gallery' } });
          }}
          onMouseEnter={() => audioSynth.playMarkerHover()}
          style={{ fontSize: '0.8rem', padding: '8px 16px' }}
        >
          📖 RETURN TO BOOK
        </button>
      </div>

      <div className="gallery-wrapper">
        {/* Navigation Arrow Prev */}
        <button 
          className="gallery-nav-btn prev" 
          onClick={prev}
          onMouseEnter={() => audioSynth.playMarkerHover()}
        >
          ‹
        </button>

        {/* Carousel elements */}
        <section className="gallery-carousel">
          {activeItems.map((item, index) => {
            const isMiddle = index === 2;
            const tags = characterTags[item.id] || (item.titles && item.titles.length > 0 ? item.titles : ["Folk"]);

            return (
              <article 
                key={item.id}
                className="gallery-article"
                onClick={() => handleCardClick(item, index)}
              >
                <div className="character-card">
                  <div className="character-card-image-wrapper">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="character-card-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="character-card-info">
                    <h3 className="character-card-name">{item.name}</h3>
                    <p className="character-card-summary">{item.summary}</p>
                    <div className="character-card-tags">
                      {tags.map(tag => (
                        <span key={tag} className="character-card-tag">{tag}</span>
                      ))}
                    </div>
                    {isMiddle && (
                      <button 
                        className="character-card-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioSynth.playMarkerClick();
                          setSelectedCharacter(item);
                        }}
                        onMouseEnter={() => audioSynth.playMarkerHover()}
                      >
                        SHOW FULL CARD →
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Navigation Arrow Next */}
        <button 
          className="gallery-nav-btn next" 
          onClick={next}
          onMouseEnter={() => audioSynth.playMarkerHover()}
        >
          ›
        </button>
      </div>

      {/* CHARACTER DETAILS MODAL OVERLAY */}
      {selectedCharacter && (
        <div 
          className="gallery-modal-overlay"
          onClick={() => {
            audioSynth.playMarkerClick();
            setSelectedCharacter(null);
          }}
        >
          <div 
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="gallery-modal-close-btn"
              onClick={() => {
                audioSynth.playMarkerClick();
                setSelectedCharacter(null);
              }}
            >
              <X size={20} />
            </button>

            <div className="gallery-modal-layout">
              <div className="gallery-modal-left">
                <img 
                  src={selectedCharacter.image} 
                  alt={selectedCharacter.name} 
                  className="gallery-modal-portrait"
                />
                <div className="gallery-modal-details">
                  <div className="gallery-modal-detail-item">
                    <span className="gallery-modal-detail-label">AGE:</span> {selectedCharacter.age}
                  </div>
                  <div className="gallery-modal-detail-item">
                    <span className="gallery-modal-detail-label">SPECIES:</span> {selectedCharacter.species}
                  </div>
                  <div className="gallery-modal-detail-item">
                    <span className="gallery-modal-detail-label">RESIDENCE:</span> {selectedCharacter.residence}
                  </div>
                </div>
              </div>

              <div className="gallery-modal-right">
                <h2 className="gallery-modal-name">{selectedCharacter.name}</h2>
                <div className="gallery-modal-titles">
                  {selectedCharacter.titles.join(' • ')}
                </div>
                <div className="gallery-modal-divider"></div>
                <p className="gallery-modal-background-text">
                  {selectedCharacter.background}
                </p>
                <p className="gallery-modal-summary-text">
                  "{selectedCharacter.summary}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
