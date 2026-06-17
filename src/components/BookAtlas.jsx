import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import audioSynth from '../utils/audio';
import QuillWriter from './QuillWriter';
import goldFeather from '../assets/gold_feather.png';
import inkPot from '../assets/ink_pot.png';
import frontCover from '../assets/bookcover/frontcover.png';
import backCover from '../assets/bookcover/backcover.png';

const NUM_PAGES = 6; // Chapters I to VI

export default function BookAtlas({ setGlobalLocation }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we are returning from a full-screen scene
  const returnFrom = location.state?.returnFrom;

  // Book flipping animation states
  const [coverTurned, setCoverTurned] = useState(returnFrom ? true : false);
  const [currentPage, setCurrentPage] = useState(
    returnFrom === 'palace' ? 1 : (returnFrom === 'gallery' ? 2 : 0)
  );
  
  // Set initial turned state based on routing parameters
  const [pageStates, setPageStates] = useState(() => {
    if (returnFrom === 'palace') {
      // Chapter II: Sheet 0 is turned (left side), others are on the right
      return [
        { turned: true, zIndex: 10 },
        { turned: false, zIndex: 19 },
        { turned: false, zIndex: 18 },
        { turned: false, zIndex: 17 },
        { turned: false, zIndex: 16 },
        { turned: false, zIndex: 15 },
      ];
    } else if (returnFrom === 'gallery') {
      // Chapter III: Sheets 0 and 1 are turned (left side), others are on the right
      return [
        { turned: true, zIndex: 10 },
        { turned: true, zIndex: 11 },
        { turned: false, zIndex: 18 },
        { turned: false, zIndex: 17 },
        { turned: false, zIndex: 16 },
        { turned: false, zIndex: 15 },
      ];
    } else if (returnFrom === 'map') {
      // Chapter I: All sheets are on the right (unturned)
      return [
        { turned: false, zIndex: 20 },
        { turned: false, zIndex: 19 },
        { turned: false, zIndex: 18 },
        { turned: false, zIndex: 17 },
        { turned: false, zIndex: 16 },
        { turned: false, zIndex: 15 },
      ];
    } else {
      // First time loading: All sheets start turned to the left for the opening sequence
      return [
        { turned: false, zIndex: 20 },
        { turned: false, zIndex: 19 },
        { turned: false, zIndex: 18 },
        { turned: false, zIndex: 17 },
        { turned: false, zIndex: 16 },
        { turned: false, zIndex: 15 },
      ];
    }
  });

  const [bookRotation, setBookRotation] = useState(returnFrom ? 0 : 180);
  const hasRunIntro = useRef(false);
  const [isIntroAnimating, setIsIntroAnimating] = useState(returnFrom ? false : true);
  const [bookZoomState, setBookZoomState] = useState('none'); // 'none', 'zooming-out', 'zooming-in'

  const coverRightRef = useRef(null);

  // Sync guide audio dialogues with Jude Duarte
  useEffect(() => {
    if (gameStateForGuide() === 'book') {
      setGlobalLocation('book');
    } else {
      setGlobalLocation('map');
    }
  }, [currentPage, coverTurned, setGlobalLocation]);

  useEffect(() => {
    console.log("CURRENT PAGE:", currentPage);
  }, [currentPage]);

  const gameStateForGuide = () => {
    if (!coverTurned) return 'book';
    return 'book';
  };

  // Cinematic Y-rotation animation (Backcover to Frontcover) on first load
  useEffect(() => {
    //console.log("INTRO EFFECT RUN");

    const t1 = setTimeout(() => {
      //console.log("ROTATING BOOK");
      setBookRotation(0);
    }, 2500);

    const t2 = setTimeout(() => {
      //console.log("INTRO FINISHED");
      setIsIntroAnimating(false);
    }, 2700);

    return () => {
     // console.log("INTRO CLEANUP");
    };
  }, []);

  useEffect(() => {
    // console.log(
    //   "INTRO CHANGED:",
    //   isIntroAnimating
    // );
  }, [isIntroAnimating]);
  useEffect(() => {
    // console.log(
    //   "BOOK ROTATION:",
    //   bookRotation
    // );
  }, [bookRotation]);

  useEffect(() => {
    //console.log("coverTurned changed:", coverTurned);
  }, [coverTurned]);

  // Flip sheets programmatically
  const handlePageTurn = (index, direction) => {
    if (isIntroAnimating) return;
    // console.log(
    //   "TURN PAGE",
    //   index,
    //   direction
    // );

    //console.log('flip sheets programmatically');

    if (direction === 'next') {
      setPageStates((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], turned: true };
        setTimeout(() => {
          setPageStates((p) => {
            const n = [...p];
            n[index] = { ...n[index], zIndex: 10 + index };
            return n;
          });
        }, 2200);
        return next;
      });
      setCurrentPage(index + 1);
      audioSynth.playPageFlip();
    } else {
      setPageStates((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], turned: false };
        setTimeout(() => {
          setPageStates((p) => {
            const n = [...p];
            n[index] = { ...n[index], zIndex: 20 - index };
            return n;
          });
        }, 2200);
        return next;
      });
      setCurrentPage(index);
      audioSynth.playPageFlip();
    }
  };

  // Open the book from closed front cover
  const handleOpenBook = () => {
    // console.log("OPEN BOOK CLICKED");
    // console.log("isIntroAnimating:", isIntroAnimating);
    // console.log("coverTurned before:", coverTurned);

    if (isIntroAnimating) {
      // console.log("BLOCKED BY isIntroAnimating");
      return;
    }
    if (isIntroAnimating) return;

    audioSynth.playMarkerClick();

    setCoverTurned(true);
    console.log("SETTING COVER TURNED TRUE");

    setTimeout(() => {
      setIsIntroAnimating(true);

      const startFlipTime = 400;
      const flipInterval = 600;

      setIsIntroAnimating(false);

      setTimeout(() => {
        setIsIntroAnimating(false);
      }, startFlipTime + NUM_PAGES * flipInterval + 500);

    }, 1200);
  };

  // Close the book cover and reset to front page from the end of the book
  const handleReturnToFront = () => {
    console.log("RETURN TO FRONT CLICKED");
    audioSynth.playPageShuffle();

    setIsIntroAnimating(true);

    for (let i = NUM_PAGES - 1; i >= 0; i--) {
      setTimeout(() => {
        setPageStates(prev => {
          const next = [...prev];

          next[i] = {
            ...next[i],
            turned: false,
            zIndex: 20 - i,
          };

          return next;
        });
      }, (NUM_PAGES - i) * 400);
    }

    setTimeout(() => {
      setCurrentPage(0);
      setCoverTurned(false);
      setIsIntroAnimating(false);
    }, NUM_PAGES * 400 + 2200);
  };

  // Navigate to full screen scenes with zoom scaling transitions
  const navigateToMap = () => {
    audioSynth.playMarkerClick();
    setBookZoomState('zooming-out');
    setTimeout(() => {
      navigate('/map');
    }, 1200);
  };

  const navigateToPalace = () => {
    audioSynth.playMarkerClick();
    setBookZoomState('zooming-out');
    setTimeout(() => {
      navigate('/palace');
    }, 1200);
  };

  const navigateToGallery = () => {
    audioSynth.playMarkerClick();
    setBookZoomState('zooming-out');
    setTimeout(() => {
      navigate('/gallery');
    }, 1200);
  };

  const isClosed = !coverTurned;

  return (
    <div className={`book-container-root ${bookZoomState === 'zooming-out' ? 'zoom-out' : ''}`}>
      <div 
        className={`book-wrapper gothic-border-outer ${isClosed ? 'closed' : ''}`}
        style={{
          transform: `rotateY(${bookRotation}deg)`,
          transition: "transform 2.5s cubic-bezier(.645,.045,.355,1)",
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Underneath cover sheets (left/right backgrounds) */}
        <div style={{
          ...styles.coverLeft,
          opacity: isClosed ? 0 : 1,
          transition: "opacity 0.6s ease-in-out",
        }} />
        
        <div style={{
          ...styles.coverRightUnder,
          backgroundImage: (currentPage === NUM_PAGES) ? `url(${backCover})` : `url(${frontCover})`,
          backgroundSize: "cover",
          opacity: isClosed ? 0 : 1,
          transition: "backgroundImage 0.6s ease-in-out, opacity 0.6s ease-in-out",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2.5rem",
          color: "#2c2419",
          textAlign: "center",
        }}>
          {currentPage === NUM_PAGES && !isClosed && (
            <>
              <div className="vintage-page-border">
                <div className="vintage-corner top-left"></div>
                <div className="vintage-corner top-right"></div>
                <div className="vintage-corner bottom-left"></div>
                <div className="vintage-corner bottom-right"></div>
              </div>
              
              <div className="chapter-cover-vintage" style={{ zIndex: 11, padding: '1rem', width: '100%' }}>
                <span className="chapter-label" style={{ color: '#8a6f27' }}>THE END OF THE JOURNEY</span>
                <div className="landing-divider" style={{ margin: '10px auto' }} />
                <p className="chapter-desc" style={{ fontSize: '0.85rem', color: '#3d2f1f', fontStyle: 'italic', marginBottom: '20px' }}>
                  "If you hurt me, I will find a way to hurt you back. Twice as hard."
                </p>
                
              </div>
            </>
          )}
        </div>

        {/* Dynamic cover (rotates open or closed) */}
        <div
          ref={coverRightRef}
          style={{
            ...styles.coverRight,
            transformOrigin: isClosed ? 'right' : 'left',
            left: isClosed ? 0 : "50%",
            width: isClosed ? "100%" : "50%",
            transform: coverTurned ? "rotateY(-180deg)" : "rotateY(0deg)",
            transition: "left 1.2s cubic-bezier(.645,.045,.355,1), width 1.2s cubic-bezier(.645,.045,.355,1), transform 1.8s cubic-bezier(.645,.045,.355,1)",
          }}
        >
          <div style={styles.coverRightFront} />
          
          {/* Inside Cover: rendered as a gorgeous parchment page when open */}
          <div style={{
            ...styles.coverRightBack,
            backgroundImage: isClosed ? `url(${backCover})` : "url('/environment/vintage_parchment_page.png')",
            backgroundColor: isClosed ? "transparent" : "#fff2df",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
            {!isClosed && (
              <>
                <div className="vintage-page-border">
                  <div className="vintage-corner top-left"></div>
                  <div className="vintage-corner top-right"></div>
                  <div className="vintage-corner bottom-left"></div>
                  <div className="vintage-corner bottom-right"></div>
                </div>
                <div className="left-page-content-vintage">
                  <h2 className="chapter-headline"  style={{ marginBottom: '0.4rem' }}>THE CHRONICLES OF ELFHAME</h2>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    lineHeight: '1.2'
                  }}>
                    <li>Chapter I — The Realm</li>
                    <li>Chapter II — The Courts</li>
                    <li>Chapter III — The Folk</li>
                    <li>Chapter IV — The Magic</li>
                    <li>Chapter V — The Story</li>
                    <li>Chapter VI — The Heart</li>
                  </ul>

                </div>
              </>
            )}
          </div>
        </div>

        {/* Book pages (sheets container) */}
        <div style={{ 
          ...styles.book, 
          opacity: isClosed ? 0 : 1, 
          transition: "opacity 0.5s ease-in-out" 
        }}>

          {/* Turnable sheets */}
          {pageStates.map((ps, i) => (
            <div
              key={i}
              style={{
                ...styles.pageRight,
                zIndex: ps.zIndex,
                transform: ps.turned ? "rotateY(-180deg)" : "rotateY(0deg)",
                boxShadow:
                  ps.turned
                    ? "-20px 0 40px rgba(0,0,0,0.25)"
                    : "0 0 0 rgba(0,0,0,0)",
              }}
            >
              {/* Sheet FRONT face (stands on the right) */}
              <div style={styles.pageFront} className="book-page-front">
                <div className="vintage-page-border">
                  <div className="vintage-corner top-left"></div>
                  <div className="vintage-corner top-right"></div>
                  <div className="vintage-corner bottom-left"></div>
                  <div className="vintage-corner bottom-right"></div>
                </div>
                
                {/* --- CHAPTER I: THE REALM (RIGHT SPREAD) --- */}
                {i === 0 && (
                  <div className="chapter-details-vintage" style={{ position: 'relative', minHeight: 300 }}>
                    <h3>THE LIVING MAP</h3>
                    <div className="sidebar-divider" />
                    <QuillWriter
                      text={`Select the button below to inspect realm lore, quotes, and hidden secrets. Navigate through Castle Elfhame, Locke's decadent ruins, the dangerous deep of the Undersea, or trade poisons in the Goblin market stalls.`}
                      active={currentPage === 0 && !isIntroAnimating && coverTurned}
                      feathterSrc={goldFeather}
                      inkpotSrc={inkPot}
                    />
                    <button 
                      className="btn-fantasy glow-gold" 
                      style={{ marginTop: '100px', marginRight: '200px', fontSize: '0.8rem', width: 'fit-content', alignSelf: 'center' }}
                      onClick={navigateToMap}
                      disabled={isIntroAnimating}
                    >
                      🗺️ EXPLORE ELFHAME
                    </button>
                  </div>
                )}

                {/* --- CHAPTER II: THE COURTS (RIGHT SPREAD) --- */}
                {i === 1 && (
                  <div className="chapter-details-vintage" style={{ position: 'relative', minHeight: 300 }}>
                    <h3>THE HIGH COURT</h3>
                    <div className="sidebar-divider" />
                    <QuillWriter
                      text={`"Most of all, I hate him because I think of him, often. It's like a disease." The Royal Palace stands as the crowning jewel of Elfhame. Inside, noble families plot for power, trading silver promises and deadly nightshade. Beneath the gilded columns, Cardan Duarte sits on the throne of thorns, mocking the mortals who dare tread his halls.`}
                      active={ps.turned === false && currentPage === i} // trigger when this page becomes visible
                      feathterSrc={goldFeather}
                      inkpotSrc={inkPot}
                    />
                  </div>
                )}

                {/* --- CHAPTER III: THE FOLK (RIGHT SPREAD) --- */}
                {i === 2 && (
                  <div className="chapter-cover-vintage" style={{ position: 'relative', minHeight: 300 }}>
                    <span className="chapter-label">CHAPTER III</span>
                    <h2 className="chapter-headline">THE FOLK</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <h4 style={{ color: 'var(--gold-dark)', margin: '10px 0' }}>Characters & Cards</h4>
                    <QuillWriter
                      text={`Details of the mortal wanderers, goblin merchants, and scheming nobility of the High Court.`}
                      active={ps.turned === false && currentPage === i}
                      feathterSrc={goldFeather}
                      inkpotSrc={inkPot}
                    />
                    <button 
                      className="btn-fantasy glow-gold" 
                      style={{ marginTop: '100px', marginRight: '200px', fontSize: '0.8rem', width: 'fit-content', alignSelf: 'center' }}
                      onClick={navigateToGallery}
                      disabled={isIntroAnimating}
                    >
                      🎭 ENTER GALLERY
                    </button>
                  </div>
                )}

                {/* --- CHAPTER IV: THE MAGIC (RIGHT SPREAD) --- */}
                {i === 3 && (
                  <div className="chapter-cover-vintage" style={{ position: 'relative', minHeight: 300 }}>
                    <span className="chapter-label">CHAPTER IV</span>
                    <h2 className="chapter-headline">THE MAGIC</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <h4 style={{ color: 'var(--gold-dark)', margin: '10px 0' }}>Creatures, Relics, Traditions</h4>
                    <QuillWriter
                      text={`An index of ancient artifacts, cursed rowan wood berries, ragwort horses, and standard faerie glamour.`}
                      active={ps.turned === false && currentPage === i}
                      feathterSrc={goldFeather}
                      inkpotSrc={inkPot}
                    />
                    <p style={styles.comingSoon}>— Chapter Locked —</p>
                  </div>
                )}

                {/* --- CHAPTER V: THE STORY (RIGHT SPREAD) --- */}
                {i === 4 && (
                  <div className="chapter-cover-vintage" style={{ position: 'relative', minHeight: 300 }}>
                    <span className="chapter-label">CHAPTER V</span>
                    <h2 className="chapter-headline">THE STORY</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <h4 style={{ color: 'var(--gold-dark)', margin: '10px 0' }}>Timeline of Events</h4>
                    <QuillWriter
                      text={`A compilation of major historical moments, royal coronations, and plots.`}
                      active={ps.turned === false && currentPage === i}
                      feathterSrc={goldFeather}
                      inkpotSrc={inkPot}
                    />
                    <p style={styles.comingSoon}>— Chapter Locked —</p>
                  </div>
                )}

                {/* --- CHAPTER VI: THE HEART (RIGHT SPREAD) --- */}
                {i === 5 && (
                  <div className="chapter-cover-vintage" style={{ position: 'relative', minHeight: 300 }}>
                    <span className="chapter-label">CHAPTER VI</span>
                    <h2 className="chapter-headline">THE HEART</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <h4 style={{ color: 'var(--gold-dark)', margin: '10px 0' }}>Quotes & Relationships</h4>
                    <QuillWriter
                      text={`A spiderweb of love, hate, and alliances binding Jude Duarte and High King Cardan.`}
                      active={ps.turned === false && currentPage === i}
                      feathterSrc={goldFeather}
                      inkpotSrc={inkPot}
                    />
                    <p style={styles.comingSoon}>— Chapter Locked —</p>
                  </div>
                )}

                {/* Next arrow navigation on front pages */}
                {i < NUM_PAGES && !isIntroAnimating && (
                  <button
                    onClick={() => handlePageTurn(i, 'next')}
                    style={styles.navBtn}
                    className="book-nav-btn"
                    aria-label="next page"
                  >
                    ›
                  </button>
                )}
              </div>

              {/* Sheet BACK face (stands on the left) */}
              <div style={styles.pageBack} className="book-page-back">
                <div className="vintage-page-border">
                  <div className="vintage-corner top-left"></div>
                  <div className="vintage-corner top-right"></div>
                  <div className="vintage-corner bottom-left"></div>
                  <div className="vintage-corner bottom-right"></div>
                </div>
                
                {/* --- CHAPTER II: THE COURTS (LEFT SPREAD) --- */}
                {i === 0 && (
                  <div className="left-page-content-vintage">
                    <span className="chapter-label">CHAPTER II</span>
                    <h2 className="chapter-headline">THE COURTS</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <p className="chapter-summary">
                      "Most of all, I hate him because I think of him, often. It's like a disease."
                    </p>
                    <p className="chapter-desc">
                      Step inside the grand golden hall of the Palace of Elfhame and witness royal court intrigue.
                    </p>
                    <button 
                      className="btn-fantasy glow-gold" 
                      style={{ marginTop: '10px' }}
                      onClick={navigateToPalace}
                      disabled={isIntroAnimating}
                    >
                      🏰 ENTER PALACE SCENE
                    </button>
                  </div>
                )}

                {/* --- CHAPTER III: THE FOLK (LEFT SPREAD) --- */}
                {i === 1 && (
                  <div className="chapter-cover-vintage">
                    <span className="chapter-label">CHAPTER III</span>
                    <h2 className="chapter-headline">THE FOLK</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <p className="chapter-summary" style={{ marginBottom: '15px' }}>
                      "Details of the mortal wanderers, goblin merchants, and scheming nobility of the High Court."
                    </p>
                    <button 
                      className="btn-fantasy glow-gold" 
                      style={{ marginTop: '10px' }}
                      onClick={navigateToGallery}
                      disabled={isIntroAnimating}
                    >
                      🎭 ENTER GALLERY
                    </button>
                  </div>
                )}

                {/* --- CHAPTER IV: THE MAGIC (LEFT SPREAD) --- */}
                {i === 2 && (
                  <div className="chapter-cover-vintage">
                    <span className="chapter-label">CHAPTER IV</span>
                    <h2 className="chapter-headline">THE MAGIC</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <p className="chapter-summary">
                      "An index of ancient artifacts, cursed rowan wood berries, and standard faerie glamour."
                    </p>
                    <p style={styles.comingSoon}>— Chapter Locked —</p>
                  </div>
                )}

                {/* --- CHAPTER V: THE STORY (LEFT SPREAD) --- */}
                {i === 3 && (
                  <div className="chapter-cover-vintage">
                    <span className="chapter-label">CHAPTER V</span>
                    <h2 className="chapter-headline">THE STORY</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <p className="chapter-summary">
                      "A compilation of major historical moments, royal coronations, and plots."
                    </p>
                    <p style={styles.comingSoon}>— Chapter Locked —</p>
                  </div>
                )}

                {/* --- CHAPTER VI: THE HEART (LEFT SPREAD) --- */}
                {i === 4 && (
                  <div className="chapter-cover-vintage">
                    <span className="chapter-label">CHAPTER VI</span>
                    <h2 className="chapter-headline">THE HEART</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <p className="chapter-summary">
                      "A spiderweb of love, hate, and alliances binding Jude Duarte and High King Cardan."
                    </p>
                    <p style={styles.comingSoon}>— Chapter Locked —</p>
                  </div>
                )}

                {/* --- END OF BOOK / RETURN TO FRONT COVER (LEFT SPREAD) --- */}
                {i === 5 && (
                  <div className="chapter-cover-vintage">
                    <span className="chapter-label">PROLOGUE & EPILOGUE</span>
                    <h2 className="chapter-headline" style={{ fontSize: '1.35rem' }}>THE END OF THE ATLAS</h2>
                    <div className="landing-divider" style={{ margin: '15px auto' }} />
                    <p className="chapter-desc" style={{ fontSize: '0.82rem', opacity: 0.8, fontStyle: 'italic' }}>
                      "We have spoken of the dead. Now let us speak of the living."
                    </p>
                  </div>
                )}

                {/* Prev arrow navigation on back pages */}
                {!isIntroAnimating && (
                  <button
                    onClick={() => handlePageTurn(i, 'prev')}
                    style={{ ...styles.navBtn, left: 16, right: "auto" }}
                    className="book-nav-btn"
                    aria-label="previous page"
                  >
                    ‹
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual flip prompt when book is closed showing frontcover */}
      {/* {console.log(
        "BUTTON CHECK",
        {
          isClosed,
          isIntroAnimating,
          coverTurned
        }
      )}
      {console.log(
        "RENDER:",
        {
          isClosed,
          isIntroAnimating,
          bookRotation,
          coverTurned
        }
      )} */}
      {currentPage === NUM_PAGES &&
        !isClosed &&
        !isIntroAnimating && (
          <button
            className="btn-fantasy glow-gold"
            onClick={handleReturnToFront}
            style={{
              position: "absolute",
              bottom: "30px",
              right: "40px",
              zIndex: 9999,
              pointerEvents: 'auto'
            }}
          >
            📖 RETURN TO FRONT PAGE
          </button>
        )}
      {isClosed && !isIntroAnimating && (
        <button className="btn-fantasy btn-open-atlas glow-gold" onClick={handleOpenBook}>
          📖 OPEN ENCHANTED ATLAS
        </button>
      )}
    </div>
  );
}

const styles = {
  coverLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    backgroundImage: `url(${backCover})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderTopLeftRadius: "0.6rem",
    borderBottomLeftRadius: "0.6rem",
    zIndex: -1,
    boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)",
  },
  coverRightUnder: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: "50%",
    height: "100%",
    backgroundImage: `url(${frontCover})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderTopRightRadius: "0.6rem",
    borderBottomRightRadius: "0.6rem",
    zIndex: -2,
    PointerEvents: "none",
    boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)",
  },
  coverRight: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: "50%",
    height: "100%",
    zIndex: 90,
    transformStyle: "preserve-3d",
  },
  coverRightFront: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url(${frontCover})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderTopRightRadius: "0.6rem",
    borderBottomRightRadius: "0.6rem",
    backfaceVisibility: "hidden",
    transform: "rotateY(0deg) translateZ(1px)",
    boxShadow: "inset 0 0 100px rgba(0,0,0,0.3)",
  },
  coverRightBack: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderTopLeftRadius: "0.6rem",
    borderBottomLeftRadius: "0.6rem",
    border: "1px solid #8a6f27",
    backfaceVisibility: "hidden",
    transform: "rotateY(180deg) translateZ(1px)",
    boxShadow: "inset 0 0 50px rgba(0,0,0,0.15)",
    padding: "2.5rem",
    color: "#2c2419",
    overflowY: "auto",
  },
  book: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    perspective: "250rem",
  },
  pageLeft: {
    position: "absolute",
    left: 0,
    width: "50%",
    height: "100%",
    backgroundImage: "url('/environment/vintage_parchment_page.png')",
    backgroundSize: "cover",
    borderRight: "1px solid rgba(0,0,0,0.15)",
    boxShadow: "-0.6rem 0.6rem 1.5rem rgba(0,0,0,0.3)",
    padding: "2.5rem",
    color: "#2c2419",
    overflowY: "auto",
    borderTopLeftRadius: "0.4rem",
    borderBottomLeftRadius: "0.4rem",
    zIndex: 1, // Sits under pages stack but acts as fallback static TOC
  },
  pageLeftInner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  bookTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.25rem",
    textAlign: "center",
    color: "#1c140d",
    margin: 0,
  },
  bookIntro: {
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    textAlign: "center",
    color: "#63503b",
    lineHeight: "1.4",
  },
  tocContainer: {
    marginTop: "1.5rem",
    flexGrow: 1,
  },
  tocHeader: {
    fontFamily: "var(--font-display)",
    fontSize: "0.75rem",
    color: "#8a6f27",
    letterSpacing: "0.1em",
    borderBottom: "1px dashed rgba(138, 111, 39, 0.3)",
    paddingBottom: "4px",
    margin: "0 0 10px 0",
  },
  tocList: {
    listStyleType: "none",
    paddingLeft: 0,
  },
  pageRight: {
    position: "absolute",
    right: 0,
    width: "50%",
    height: "100%",
    transformStyle: "preserve-3d",
    transformOrigin: "left",
    transition: "transform 2.2s cubic-bezier(.645,.045,.355,1)",
  },
  pageFront: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/environment/vintage_parchment_page.png')",
    backgroundSize: "cover",
    transform: "rotateY(0deg) translateZ(1px)",
    backfaceVisibility: "hidden",
    padding: "2.5rem",
    color: "#2c2419",
    borderLeft: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0.6rem 0.6rem 1.5rem rgba(0,0,0,0.2)",
    borderTopRightRadius: "0.4rem",
    borderBottomRightRadius: "0.4rem",
    overflow: "hidden",
  },
  pageBack: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/environment/vintage_parchment_page.png')",
    backgroundSize: "cover",
    transform: "rotateY(180deg) translateZ(1px)",
    backfaceVisibility: "hidden",
    padding: "2.5rem",
    color: "#2c2419",
    borderRight: "1px solid rgba(0,0,0,0.15)",
    boxShadow: "-0.6rem 0.6rem 1.5rem rgba(0,0,0,0.3)",
    borderTopLeftRadius: "0.4rem",
    borderBottomLeftRadius: "0.4rem",
    overflowY: "auto",
  },
  chapterCover: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
  chapterDetails: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  leftPageContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
  comingSoon: {
    fontFamily: "var(--font-display)",
    fontSize: "0.8rem",
    color: "#a8864a",
    letterSpacing: "0.15em",
    marginTop: "20px",
    border: "1px solid rgba(168, 134, 74, 0.3)",
    padding: "6px 16px",
    borderRadius: "2px",
    display: "inline-block",
  },
  navBtn: {
    position: "absolute",
    bottom: 14,
    right: 20,
    background: "transparent",
    border: "none",
    fontSize: "2.5rem",
    cursor: "pointer",
    color: "#8a6f27",
    lineHeight: 1,
    zIndex: 100,
    transition: "color 0.3s ease, transform 0.3s ease",
  },
};
