// ═══════════════════════════════════════════════════════════════════
// Nexus Helper — Main-World Speech Recognition Bridge
// Runs in the page's main world to avoid extension network restrictions
// ═══════════════════════════════════════════════════════════════════
(() => {
  if (window.__nexusSpeechBridge) return;
  window.__nexusSpeechBridge = true;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  const emit = (type, data) => {
    try {
      window.postMessage({ type: 'NEXUS_SPEECH', event: type, ...data }, '*');
    } catch (e) {}
  };

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'NEXUS_SPEECH_CMD') return;

    const cmd = e.data.command;

    if (cmd === 'start') {
      if (!SpeechRecognition) {
        emit('error', { error: 'not-supported' });
        return;
      }

      // Stop any existing session
      if (recognition) {
        try { recognition.abort(); } catch (_) {}
        recognition = null;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = e.data.lang || 'en-US';

      recognition.onstart = () => emit('start', {});

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        emit('result', { final: finalTranscript, interim: interimTranscript });
      };

      recognition.onend = () => {
        emit('end', {});
        recognition = null;
      };

      recognition.onerror = (event) => {
        emit('error', { error: event.error });
        recognition = null;
      };

      try {
        recognition.start();
      } catch (err) {
        emit('error', { error: 'start-failed' });
      }
    }

    if (cmd === 'stop') {
      if (recognition) {
        try { recognition.stop(); } catch (_) {}
      }
    }
  });
})();
