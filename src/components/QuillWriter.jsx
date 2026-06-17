import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import audioSynth from '../utils/audio';

const DIP_COUNT = 3;
const DIP_DURATION = 0.45; // seconds per dip cycle
const TRAVEL_DURATION = 0.9; // feather travel to top of page
const CHAR_INTERVAL = 22; // ms per character typed
const RETURN_DURATION = 1.1; // feather travel back to inkpot

export default function QuillWriter({
  text,
  active = true,
  onComplete,
  feathterSrc,
  inkpotSrc
}) {
  const [phase, setPhase] = useState('idle'); // idle -> dipping -> traveling -> writing -> returning -> done
  const [displayedText, setDisplayedText] = useState('');
  const [featherPos, setFeatherPos] = useState({ x: 0, y: 0 });
  const charIndexRef = useRef(0);
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  // Layout parameters for rest position
  const restRight = 45;
  const restBottom = 10;
  const featherWidth = 120;
  const featherHeight = 120;

  // Compute exact target transform for the feather tip to align with the cursor span
  const updateFeatherPosition = () => {
    if (cursorRef.current && containerRef.current) {
      const cursorRect = cursorRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const cursorX = cursorRect.left - containerRect.left;
      const cursorY = cursorRect.top - containerRect.top;
      
      // Compute the layout position of the feather image relative to the container's top-left
      const featherLayoutX = containerRect.width - restRight - featherWidth;
      const featherLayoutY = containerRect.height - restBottom - featherHeight;
      
      // Slanted feather tip offset within the 120x120 container
      const tipOffsetX = -5;
      const tipOffsetY = 150;
      
      setFeatherPos({
        x: cursorX - featherLayoutX - tipOffsetX,
        y: cursorY - featherLayoutY - tipOffsetY
      });
    }
  };

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      setDisplayedText('');
      setFeatherPos({ x: 0, y: 0 });
      return;
    }

    let timers = [];
    setPhase('idle');

    // Settle delay to let page turns/opening transition stabilize
    timers.push(setTimeout(() => {
      setPhase('dipping');
      audioSynth.playMarkerHover && audioSynth.playMarkerHover();

      const dipTotalTime = DIP_COUNT * DIP_DURATION * 1000;
      
      timers.push(setTimeout(() => {
        setPhase('traveling');
      }, dipTotalTime));

      timers.push(setTimeout(() => {
        setPhase('writing');
        audioSynth.playTypewriterLoop && audioSynth.playTypewriterLoop();
        runTypewriter();
      }, dipTotalTime + TRAVEL_DURATION * 1000));
    }, 1000));

    const runTypewriter = () => {
      charIndexRef.current = 0;
      const tick = () => {
        if (charIndexRef.current < text.length) {
          charIndexRef.current += 1;
          setDisplayedText(text.slice(0, charIndexRef.current));
          timers.push(setTimeout(tick, CHAR_INTERVAL));
        } else {
          audioSynth.stopTypewriterLoop && audioSynth.stopTypewriterLoop();
          setPhase('returning');
          timers.push(setTimeout(() => {
            setPhase('done');
            if (onComplete) onComplete();
          }, RETURN_DURATION * 1000));
        }
      };
      tick();
    };

    return () => {
      timers.forEach(clearTimeout);
      audioSynth.stopTypewriterLoop && audioSynth.stopTypewriterLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, text]);

  // Read layout metrics immediately after text render updates
  useLayoutEffect(() => {
    if (phase === 'writing' || phase === 'traveling') {
      const timer = setTimeout(updateFeatherPosition, 0);
      return () => clearTimeout(timer);
    }
  }, [displayedText, phase]);

  const getFeatherAnimate = () => {
    switch (phase) {
      case 'idle':
        return { x: 0, y: 0, rotate: -15, transition: { duration: 0.3 } };

      case 'dipping':
        return {
          y: [0, 20, 0, 20, 0, 20, 0], // moves down inside inkpot opening
          rotate: -30,
          transition: { duration: DIP_COUNT * DIP_DURATION, ease: 'easeInOut' }
        };

      case 'traveling':
        return {
          x: featherPos.x,
          y: featherPos.y,
          rotate: -20,
          transition: { duration: TRAVEL_DURATION, ease: [0.4, 0, 0.2, 1] }
        };

      case 'writing':
        return {
          x: featherPos.x,
          y: featherPos.y,
          rotate: -6,
          transition: { duration: 0.08, ease: 'linear' }
        };

      case 'returning':
        return {
          x: 0,
          y: 0,
          rotate: -35,
          transition: { duration: RETURN_DURATION, ease: [0.4, 0, 0.2, 1] }
        };

      case 'done':
      default:
        return { x: 0, y: 0, rotate: -35, transition: { duration: 0.3 } };
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '260px',
        paddingBottom: '110px'
      }}
    >
      {/* Dynamic typewriter text rendered in document flow */}
      <div
        style={{
          fontFamily: "'CourierPolski', monospace",
          fontSize: '1rem',
          lineHeight: '1.45',
          color: '#3d2f1f',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          padding: '0 10px'
        }}
      >
        {displayedText}
        {phase === 'writing' && (
          <span ref={cursorRef} className="quill-cursor-blot">‸</span>
        )}
        {phase !== 'writing' && (
          <span ref={cursorRef} style={{ visibility: 'hidden' }} />
        )}
      </div>

      {/* Inkpot — fixed in bottom corner */}
      <img
        src={inkpotSrc}
        alt=""
        style={{
          position: 'absolute',
          right: restRight + 35,
          bottom: restBottom - 140,
          width: 90,
          height: 90,
          objectFit: 'contain',
          opacity: 0.95
        }}
      />

      {/* Feather — tracks the cursor target offset */}
      <motion.img
        src={feathterSrc}
        alt=""
        initial={{ x: 0, y: 0, rotate: -35 }}
        animate={getFeatherAnimate()}
        style={{
          position: 'absolute',
          right: restRight ,
          bottom: restBottom - 20,
          width: featherWidth,
          height: featherHeight,
          objectFit: 'contain',
          transformOrigin: 'bottom right',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        }}
      />

      <style>{`
      
          @font-face {
            font-family: 'CourierPolski';
            src: url('/fonts/zai_CourierPolski1941.ttf') format('truetype');
            font-display: swap;
          }
          .quill-cursor-blot {
            display: inline-block;
            margin-left: 1px;
            color: #8a6f27;
            font-weight: bold;
            animation: quillBlink 0.5s steps(1) infinite;
          }
          @keyframes quillBlink {
            50% { opacity: 0; }
          }
      `}</style>
    </div>
  );
}