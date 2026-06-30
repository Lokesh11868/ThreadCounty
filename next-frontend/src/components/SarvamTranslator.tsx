"use client";

import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Ignore these elements when traversing
const IGNORE_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);

export default function SarvamTranslator() {
  const { language } = useLanguage();
  const observerRef = useRef<MutationObserver | null>(null);
  const isTranslatingRef = useRef(false);

  useEffect(() => {
    // If language is English (default), we don't need to do DOM translation
    if (language === 'en') {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    sessionStorage.setItem('tc_translated', 'true');

    const cacheKey = `sarvam_cache_v2_${language}`;
    let dictionary: Record<string, string> = {};
    try {
      dictionary = JSON.parse(localStorage.getItem(cacheKey) || "{}");
    } catch (e) {}

    const saveCache = () => {
      localStorage.setItem(cacheKey, JSON.stringify(dictionary));
    };

    const pendingTranslations = new Set<string>();
    let translationTimeout: NodeJS.Timeout | null = null;

    const performTranslation = async () => {
      if (pendingTranslations.size === 0) return;
      isTranslatingRef.current = true;

      const textsToTranslate = Array.from(pendingTranslations);
      pendingTranslations.clear();

      // Batching strategy: Join by " ||| "
      // We must be careful not to exceed Sarvam's ~2000 character limit per request.
      const batches: string[] = [];
      let currentBatch = "";
      let hasErrors = false;
      
      for (const text of textsToTranslate) {
        if (currentBatch.length + text.length + 5 > 1800) {
          batches.push(currentBatch);
          currentBatch = text;
        } else {
          currentBatch = currentBatch ? `${currentBatch} ||| ${text}` : text;
        }
      }
      if (currentBatch) batches.push(currentBatch);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: batch, targetLang: language })
          });
          const originalParts = batch.split('|||').map(s => s.trim());
          if (res.ok) {
            const data = await res.json();
            if (data.translated_text) {
              const translatedParts = data.translated_text.split('|||').map((s: string) => s.trim());
              
              originalParts.forEach((orig, idx) => {
                dictionary[orig] = translatedParts[idx] || orig;
              });
            } else {
              originalParts.forEach(orig => { dictionary[orig] = orig; });
            }
          } else {
            // API failed, fallback to original temporarily
            hasErrors = true;
            originalParts.forEach(orig => { dictionary[orig] = orig; });
            
            // If the server rejects the request (e.g. missing API key), don't try the remaining batches
            for (let j = i + 1; j < batches.length; j++) {
               const remainingParts = batches[j].split('|||').map(s => s.trim());
               remainingParts.forEach(orig => { dictionary[orig] = orig; });
            }
            break;
          }
        } catch (error) {
          console.error("Translation batch failed", error);
          hasErrors = true;
          const originalParts = batch.split('|||').map(s => s.trim());
          originalParts.forEach(orig => { dictionary[orig] = orig; });
          
          // Break on network error too
          for (let j = i + 1; j < batches.length; j++) {
             const remainingParts = batches[j].split('|||').map(s => s.trim());
             remainingParts.forEach(orig => { dictionary[orig] = orig; });
          }
          break;
        }
      }
      
      if (!hasErrors) {
        saveCache();
      }

      // After fetching new translations, walk DOM again to apply them
      isTranslatingRef.current = false;
      walkAndTranslate(document.body);
    };

    const processTextNode = (node: Node) => {
      const text = node.textContent?.trim();
      if (!text || text.length === 0 || !isNaN(Number(text))) return; // Skip empty or pure numbers
      
      // If we already translated this specific node's content, skip
      if ((node as any)._originalText === undefined) {
        (node as any)._originalText = text;
      }
      
      const original = (node as any)._originalText;
      
      if (dictionary[original]) {
        // We have a translation!
        if (node.textContent !== dictionary[original]) {
          node.textContent = dictionary[original];
        }
      } else {
        // Need to translate
        pendingTranslations.add(original);
        if (translationTimeout) clearTimeout(translationTimeout);
        translationTimeout = setTimeout(performTranslation, 500);
      }
    };

    const walkAndTranslate = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node) {
          let el = node.parentElement;
          while (el) {
            if (IGNORE_TAGS.has(el.tagName) || el.hasAttribute('data-no-translate')) {
              return NodeFilter.FILTER_REJECT;
            }
            el = el.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let node;
      while ((node = walker.nextNode())) {
        processTextNode(node);
      }
    };

    // Initial pass
    walkAndTranslate(document.body);

    // Observe future changes
    observerRef.current = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              if (node.parentElement && !IGNORE_TAGS.has(node.parentElement.tagName)) {
                processTextNode(node);
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              if (!IGNORE_TAGS.has((node as Element).tagName)) {
                walkAndTranslate(node);
              }
            }
          });
        } else if (mutation.type === 'characterData') {
          if (mutation.target.parentElement && !IGNORE_TAGS.has(mutation.target.parentElement.tagName)) {
             // Avoid infinite loops if we just set the translation
             const original = (mutation.target as any)._originalText;
             if (original && dictionary[original] === mutation.target.textContent) return;
             processTextNode(mutation.target);
          }
        }
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (translationTimeout) clearTimeout(translationTimeout);
    };

  }, [language]);

  return null;
}
