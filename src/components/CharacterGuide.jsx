import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import audioSynth from '../utils/audio';

const dialogueData = {
  landing: {
    greeting: "Welcome to Elfhame, mortal.",
    text: "You step into a land of dangerous beauty, ancient secrets, and blood-soaked crowns. I am Jude Duarte. If you want to survive the faerie courts, listen closely: never eat their fruit, never dance in their circles, and never, ever make a bargain you cannot afford.",
    quote: '"If I cannot be better than them, I will become so much worse."'
  },
  map: {
    greeting: "The Lands of Elfhame",
    text: "Before you lies the enchanted atlas. Select a location to travel. Each estate holds its own traps and royal alliances. Keep your hand on your hilt.",
    quote: '"Power is much easier to acquire than it is to hold onto."'
  },
  palace: {
    greeting: "The Palace of Elfhame",
    text: "The center of court intrigue, balancing above the churning sea. High King Cardan sits on the throne of thorns, drinking wine and mocking his subjects. It is a nest of vipers, gold, and hidden daggers. Do not let your guard down.",
    quote: '"Most of all, I hate him because I think of him, often. It\'s like a disease."'
  },
  hollow_hall: {
    greeting: "Hollow Hall",
    text: "General Madoc\'s fortress. A place built on bone, cold iron, and military discipline. Madoc raised me to be a warrior, but he also taught me how to betray. Watch the shadows here—they are filled with spies.",
    quote: '"Sharpen your blade. Harden your heart."'
  },
  tower_forgetting: {
    greeting: "The Tower of Forgetting",
    text: "A grim stone pillar rising from the waves. A tomb for the living. Those who cross the crown find themselves locked away, their memories fading under faerie glamour. Once inside, you are as good as dead.",
    quote: '"We have spoken of the dead. Now let us speak of the living."'
  },
  locke_estate: {
    greeting: "Locke\'s Estate",
    text: "A manor of endless revels, sweet poisons, and beautiful lies. Locke thrives on drama and chaos. He turns love into a game and pain into poetry. If you are invited to a feast here, reject it.",
    quote: '"If you hurt me, I will find a way to hurt you back. Twice as hard."'
  },
  lake_masks: {
    greeting: "The Lake of Masks",
    text: "The water here does not reflect your face—it shows your deepest secrets, your unmasked desires, or the face of the one destined to betray you. Gaze into it at your own peril.",
    quote: '"I want to win. I do not yearn to be good."'
  },
  crown_forest: {
    greeting: "The Crown Forest",
    text: "An ancient woodland whispering with wild magic. It belongs to no lord or queen. Sprites and rogue fae hide in the hollows. Step lightly, or the roots themselves will drag you under.",
    quote: '"In faerie, you can die of a transition."'
  },
  undersea: {
    greeting: "The Undersea Kingdom",
    text: "Queen Orlagh\'s vast, cold aquatic domain. The deep waters are beautiful but merciless. The Undersea constantly plots to pull Elfhame\'s crowns into the depths. They can breathe underwater, but mortals only drown.",
    quote: '"The sea is a cruel master, but the fae of the deep are far worse."'
  },
  market: {
    greeting: "The Market District",
    text: "Where mortals, goblins, and noble fae mingle. Here, secrets are traded like spices, and poisons are sold in vials of silver. It is the only place in Elfhame where gold carries more weight than bloodlines.",
    quote: '"Secrets are the most valuable currency in all of Elfhame."'
  }
};

export default function CharacterGuide({ currentLocation, isVisible }) {
  const [dialogue, setDialogue] = useState(dialogueData.landing);
  const [isBlinking, setIsBlinking] = useState(false);
  
  const turbulenceRef = useRef(null);

  // Update dialogue when current location changes
  useEffect(() => {
    const key = currentLocation || 'map';
    if (dialogueData[key]) {
      setDialogue(dialogueData[key]);
      // Play a soft whisper/chime when Jude speaks
      if (currentLocation) {
        audioSynth.playMarkerHover();
      }
    }
  }, [currentLocation]);

  // Simulate blinking eyes
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Animate the SVG turbulence baseFrequency to simulate wind-sway
  useEffect(() => {
    let animationFrameId;
    let time = 0;

    const animateWind = () => {
      time += 0.005;
      if (turbulenceRef.current) {
        // Modulate frequency to make wind gusty
        const xFreq = 0.01 + Math.sin(time) * 0.002;
        const yFreq = 0.03 + Math.cos(time * 0.7) * 0.005;
        turbulenceRef.current.setAttribute('baseFrequency', `${xFreq} ${yFreq}`);
      }
      animationFrameId = requestAnimationFrame(animateWind);
    };

    animateWind();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="character-guide-root">
      {/* SVG Wind Sway Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="jude-wind-filter">
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.01 0.03"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Character Illustration with wind sway and breathing */}
      <div className="jude-wrapper">
        <div className="jude-image-container">
          <img
            src="/characters/jude/judeduarte.jpeg"
            alt="Jude Duarte"
            className="jude-sprite"
          />
          {/* Glowing faerie particles behind her */}
          <div className="jude-backlight" />
        </div>
      </div>

      {/* Dialogue Box Overlay */}
      <div className="dialogue-box gothic-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={dialogue.greeting}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="dialogue-content"
          >
            <h3 className="dialogue-title">{dialogue.greeting}</h3>
            <p className="dialogue-text">{dialogue.text}</p>
            <div className="dialogue-quote">
              <span>{dialogue.quote}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .character-guide-root {
          position: absolute;
          bottom: 24px;
          left: 24px;
          display: flex;
          align-items: flex-end;
          gap: 20px;
          z-index: 20;
          pointer-events: none;
          max-width: 60%;
        }

        .jude-wrapper {
          position: relative;
          width: 140px;
          height: 190px;
          pointer-events: auto;
          flex-shrink: 0;
          display: flex;
          align-items: flex-end;
        }

        .jude-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          border: 2px solid var(--gold-dark);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
          border-radius: 4px;
          overflow: hidden;
          background: #000;
          /* Apply wind filter + breathe animation */
          filter: url(#jude-wind-filter);
          animation: breathe 5s ease-in-out infinite alternate;
          transform-origin: bottom center;
        }

        .jude-sprite {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .jude-backlight {
          position: absolute;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(15, 133, 88, 0.25) 0%, transparent 60%);
          pointer-events: none;
          z-index: -1;
        }

        @keyframes breathe {
          0% {
            transform: scale(1.0) translateY(0);
          }
          100% {
            transform: scale(1.03) translateY(-3px);
          }
        }

        /* Dialogue Box styles */
        .dialogue-box {
          pointer-events: auto;
          background: rgba(11, 15, 20, 0.92);
          padding: 18px 24px;
          border-radius: 4px;
          backdrop-filter: blur(8px);
          max-width: 420px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
          border: 1px solid var(--gold-dark);
        }

        .dialogue-title {
          font-family: var(--font-display);
          font-size: 0.95rem;
          color: var(--gold-primary);
          margin-bottom: 6px;
          border-bottom: 1px dashed rgba(212, 175, 55, 0.3);
          padding-bottom: 4px;
        }

        .dialogue-text {
          font-family: var(--font-body);
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--text-light);
          margin-bottom: 10px;
        }

        .dialogue-quote {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.8rem;
          color: var(--gold-light);
          opacity: 0.85;
          text-align: right;
          position: relative;
        }

        .dialogue-quote::before {
          content: '— ';
        }

        @media (max-width: 768px) {
          .character-guide-root {
            max-width: 90%;
            flex-direction: column;
            align-items: flex-start;
            bottom: 15px;
            left: 15px;
          }
          .jude-wrapper {
            width: 80px;
            height: 110px;
          }
          .dialogue-box {
            max-width: 320px;
            padding: 12px 16px;
          }
          .dialogue-text {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
