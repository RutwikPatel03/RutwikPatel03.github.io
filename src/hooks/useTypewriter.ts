'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
}

interface UseTypewriterReturn {
  text: string;
  isDeleting: boolean;
  isWaiting: boolean;
  wordIndex: number;
}

export function useTypewriter({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
  loop = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const currentWord = words[wordIndex] || '';

  const type = useCallback(() => {
    if (isWaiting) return;

    if (!isDeleting) {
      // Typing
      if (text.length < currentWord.length) {
        setText(currentWord.slice(0, text.length + 1));
      } else {
        // Finished typing, wait before deleting
        setIsWaiting(true);
        setTimeout(() => {
          setIsWaiting(false);
          setIsDeleting(true);
        }, delayBetweenWords);
      }
    } else {
      // Deleting
      if (text.length > 0) {
        setText(currentWord.slice(0, text.length - 1));
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        const nextIndex = wordIndex + 1;
        if (nextIndex < words.length || loop) {
          setWordIndex(nextIndex % words.length);
        }
      }
    }
  }, [text, currentWord, isDeleting, isWaiting, wordIndex, words.length, loop, delayBetweenWords]);

  useEffect(() => {
    const speed = isDeleting ? deleteSpeed : typeSpeed;
    const timer = setTimeout(type, speed);
    return () => clearTimeout(timer);
  }, [type, isDeleting, typeSpeed, deleteSpeed]);

  return { text, isDeleting, isWaiting, wordIndex };
}

