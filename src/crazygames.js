(() => {
  'use strict';

  const SAVE_KEY = 'parcelpanic_profile_v2';
  let sdk = null;
  let ready = false;
  let environment = 'standalone';
  let user = null;
  let settingsListener = null;
  let gameplayActive = false;
  let lastSave = '';

  const safeCall = (fn, ...args) => {
    try {
      if (typeof fn === 'function') {
        const result = fn(...args);
        if (result && typeof result.catch === 'function') result.catch((error) => {
          console.warn('[Parcel Panic] CrazyGames SDK call failed:', error);
        });
        return result;
      }
    } catch (error) {
      console.warn('[Parcel Panic] CrazyGames SDK call failed:', error);
    }
    return undefined;
  };

  const localRead = () => {
    try {
      const current = localStorage.getItem(SAVE_KEY);
      if (current) return JSON.parse(current);
      // Import the earlier build's local profile once rather than discarding it.
      const legacy = localStorage.getItem('pp1');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return {
          xp: Number(parsed.xp) || 0,
          coins: Number(parsed.coins) || 0,
          matches: Number(parsed.matches) || 0,
          wins: Number(parsed.wins) || 0,
          deliveries: Number(parsed.del) || 0,
          bestScore: Number(parsed.best) || 0,
          stolen: 0,
          streak: parsed.dr?.streak || 0,
          settings: parsed.set || {}
        };
      }
    } catch (error) {
      console.warn('[Parcel Panic] Could not read local profile:', error);
    }
    return null;
  };

  const writeLocal = (value) => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('[Parcel Panic] Local save failed:', error);
      return false;
    }
  };

  async function init() {
    try {
      if (!window.CrazyGames || !window.CrazyGames.SDK) {
        throw new Error('CrazyGames SDK script is unavailable');
      }
      sdk = window.CrazyGames.SDK;
      await sdk.init();
      if (sdk.game && typeof sdk.game.loadingStart === 'function') safeCall(sdk.game.loadingStart.bind(sdk.game));
      environment = sdk.environment || 'disabled';
      ready = environment !== 'disabled';

      if (!ready) {
        sdk = null;
        environment = 'standalone';
        return { ready: false, environment, user: null, profile: localRead() };
      }

      try {
        const accountAvailable = await sdk.user.isUserAccountAvailable();
        if (accountAvailable) user = await sdk.user.getUser();
      } catch (error) {
        console.info('[Parcel Panic] Guest session; no account profile available.');
      }

      if (sdk.game && sdk.game.addSettingsChangeListener) {
        settingsListener = (newSettings) => {
          window.dispatchEvent(new CustomEvent('parcelpanic:sdk-settings', { detail: newSettings || {} }));
        };
        sdk.game.addSettingsChangeListener(settingsListener);
      }

      const profile = load();
      if (sdk.game && typeof sdk.game.loadingStop === 'function') safeCall(sdk.game.loadingStop.bind(sdk.game));
      return { ready: true, environment, user, profile };
    } catch (error) {
      sdk = null;
      ready = false;
      environment = 'standalone';
      console.info('[Parcel Panic] Running without CrazyGames integration:', error.message);
      return { ready: false, environment, user: null, profile: localRead() };
    }
  }

  function load() {
    if (ready && sdk && sdk.data) {
      try {
        const stored = sdk.data.getItem(SAVE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (error) {
        console.warn('[Parcel Panic] CrazyGames save could not be read:', error);
      }
      // One-time migration from the earlier local-only build into CrazyGames Data.
      const migrated = localRead();
      if (migrated) {
        save(migrated);
        return migrated;
      }
      return null;
    }
    return localRead();
  }

  function save(profile) {
    const serialized = JSON.stringify(profile);
    if (serialized === lastSave) return true;
    lastSave = serialized;
    if (ready && sdk && sdk.data) {
      try {
        sdk.data.setItem(SAVE_KEY, serialized);
        return true;
      } catch (error) {
        console.warn('[Parcel Panic] CrazyGames Data save failed; local fallback retained:', error);
      }
    }
    writeLocal(profile);
    return true;
  }

  function startGameplay() {
    if (!ready || !sdk || !sdk.game || gameplayActive) return;
    safeCall(sdk.game.gameplayStart.bind(sdk.game));
    gameplayActive = true;
  }

  function stopGameplay() {
    if (!ready || !sdk || !sdk.game || !gameplayActive) return;
    safeCall(sdk.game.gameplayStop.bind(sdk.game));
    gameplayActive = false;
  }

  function happyTime() {
    if (!ready || !sdk || !sdk.game) return;
    safeCall(sdk.game.happytime.bind(sdk.game));
  }

  function requestRewardedAd({ onPause = () => {}, onResume = () => {}, onReward = () => {}, onError = () => {} } = {}) {
    if (!ready || !sdk || !sdk.ad) {
      onError(new Error('Rewarded ads are not available in this environment.'));
      return false;
    }
    let started = false;
    try {
      sdk.ad.requestAd('rewarded', {
        adStarted: () => {
          started = true;
          stopGameplay();
          onPause();
        },
        adError: (error) => {
          if (started) onResume();
          onError(error || new Error('The rewarded advert could not be completed.'));
        },
        adFinished: () => {
          if (started) onResume();
          onReward();
        }
      });
      return true;
    } catch (error) {
      if (started) onResume();
      onError(error);
      return false;
    }
  }

  function setMute(muted) {
    if (!ready || !sdk || !sdk.game || !sdk.game.settings) return !!muted;
    return !!(sdk.game.settings.muteAudio || muted);
  }

  function getUser() {
    return user;
  }

  function getEnvironment() {
    return environment;
  }

  function isReady() {
    return ready;
  }

  window.CrazyIntegration = {
    init,
    load,
    save,
    startGameplay,
    stopGameplay,
    happyTime,
    requestRewardedAd,
    setMute,
    getUser,
    getEnvironment,
    isReady
  };
})();