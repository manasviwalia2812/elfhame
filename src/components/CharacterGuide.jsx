import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import audioSynth from '../utils/audio';

const dialogueData = {
  landing: {
    greeting: "Welcome to Elfhame, mortal.",
    text: "You step into a land of dangerous beauty, ancient secrets, and blood-soaked crowns. I am Jude Duarte. If you want to survive the faerie courts, listen closely: never eat their fruit, never dance in their circles, and never, ever make a bargain you cannot afford.",
    quote: '"If I cannot be better than them, I will become so much worse."'
  },
  book: {
    greeting: "The Chronicles of Elfhame",
    text: "You hold the enchanted living atlas. Turn these pages to unlock the secrets of the Courts, the Folk, and the ancient Magic. When you are ready, step directly into the map to explore.",
    quote: '"I want to win. I do not yearn to be good."'
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
  },
  gallery: {
    greeting: "The Folk of Elfhame",
    text: "Here lie the portraits of those who command and crawl in the High Court. Nobles, outcasts, and mortals alike. In the gallery, cards reveal their loyalties, their heritage, and their betrayals. Study them, for knowledge is the only shield against their glamour.",
    quote: '"If I cannot be better than them, I will become so much worse."'
  }
};

const welcomeDialogues = [
  {
    greeting: "Welcome to Elfhame, mortal.",
    text: "You step into a land of dangerous beauty, ancient secrets, and blood-soaked crowns. I am Jude Duarte, your guide. This experience is recommended to be seen on laptops or big screens.",
    quote: '"If I cannot be better than them, I will become so much worse."'
  },
  {
    greeting: "The Threat of a Name",
    text: "In folklore, fey want names to gain magical leverage and authority over mortals. A name isn't just a label; it represents your identity, soul, and destiny. By acquiring it, fey can exert absolute control over your actions, use it as currency, or bind you to unbreakable magical contracts.",
    quote: '"A name is a weapon, and faeries are weapon-masters."'
  },
  {
    greeting: "State Your Name",
    text: "You must state your name before entering the Realm of Faeries",
    quote: ""
  },
  {
    greeting: "The Rules of Survival",
    text: "Tip: If you want to survive the faerie courts, listen closely:\n\nnever eat their fruit, never dance in their circles, and never, ever make a bargain you cannot afford.",
    quote: '"Harden your heart. Keep your head."'
  }
];

const getReturningDialogues = (name) => [
  {
    greeting: `Welcome back, ${name || 'mortal'}.`,
    text: `You step once again into the courts of Elfhame. The thorns are as sharp as ever, and Cardan still plays his games on the throne. I am Jude Duarte. If you want to survive a second time, keep your wits about you.`,
    quote: '"If I cannot be better than them, I will become so much worse."'
  },
  {
    greeting: "The Rules of Survival",
    text: "Never forget the three rules: never eat their fruit, never dance in their circles, and never make a bargain you cannot keep. Safe travels, mortal.",
    quote: '"Harden your heart. Keep your head."'
  }
];

export default function CharacterGuide({ currentLocation, isVisible, isWelcomeActive, onCloseWelcome, onVisitorRegistered, sceneData }) {
  const [dialogue, setDialogue] = useState(dialogueData.landing);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const turbulenceRef = useRef(null);

  // Typewriter states
  const [displayedText, setDisplayedText] = useState('');
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);

  // Welcome stepper states
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [userName, setUserName] = useState('');

  // Returning visitor states initialized synchronously to avoid layout flashes
  const [isReturning, setIsReturning] = useState(() => {
    const rememberedUntil = localStorage.getItem('elfhame_remembered_until');
    const now = Date.now();
    const name = localStorage.getItem('elfhame_visitor_name');
    return !!(rememberedUntil && parseInt(rememberedUntil, 10) > now && name);
  });
  const [savedName, setSavedName] = useState(() => {
    return localStorage.getItem('elfhame_visitor_name') || 'mortal';
  });

  // Re-run checks if welcome overlay state changes
  useEffect(() => {
    if (isWelcomeActive) {
      const rememberedUntil = localStorage.getItem('elfhame_remembered_until');
      const now = Date.now();
      const name = localStorage.getItem('elfhame_visitor_name');
      const returning = !!(rememberedUntil && parseInt(rememberedUntil, 10) > now && name);
      setIsReturning(returning);
      if (name) setSavedName(name);
    }
  }, [isWelcomeActive]);

  // Reset welcome step when active state changes
  useEffect(() => {
    if (isWelcomeActive) {
      setWelcomeStep(0);
      setUserName('');
    }
  }, [isWelcomeActive]);

  useEffect(() => {
    if (isWelcomeActive) {
      if (isReturning) {
        const dialogues = getReturningDialogues(savedName);
        setDialogue(dialogues[welcomeStep] || dialogues[0]);
      } else {
        setDialogue(welcomeDialogues[welcomeStep]);
      }
    } else if (currentLocation === 'palace' && sceneData && sceneData.dialogue) {
      setDialogue(sceneData.dialogue);
      audioSynth.playMarkerHover();
    } else {
      const key = currentLocation || 'map';
      if (dialogueData[key]) {
        setDialogue(dialogueData[key]);
        if (currentLocation) audioSynth.playMarkerHover();
      }
    }
  }, [currentLocation, isWelcomeActive, welcomeStep, sceneData, isReturning, savedName]);

  useEffect(() => {
    const textVal = dialogue.text || '';
    const quoteVal = dialogue.quote || '';

    // If welcome is not active, display instantly and bypass typewriter
    if (!isWelcomeActive) {
      setDisplayedText(textVal);
      setDisplayedQuote(quoteVal);
      setTypingComplete(true);
      return;
    }

    // Reset and run typewriter sequence when dialogue changes
    setDisplayedText('');
    setDisplayedQuote('');
    setTypingComplete(false);

    let textTimer;
    let quoteTimer;
    
    let textCharIndex = 0;
    let quoteCharIndex = 0;

    // Start playing typewriter loop sound
    audioSynth.playTypewriterLoop();

    const typeText = () => {
      if (textCharIndex < textVal.length) {
        setDisplayedText(textVal.substring(0, textCharIndex + 1));
        textCharIndex++;
        textTimer = setTimeout(typeText, 25);
      } else {
        setTimeout(typeQuote, 300);
      }
    };

    const typeQuote = () => {
      if (quoteCharIndex < quoteVal.length) {
        setDisplayedQuote(quoteVal.substring(0, quoteCharIndex + 1));
        quoteCharIndex++;
        quoteTimer = setTimeout(typeQuote, 25);
      } else {
        setTypingComplete(true);
        audioSynth.stopTypewriterLoop();
      }
    };

    typeText();

    return () => {
      clearTimeout(textTimer);
      clearTimeout(quoteTimer);
      audioSynth.stopTypewriterLoop();
    };
  }, [dialogue, currentLocation, isWelcomeActive]);

  const handleNameSubmit = () => {
    audioSynth.playMarkerClick();
    
    // Save name locally
    localStorage.setItem('elfhame_visitor_name', userName || 'Mortal');

    // Remember for 3.5 days
    const expirationTime = Date.now() + 3.5 * 24 * 60 * 60 * 1000;
    localStorage.setItem('elfhame_remembered_until', expirationTime.toString());

    // Increment global count via hit endpoint
    fetch('https://api.counterapi.dev/v1/projects/elfhame-atlas/counters/visitors/hit')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.value === 'number') {
          localStorage.setItem('elfhame_visitor_count', data.value.toString());
          if (onVisitorRegistered) {
            onVisitorRegistered();
          }
        }
      })
      .catch(err => {
        console.warn("Failed to increment global counter, falling back to local:", err);
        const localCount = parseInt(localStorage.getItem('elfhame_visitor_count') || '128', 10) + 1;
        localStorage.setItem('elfhame_visitor_count', localCount.toString());
        if (onVisitorRegistered) {
          onVisitorRegistered();
        }
      });

    setWelcomeStep(3);
  };

  // Global click listener for skipping typewriter or advancing in welcome screen
  useEffect(() => {
    if (!isWelcomeActive) return;

    const handleGlobalClick = () => {
      if (!typingComplete) {
        setTypingComplete(true);
        setDisplayedText(dialogue.text || '');
        setDisplayedQuote(dialogue.quote || '');
        audioSynth.stopTypewriterLoop();
      } else {
        if (isReturning) {
          if (welcomeStep === 0) {
            audioSynth.playMarkerClick();
            setWelcomeStep(1);
          } else if (welcomeStep === 1) {
            audioSynth.playMarkerClick();
            onCloseWelcome();
          }
        } else {
          if (welcomeStep === 0) {
            audioSynth.playMarkerClick();
            setWelcomeStep(1);
          } else if (welcomeStep === 1) {
            audioSynth.playMarkerClick();
            setWelcomeStep(2);
          } else if (welcomeStep === 2) {
            // Name input step, clicking does nothing
          } else if (welcomeStep === 3) {
            audioSynth.playMarkerClick();
            onCloseWelcome();
          }
        }
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [isWelcomeActive, typingComplete, dialogue, onCloseWelcome, welcomeStep, isReturning]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let time = 0;
    const animateWind = () => {
      time += 0.005;
      if (turbulenceRef.current) {
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

  const handlePortraitClick = () => {
    if (isWelcomeActive) return; // ignore collapse clicks during welcome intro
    audioSynth.playMarkerClick();
    setIsCollapsed(prev => !prev);
  };

  return (
    <motion.div 
      layout
      className={`character-guide-root ${isWelcomeActive ? 'welcome-centered' : ''}`}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
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

      {/* Portrait — clicking toggles collapse */}
      <div className="jude-wrapper">
        <div
          className="jude-image-container"
          onClick={handlePortraitClick}
          style={{ cursor: isWelcomeActive ? 'default' : 'pointer' }}
          title={isWelcomeActive ? undefined : (isCollapsed ? 'Open dialogue' : 'Close dialogue')}
        >
          <img
            src="/characters/jude/judeduarte.jpeg"
            alt="Jude Duarte"
            className="jude-sprite"
          />
          <div className="jude-backlight" />

          {/* Collapse/expand hint tab on the right edge of the portrait */}
          {!isWelcomeActive && (
            <motion.div
              className="jude-toggle-tab"
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ display: 'inline-block', lineHeight: 1 }}
              >
                ›
              </motion.span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Dialogue box — collapses horizontally */}
      <motion.div
        className="dialogue-box gothic-border"
        initial={false}
        animate={{
          width: isCollapsed ? 0 : '100%',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{
          width:   { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          opacity: { duration: 0.25, ease: 'easeInOut' },
        }}
        style={{ 
          overflow: 'hidden', 
          whiteSpace: isCollapsed ? 'nowrap' : 'normal',
          boxSizing: 'border-box'
        }}
      >
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
            <p className="dialogue-text">
              {displayedText}
              {!typingComplete && displayedText.length < (dialogue.text || '').length && (
                <span className="typewriter-cursor">|</span>
              )}
            </p>
            {isWelcomeActive && welcomeStep === 2 && typingComplete && (
              <div 
                className="name-input-container" 
                onClick={(e) => e.stopPropagation()} 
                style={{
                  marginTop: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  width: '100%'
                }}
              >
                <input
                  type="text"
                  placeholder="Enter your name, mortal..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="gothic-input"
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--gold-dark)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleNameSubmit();
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleNameSubmit}
                  className="btn-fantasy whisper-btn"
                  style={{
                    alignSelf: 'flex-end',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                  }}
                >
                  Confirm Name
                </button>
              </div>
            )}
            {displayedQuote && (
              <div className="dialogue-quote">
                <span>{displayedQuote}</span>
                {!typingComplete && displayedText.length === (dialogue.text || '').length && (
                  <span className="typewriter-cursor">|</span>
                )}
              </div>
            )}
            {typingComplete && isWelcomeActive && welcomeStep !== 2 && (
              <motion.div 
                className="click-to-proceed"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {isReturning
                  ? (welcomeStep === 1 ? "Enter the Realm ›" : "Click anywhere to continue ›")
                  : (welcomeStep === 3 ? "Enter the Realm ›" : "Click anywhere to continue ›")
                }
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

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

        .character-guide-root.welcome-centered {
          position: fixed;
          bottom: calc(50vh - 120px);
          left: calc(50vw - 375px);
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 30px;
          z-index: 100;
          max-width: 750px;
          width: 90%;
          pointer-events: auto;
        }

        .character-guide-root.welcome-centered .jude-wrapper {
          width: 180px;
          height: 240px;
        }

        .character-guide-root.welcome-centered .dialogue-box {
          max-width: var(--dialogue-box-width);
          width: 100%;
          padding: 24px 30px;
          border-width: 2px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(212, 175, 55, 0.25);
        }

        .character-guide-root.welcome-centered .dialogue-text {
          font-size: 1.05rem;
          line-height: 1.5;
        }

        .character-guide-root.welcome-centered .dialogue-title {
          font-size: 1.25rem;
          margin-bottom: 12px;
        }

        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          background-color: var(--gold-primary);
          margin-left: 4px;
          animation: blink 0.8s infinite;
          line-height: 1;
        }

        .click-to-proceed {
          font-size: 0.85rem;
          color: var(--gold-primary);
          text-align: right;
          margin-top: 15px;
          font-family: var(--font-display);
          letter-spacing: 0.05em;
          opacity: 0.8;
          text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        @media (max-width: 768px) {
          .character-guide-root.welcome-centered {
            flex-direction: column !important;
            bottom: auto !important;
            left: 5% !important;
            top: 15vh !important;
            width: 90% !important;
            gap: 15px !important;
            max-width: 100% !important;
          }
          .character-guide-root.welcome-centered .jude-wrapper {
            width: 110px !important;
            height: 150px !important;
          }
          .character-guide-root.welcome-centered .dialogue-box {
            --dialogue-box-width: 500px;
            max-width: 100% !important;
            padding: 16px 20px !important;
          }
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
          white-space: pre-wrap;
        }

        .gothic-input:focus {
          border-color: var(--gold-primary) !important;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
        }
        .whisper-btn {
          width: fit-content;
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
          .jude-toggle-tab {
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 28px;
          background: rgba(11, 15, 20, 0.85);
          border: 1px solid var(--gold-dark);
          border-left: none;
          border-radius: 0 4px 4px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--gold-primary);
          cursor: pointer;
          z-index: 2;
        }
        .dialogue-content {
          white-space: normal;
        }
        @media (max-width: 768px) {
          .dialogue-box {
            --dialogue-box-width: 320px;
            max-width: var(--dialogue-box-width);
          }
          .character-guide-root.welcome-centered .dialogue-box {
            --dialogue-box-width: 320px;   /* was 500px from desktop — needs override here too */
            max-width: 100%;               /* fine to keep as a true viewport safety cap */
          }
        }
      `}</style>
    </motion.div>
  );
}
