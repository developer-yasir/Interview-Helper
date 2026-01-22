import { useState, useEffect, useCallback } from 'react';

const useSpeechRecognition = (onSilence) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + ' ' + transcriptPart);
                    } else {
                        currentTranscript += transcriptPart;
                    }
                }
            };

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                // Determine if we should restart (if silence hasn't killed it yet)
                // For now, simpler: just stop.
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        } else {
            console.warn('Speech Recognition API not supported in this browser.');
        }
    }, []);

    // Silence Timer
    useEffect(() => {
        let timer;
        if (isListening && transcript.trim().length > 0) {
            // Restart timer on every transcript change (speech detected)
            timer = setTimeout(() => {
                console.log("Silence detected (2s), stopping...");
                if (onSilence) onSilence(transcript);
                stopListening();
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [transcript, isListening, onSilence]);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
            } catch (error) {
                console.error("Failed to start speech recognition:", error);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasSupport: !!recognition
    };
};

export default useSpeechRecognition;
