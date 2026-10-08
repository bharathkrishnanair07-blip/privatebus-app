/**
 * Kerala Private Bus - Mobile Application Logic
 * Integrates Fleet Management, YouTube IFrame Streaming, Web Audio SFX,
 * Conductor Bell Cord, Pneumatic Air Horns, Sleep Timer, and PWA Features.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 15 Authentic Kerala Private Buses categorized by regions
  const BUS_FLEET = [
    // North Malabar
    { id: 'MAYILVAHANAM', name: 'മയിൽവാഹനം', engName: 'Mayilvahanam', start: 'പാലക്കാട്', end: 'ഷൊർണൂർ', region: 'North Malabar', km: '48 km', type: 'Fast Passenger' },
    { id: 'RAJADHANI', name: 'രാജധാനി', engName: 'Rajadhani', start: 'കോഴിക്കോട്', end: 'കണ്ണൂർ', region: 'North Malabar', km: '88 km', type: 'Limited Stop' },
    { id: 'ASMA', name: 'അസ്മ', engName: 'Asma', start: 'മലപ്പുറം', end: 'കോഴിക്കോട്', region: 'North Malabar', km: '50 km', type: 'Express' },
    { id: 'KAVITHA', name: 'കവിത', engName: 'Kavitha', start: 'വടകര', end: 'കോഴിക്കോട്', region: 'North Malabar', km: '46 km', type: 'Ordinary' },
    { id: 'GHAT_RIDER', name: 'ഘട്ട് റൈഡർ', engName: 'Ghat Rider', start: 'കോഴിക്കോട്', end: 'സുൽത്താൻ ബത്തേരി', region: 'North Malabar', km: '98 km', type: 'High Range 4x4' },
    { id: 'CHIRAYATH', name: 'ചിറയത്ത്', engName: 'Chirayath', start: 'ഗുരുവായൂർ', end: 'കുന്നംകുളം', region: 'North Malabar', km: '24 km', type: 'City Shuttle' },

    // Central Kerala
    { id: 'KALAPPURACKAL', name: 'കളപ്പുരയ്ക്കൽ', engName: 'Kalappurackal', start: 'കോട്ടയം', end: 'കട്ടപ്പന', region: 'Central Kerala', km: '115 km', type: 'High Range Express' },
    { id: 'SREE KRISHNA', name: 'ശ്രീകൃഷ്ണ', engName: 'Sree Krishna', start: 'തൃശൂർ', end: 'ഗുരുവായൂർ', region: 'Central Kerala', km: '28 km', type: 'Temple Route' },
    { id: 'KCT', name: 'കെ.സി.ടി', engName: 'KCT', start: 'കോട്ടയം', end: 'എറണാകുളം', region: 'Central Kerala', km: '62 km', type: 'Limited Stop' },
    { id: 'PUTHENKANDATHIL', name: 'പുത്തൻകണ്ടത്തിൽ', engName: 'Puthenkandathil', start: 'ചങ്ങനാശ്ശേരി', end: 'ഗുരുവായൂർ', region: 'Central Kerala', km: '142 km', type: 'Super Express' },
    { id: 'CHOTTANIKKARA_AMMA', name: 'ചോറ്റാനിക്കര അമ്മ', engName: 'Chottanikkara Amma', start: 'ചോറ്റാനിക്കര', end: 'ആലുവ', region: 'Central Kerala', km: '32 km', type: 'Pilgrim City' },
    { id: 'KK_MENON', name: 'കെ.കെ മേനോൻ', engName: 'KK Menon', start: 'തൃശൂർ', end: 'കൊടുങ്ങല്ലൂർ', region: 'Central Kerala', km: '38 km', type: 'Coastal Route' },

    // South Kerala
    { id: 'SARANYA', name: 'ശരണ്യ', engName: 'Saranya', start: 'കടയ്ക്കൽ', end: 'എറണാകുളം', region: 'South Kerala', km: '196 km', type: 'Long Distance Rocket' },
    { id: 'VALIYAPARAMBIL', name: 'വലിയപറമ്പിൽ', engName: 'Valiyaparambil', start: 'ആലപ്പുഴ', end: 'ചങ്ങങ്കരി', region: 'South Kerala', km: '22 km', type: 'Kuttanad Backwater' },
    { id: 'EVERGREEN', name: 'എവർഗ്രീൻ', engName: 'Evergreen', start: 'പത്തനംതിട്ട', end: 'കൊല്ലം', region: 'South Kerala', km: '58 km', type: 'Midland Express' }
  ];

  // State
  let allSongsCatalog = {};
  let currentBusIndex = 0;
  let currentTrackIndex = 0;
  let currentPlaylist = [];
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;
  let favorites = JSON.parse(localStorage.getItem('keralaBusFavs') || '[]');
  let ytPlayer = null;
  let ytReady = false;
  let progressInterval = null;
  let sleepTimerInterval = null;
  let sleepTimerSecondsRemaining = 0;
  let isRumbleActive = false;

  // DOM Elements
  const elMainTitle = document.getElementById('led-bus-name');
  const elRouteStart = document.getElementById('route-start');
  const elRouteEnd = document.getElementById('route-end');
  const elTrackTitle = document.getElementById('now-track-title');
  const elTrackArtist = document.getElementById('now-track-artist');
  const elProgressBarFill = document.getElementById('progress-bar-fill');
  const elTimeCurrent = document.getElementById('time-current');
  const elTimeTotal = document.getElementById('time-total');
  const elProgressTrack = document.getElementById('progress-track');
  const elPlayBtn = document.getElementById('btn-play-pause');
  const elPrevBtn = document.getElementById('btn-prev');
  const elNextBtn = document.getElementById('btn-next');
  const elPlayIcon = document.getElementById('icon-play');
  const elPauseIcon = document.getElementById('icon-pause');
  const elVolumeSlider = document.getElementById('volume-slider');
  const elAirHornBtn = document.getElementById('btn-air-horn');
  const elBellCord = document.getElementById('bell-cord');
  const elCockpitBellBtn = document.getElementById('btn-cockpit-bell');
  const elRainToggle = document.getElementById('rain-toggle');
  const elRainOverlay = document.getElementById('rain-overlay');
  const elWiperContainer = document.getElementById('wiper-container');
  const elHapticsToggle = document.getElementById('haptics-toggle');
  const elRumbleToggle = document.getElementById('rumble-toggle');
  const elAppShell = document.getElementById('mobile-shell');
  const elFrameToggleBtn = document.getElementById('btn-frame-toggle');
  const elPwaInstallBtn = document.getElementById('btn-install-app');

  // Load saved preferences
  const savedBusId = localStorage.getItem('selectedBus') || 'MAYILVAHANAM';
  const foundBusIdx = BUS_FLEET.findIndex(b => b.id === savedBusId);
  if (foundBusIdx !== -1) currentBusIndex = foundBusIdx;

  const savedTheme = localStorage.getItem('keralaBusTheme') || 'default';
  if (savedTheme !== 'default') document.body.setAttribute('data-theme', savedTheme);

  // Initialize Fleet List in DOM
  renderBusFleet();

  // Navigation Tabs Switching
  const navTabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabScreens = document.querySelectorAll('.tab-screen');

  navTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navTabBtns.forEach(b => b.classList.remove('active'));
      tabScreens.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const activeScreen = document.getElementById(`tab-${targetTab}`);
      if (activeScreen) activeScreen.classList.add('active');

      window.keralaBusAudio.haptic([30]);
    });
  });

  // Fetch Songs Data
  fetch('./songs.json')
    .then(res => res.json())
    .then(data => {
      allSongsCatalog = data;
      loadBusTracks(currentBusIndex);
      setupYouTubePlayer();
      renderTrackList(currentPlaylist);
    })
    .catch(err => {
      console.error('Error loading songs.json:', err);
      // Fallback sample catalog if needed
      allSongsCatalog = {
        'MAYILVAHANAM': [
          { id: 'T1WtAuLw1rA', title: 'Aaruparanju', artist: 'Berny-Ignatius & K.S. Chithra' },
          { id: 'ZeoHaDRnyGI', title: 'Muthe Muthe', artist: 'Shyam Dharman & Sujatha' },
          { id: 'vUM70-ak5AY', title: 'Oru Venal Puzhayil', artist: 'Ouseppachan & Ranjith Govind' }
        ]
      };
      loadBusTracks(currentBusIndex);
      setupYouTubePlayer();
      renderTrackList(currentPlaylist);
    });

  /**
   * Load tracks for a specific bus
   */
  function loadBusTracks(busIdx) {
    currentBusIndex = busIdx;
    const bus = BUS_FLEET[busIdx];
    localStorage.setItem('selectedBus', bus.id);

    // Update Route Banner
    elMainTitle.textContent = bus.name;
    elRouteStart.textContent = bus.start;
    elRouteEnd.textContent = bus.end;

    // Load songs
    currentPlaylist = allSongsCatalog[bus.id] || allSongsCatalog['MAYILVAHANAM'] || [];
    currentTrackIndex = 0;

    // Highlight active bus card
    document.querySelectorAll('.bus-item-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-bus-id') === bus.id);
    });

    renderTrackList(currentPlaylist);

    if (currentPlaylist.length > 0) {
      updateNowPlayingUI(currentPlaylist[currentTrackIndex]);
    }
  }

  /**
   * Render Bus Fleet Cards by Region
   */
  function renderBusFleet() {
    const northContainer = document.getElementById('grid-north-malabar');
    const centralContainer = document.getElementById('grid-central-kerala');
    const southContainer = document.getElementById('grid-south-kerala');

    if (!northContainer || !centralContainer || !southContainer) return;

    BUS_FLEET.forEach((bus, idx) => {
      const card = document.createElement('div');
      card.className = `bus-item-card ${idx === currentBusIndex ? 'active' : ''}`;
      card.setAttribute('data-bus-id', bus.id);

      card.innerHTML = `
        <div class="bus-card-left">
          <div class="bus-avatar-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-1.38 0-2.5-1.12-2.5-2.5S6.12 12 7.5 12 10 13.12 10 14.5 8.88 17 7.5 17zm9 0c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM6 10V6h12v4H6z"/>
            </svg>
          </div>
          <div class="bus-info-wrap">
            <span class="bus-name-malayalam">${bus.name}</span>
            <span class="bus-name-english">${bus.engName} · ${bus.type}</span>
            <span class="bus-route-path">${bus.start} <span style="color:var(--primary-red)">⟶</span> ${bus.end}</span>
          </div>
        </div>
        <div class="bus-card-right">
          <span class="bus-song-count-pill">${bus.km}</span>
          <span style="font-size: 0.65rem; color: var(--accent-gold); font-weight:700;">SELECT</span>
        </div>
      `;

      card.addEventListener('click', () => {
        window.keralaBusAudio.playConductorBell('start');
        loadBusTracks(idx);
        if (ytReady && currentPlaylist.length > 0) {
          playTrack(0);
        }
        // Switch to Cabin tab to see the live player
        const cabinNavBtn = document.querySelector('.nav-tab-btn[data-tab="cabin"]');
        if (cabinNavBtn) cabinNavBtn.click();
      });

      if (bus.region === 'North Malabar') northContainer.appendChild(card);
      else if (bus.region === 'Central Kerala') centralContainer.appendChild(card);
      else southContainer.appendChild(card);
    });
  }

  /**
   * Render Track List
   */
  function renderTrackList(tracks) {
    const listContainer = document.getElementById('track-list-container');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">No songs found</div>`;
      return;
    }

    tracks.forEach((track, index) => {
      const isHearted = favorites.includes(track.id);
      const isCurrent = (index === currentTrackIndex);

      const row = document.createElement('div');
      row.className = `track-item-row ${isCurrent ? 'active' : ''}`;
      row.setAttribute('data-track-id', track.id);

      const thumb = track.thumbnail && !track.thumbnail.startsWith('data:image/gif') 
        ? track.thumbnail 
        : `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;

      row.innerHTML = `
        <div class="track-row-left">
          <img src="${thumb}" alt="${track.title}" class="track-thumb" onerror="this.src='./assets/icon.jpg'" />
          <div class="track-meta-wrap">
            <span class="track-row-title">${track.title}</span>
            <span class="track-row-artist">${track.artist || 'Kerala Private Bus Mix'}</span>
          </div>
        </div>
        <div class="track-row-right">
          <button class="btn-fav-heart ${isHearted ? 'hearted' : ''}" aria-label="Favorite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isHearted ? '#ff2a2a' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      `;

      // Click to play
      row.querySelector('.track-row-left').addEventListener('click', () => {
        playTrack(index);
      });

      // Favorite toggle
      const heartBtn = row.querySelector('.btn-fav-heart');
      heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(track.id, heartBtn);
      });

      listContainer.appendChild(row);
    });
  }

  function toggleFavorite(trackId, btnElem) {
    if (favorites.includes(trackId)) {
      favorites = favorites.filter(id => id !== trackId);
      btnElem.classList.remove('hearted');
      btnElem.querySelector('svg').setAttribute('fill', 'none');
    } else {
      favorites.push(trackId);
      btnElem.classList.add('hearted');
      btnElem.querySelector('svg').setAttribute('fill', '#ff2a2a');
      window.keralaBusAudio.haptic([40]);
    }
    localStorage.setItem('keralaBusFavs', JSON.stringify(favorites));
  }

  /**
   * Search Tracks
   */
  const searchInput = document.getElementById('search-songs-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderTrackList(currentPlaylist);
        return;
      }
      const filtered = currentPlaylist.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.artist && t.artist.toLowerCase().includes(q))
      );
      renderTrackList(filtered);
    });
  }

  /**
   * Filter Pills (All / Current Bus / Favorites)
   */
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterType = pill.getAttribute('data-filter');
      if (filterType === 'favorites') {
        const favTracks = [];
        Object.values(allSongsCatalog).forEach(bList => {
          bList.forEach(t => {
            if (favorites.includes(t.id) && !favTracks.some(f => f.id === t.id)) {
              favTracks.push(t);
            }
          });
        });
        renderTrackList(favTracks);
      } else {
        renderTrackList(currentPlaylist);
      }
    });
  });

  /**
   * Update Player UI
   */
  function updateNowPlayingUI(track) {
    if (!track) return;
    elTrackTitle.textContent = track.title || 'Unknown Track';
    elTrackArtist.textContent = track.artist || 'Kerala Private Bus Mix';

    // Media Session Integration for Lock Screen Controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Kerala Private Bus',
        album: `${BUS_FLEET[currentBusIndex].name} (${BUS_FLEET[currentBusIndex].start} ⟶ ${BUS_FLEET[currentBusIndex].end})`,
        artwork: [
          { src: './assets/icon.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextTrack());
    }

    // Highlight row in playlist
    document.querySelectorAll('.track-item-row').forEach(row => {
      row.classList.toggle('active', row.getAttribute('data-track-id') === track.id);
    });
  }

  /**
   * Setup YouTube IFrame API
   */
  function setupYouTubePlayer() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = () => {
      const initialTrackId = currentPlaylist.length > 0 ? currentPlaylist[0].id : 'T1WtAuLw1rA';
      ytPlayer = new YT.Player('yt-iframe-placeholder', {
        height: '10',
        width: '10',
        videoId: initialTrackId,
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: onYTReady,
          onStateChange: onYTStateChange
        }
      });
    };
  }

  function onYTReady(event) {
    ytReady = true;
    elPlayBtn.disabled = false;
    if (elVolumeSlider) {
      ytPlayer.setVolume(elVolumeSlider.value);
    }
  }

  function onYTStateChange(event) {
    // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      setPlayStateUI(true);
      startProgressTracking();
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      setPlayStateUI(false);
      stopProgressTracking();
    } else if (event.data === YT.PlayerState.ENDED) {
      playNextTrack();
    }
  }

  function setPlayStateUI(playing) {
    if (playing) {
      elPlayIcon.style.display = 'none';
      elPauseIcon.style.display = 'block';
      document.body.classList.add('playing');
      document.querySelectorAll('.tape-reel').forEach(r => r.classList.add('spinning'));
    } else {
      elPlayIcon.style.display = 'block';
      elPauseIcon.style.display = 'none';
      document.body.classList.remove('playing');
      document.querySelectorAll('.tape-reel').forEach(r => r.classList.remove('spinning'));
    }
  }

  function togglePlay() {
    window.keralaBusAudio.initContext();
    if (!ytReady || !ytPlayer) {
      // Toggle UI state if YT is still initializing
      isPlaying = !isPlaying;
      setPlayStateUI(isPlaying);
      return;
    }

    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }

  function playTrack(idx) {
    if (idx < 0 || idx >= currentPlaylist.length) return;
    currentTrackIndex = idx;
    const track = currentPlaylist[idx];
    updateNowPlayingUI(track);

    if (ytReady && ytPlayer && ytPlayer.loadVideoById) {
      ytPlayer.loadVideoById(track.id);
      ytPlayer.playVideo();
    }
  }

  function playNextTrack() {
    if (currentPlaylist.length === 0) return;
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      nextIdx = (currentTrackIndex + 1) % currentPlaylist.length;
    }
    playTrack(nextIdx);
  }

  function playPrevTrack() {
    if (currentPlaylist.length === 0) return;
    let prevIdx = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playTrack(prevIdx);
  }

  // Progress Bar Tracking
  function startProgressTracking() {
    stopProgressTracking();
    progressInterval = setInterval(() => {
      if (!ytPlayer || !ytPlayer.getCurrentTime || !ytPlayer.getDuration) return;
      const current = ytPlayer.getCurrentTime();
      const duration = ytPlayer.getDuration();

      if (duration > 0) {
        const pct = (current / duration) * 100;
        elProgressBarFill.style.width = `${pct}%`;
        elTimeCurrent.textContent = formatTime(current);
        elTimeTotal.textContent = formatTime(duration);
      }
    }, 500);
  }

  function stopProgressTracking() {
    if (progressInterval) clearInterval(progressInterval);
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Seek on click
  if (elProgressTrack) {
    elProgressTrack.addEventListener('click', (e) => {
      if (!ytPlayer || !ytPlayer.getDuration) return;
      const rect = elProgressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = pct * ytPlayer.getDuration();
      ytPlayer.seekTo(targetTime, true);
    });
  }

  // Playback Buttons Event Listeners
  if (elPlayBtn) elPlayBtn.addEventListener('click', togglePlay);
  if (elPrevBtn) elPrevBtn.addEventListener('click', playPrevTrack);
  if (elNextBtn) elNextBtn.addEventListener('click', playNextTrack);

  // Volume Slider
  if (elVolumeSlider) {
    elVolumeSlider.addEventListener('input', (e) => {
      const vol = e.target.value;
      if (ytReady && ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(vol);
      }
      window.keralaBusAudio.setVolume(vol / 100);
    });
  }

  // Master Mute Button
  const elMuteBtn = document.getElementById('btn-mute-toggle');
  if (elMuteBtn) {
    elMuteBtn.addEventListener('click', () => {
      const isMuted = window.keralaBusAudio.toggleMute();
      if (ytReady && ytPlayer) {
        if (isMuted) ytPlayer.mute();
        else ytPlayer.unMute();
      }
      elMuteBtn.classList.toggle('active', isMuted);
    });
  }

  // =========================================================
  // AUTHENTIC KERALA BUS SOUNDS & CONTROLS
  // =========================================================

  // Pneumatic Air Horn Button
  if (elAirHornBtn) {
    elAirHornBtn.addEventListener('click', () => {
      window.keralaBusAudio.playAirHorn();
      // Shockwave visual flash
      triggerScreenFlash('rgba(255, 42, 42, 0.25)');
    });
  }

  // Conductor Bell Cord Trigger (Hanging Pull Cord)
  if (elBellCord) {
    elBellCord.addEventListener('click', () => {
      const newState = window.keralaBusAudio.playConductorBell('toggle');
      // Brief cord pull animation
      elBellCord.style.transform = 'translateX(-50%) translateY(16px)';
      setTimeout(() => {
        elBellCord.style.transform = 'translateX(-50%) translateY(0)';
      }, 150);
      triggerScreenFlash('rgba(255, 204, 0, 0.25)');
    });
  }

  // Cockpit Bell Button
  if (elCockpitBellBtn) {
    elCockpitBellBtn.addEventListener('click', () => {
      window.keralaBusAudio.playConductorBell('toggle');
      triggerScreenFlash('rgba(255, 204, 0, 0.2)');
    });
  }

  // Engine Rev / Throttle Pedal Button
  const elEngineRevBtn = document.getElementById('btn-engine-rev');
  if (elEngineRevBtn) {
    elEngineRevBtn.addEventListener('click', () => {
      window.keralaBusAudio.playEngineRev();
      // Cabin vibration effect
      document.body.classList.add('vibrating');
      setTimeout(() => {
        document.body.classList.remove('vibrating');
      }, 1250);
    });
  }

  // Soundboard Pads
  document.querySelectorAll('.sound-pad').forEach(pad => {
    pad.addEventListener('click', () => {
      const soundType = pad.getAttribute('data-sound');
      pad.classList.add('flashing');
      setTimeout(() => pad.classList.remove('flashing'), 300);

      switch (soundType) {
        case 'air-horn':
          window.keralaBusAudio.playAirHorn();
          triggerScreenFlash('rgba(255, 42, 42, 0.3)');
          break;
        case 'musical-horn':
          window.keralaBusAudio.playMusicalAirHornTune();
          triggerScreenFlash('rgba(255, 204, 0, 0.3)');
          break;
        case 'reverse-horn':
          window.keralaBusAudio.playReverseMelodyHorn();
          break;
        case 'bell-stop':
          window.keralaBusAudio.playConductorBell('stop');
          break;
        case 'bell-start':
          window.keralaBusAudio.playConductorBell('start');
          break;
        case 'air-brake':
          window.keralaBusAudio.playAirBrakeHiss(0.4);
          break;
        case 'engine-rev':
          window.keralaBusAudio.playEngineRev();
          document.body.classList.add('vibrating');
          setTimeout(() => document.body.classList.remove('vibrating'), 1250);
          break;
      }
    });
  });

  function triggerScreenFlash(color) {
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.inset = '0';
    flash.style.zIndex = '50';
    flash.style.backgroundColor = color;
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.25s ease-out';
    elAppShell.appendChild(flash);
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    }, 50);
  }

  // =========================================================
  // MONSOON RAIN & WINDSHIELD WIPER TOGGLE
  // =========================================================
  if (elRainToggle) {
    elRainToggle.addEventListener('change', (e) => {
      const active = e.target.checked;
      window.keralaBusAudio.toggleRain(active);
      elRainOverlay.classList.toggle('active', active);
      elWiperContainer.classList.toggle('active', active);
    });
  }

  // Draw continuous raindrops on canvas
  setupRainCanvas();

  function setupRainCanvas() {
    const canvas = document.getElementById('rain-overlay');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const drops = [];

    function resize() {
      w = canvas.width = elAppShell.clientWidth;
      h = canvas.height = elAppShell.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 65; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 12 + 10,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    function animRain() {
      if (elRainOverlay.classList.contains('active')) {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(200, 230, 255, 0.45)';
        ctx.lineWidth = 1.2;

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 4, d.y + d.length);
          ctx.stroke();

          d.y += d.speed;
          d.x -= 1.5;

          if (d.y > h) {
            d.y = -20;
            d.x = Math.random() * w;
          }
        }
      }
      requestAnimationFrame(animRain);
    }
    requestAnimationFrame(animRain);
  }

  // Continuous Engine Rumble Toggle
  if (elRumbleToggle) {
    elRumbleToggle.addEventListener('change', (e) => {
      isRumbleActive = e.target.checked;
      document.body.classList.toggle('vibrating', isRumbleActive);
    });
  }

  // =========================================================
  // SLEEP TIMER
  // =========================================================
  const timerPills = document.querySelectorAll('.timer-pill-btn');
  const timerNotice = document.getElementById('timer-notice');

  timerPills.forEach(pill => {
    pill.addEventListener('click', () => {
      timerPills.forEach(p => p.classList.remove('active'));
      const mins = parseInt(pill.getAttribute('data-mins'), 10);

      if (sleepTimerInterval) clearInterval(sleepTimerInterval);

      if (mins === 0) {
        sleepTimerSecondsRemaining = 0;
        timerNotice.classList.remove('show');
        return;
      }

      pill.classList.add('active');
      sleepTimerSecondsRemaining = mins * 60;
      timerNotice.classList.add('show');
      updateTimerDisplay();

      sleepTimerInterval = setInterval(() => {
        sleepTimerSecondsRemaining--;
        if (sleepTimerSecondsRemaining <= 0) {
          clearInterval(sleepTimerInterval);
          timerNotice.classList.remove('show');
          timerPills.forEach(p => p.classList.remove('active'));
          // Fade out and pause
          if (ytReady && ytPlayer) ytPlayer.pauseVideo();
        } else {
          updateTimerDisplay();
        }
      }, 1000);
    });
  });

  function updateTimerDisplay() {
    const m = Math.floor(sleepTimerSecondsRemaining / 60);
    const s = sleepTimerSecondsRemaining % 60;
    timerNotice.textContent = `Bus stops in: ${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // =========================================================
  // NEON THEMES & AMBIENCE
  // =========================================================
  const themeSwatches = document.querySelectorAll('.theme-swatch');
  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      themeSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const theme = swatch.getAttribute('data-theme');
      if (theme === 'default') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', theme);
      }
      localStorage.setItem('keralaBusTheme', theme);
    });
  });

  // =========================================================
  // DESKTOP FRAME TOGGLE (Mobile Shell vs Full Adaptive)
  // =========================================================
  if (elFrameToggleBtn) {
    elFrameToggleBtn.addEventListener('click', () => {
      const isFramed = elAppShell.classList.toggle('device-framed');
      elAppShell.classList.toggle('full-view-mode', !isFramed);
      elFrameToggleBtn.innerHTML = isFramed 
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z"/></svg> <span>Switch to Full Website View 💻</span>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg> <span>Switch to Mobile App View 📱</span>`;
    });
  }

  // =========================================================
  // ABOUT MODAL
  // =========================================================
  const elAboutBtn = document.getElementById('btn-about-info');
  const elAboutModal = document.getElementById('about-modal');
  const elCloseAboutBtn = document.getElementById('btn-close-about');

  if (elAboutBtn && elAboutModal) {
    elAboutBtn.addEventListener('click', () => elAboutModal.classList.add('open'));
  }
  if (elCloseAboutBtn && elAboutModal) {
    elCloseAboutBtn.addEventListener('click', () => elAboutModal.classList.remove('open'));
  }

  // Keyboard Shortcuts for Laptop/Desktop users
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const key = e.key.toLowerCase();
    if (key === 'p' || key === ' ') { e.preventDefault(); togglePlay(); }
    else if (key === 'k') playNextTrack();
    else if (key === 'j') playPrevTrack();
    else if (key === 'x') window.keralaBusAudio.playAirHorn();
    else if (key === 'b') window.keralaBusAudio.playConductorBell('toggle');
    else if (key === 'n') {
      const nextBus = (currentBusIndex + 1) % BUS_FLEET.length;
      loadBusTracks(nextBus);
    }
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  }

  // PWA Add to Home Screen Prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (elPwaInstallBtn) elPwaInstallBtn.style.display = 'flex';
  });

  if (elPwaInstallBtn) {
    elPwaInstallBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          elPwaInstallBtn.style.display = 'none';
        }
        deferredPrompt = null;
      } else {
        alert('To install on iOS: Tap Share ⎙ and choose "Add to Home Screen" 📲');
      }
    });
  }
});
