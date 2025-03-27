'use client';

import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

const commands = [
  'Initializing JITC systems...',
  'Loading core modules...',
  'Establishing secure connection...',
  'Mounting resources...',
  'Starting Josephite IT Club services...',
  'System ready.',
];

const ascii = `
     ╔═══════════════════════════════════╗
     ║             J I T C                ║
     ║    Josephite IT Club              ║
     ║    > Innovation Through Code      ║
     ╚═══════════════════════════════════╝
`;

interface TerminalLoaderProps {
  onLoadingComplete?: () => void;
}

export function TerminalLoader({ onLoadingComplete }: TerminalLoaderProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentLine >= commands.length) {
      // All commands finished typing, notify parent
      if (onLoadingComplete) {
        setTimeout(() => {
          onLoadingComplete();
        }, 1000); // Delay a bit after showing "System ready"
      }
      return;
    }

    let currentCommand = commands[currentLine];
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= currentCommand.length) {
        setCurrentText(currentCommand.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
          setCurrentText('');
        }, 500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentLine, onLoadingComplete]);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-6 h-6" />
          <span className="text-xl">JITC Terminal</span>
        </div>
        
        <pre className="text-green-400 mb-8 whitespace-pre text-center">
          {ascii}
        </pre>

        <div className="space-y-2 w-full flex flex-col items-center">
          {commands.slice(0, currentLine).map((cmd, index) => (
            <div key={index} className="flex items-center justify-center w-full">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">$</span>
                <span>{cmd}</span>
              </div>
            </div>
          ))}
          
          {currentLine < commands.length && (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">$</span>
                <span>
                  {currentText}
                  {showCursor && (
                    <span className="inline-block w-3 h-5 bg-green-500 ml-1"></span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {currentLine >= commands.length && (
          <div className="mt-8 text-center animate-pulse">
            <p className="text-xl">Welcome to JITC</p>
          </div>
        )}
      </div>
    </div>
  );
}