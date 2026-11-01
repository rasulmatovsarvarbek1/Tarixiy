import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import {
  getProgress,
  saveProgress,
  getSaved,
  addSaved,
  removeSaved,
  getSettings,
  saveSettings,
} from '../lib/readerStorage';
import { normalizeLessonText } from '../lib/lessonText';
import { useLanguage } from '../lib/language';
import { qoshFaollik } from '../lib/faollik';

/* ═══════════════════════════════════════ CONSTANTS ═══════════════════════════════════════ */

const PAD_X = 24;
const PAD_TOP = 68;
const PAD_BOTTOM = 92;
const SAFETY = 2;

const ORANGE = '#E8650A';
const YELLOW = '#F2A100';
const SLIDER_ORANGE = '#FF9442';
const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const FONT_SIZES = [15, 16.5, 18, 20, 22.5];

const FONTS = [
  { name: 'Noto Serif', family: '"Noto Serif", Georgia, serif', type: 'serif' },
  { name: 'Lora', family: '"Lora", Georgia, serif', type: 'serif' },
  { name: 'Merriweather', family: '"Merriweather", Georgia, serif', type: 'serif' },
  { name: 'Georgia', family: 'Georgia, "Times New Roman", serif', type: 'serif' },
  { name: 'Inter', family: '"Inter", system-ui, sans-serif', type: 'sans-serif' },
];

const BG_THEMES = [
  { id: 'white', bg: '#FFFFFF', text: '#000000', label: 'Oq' },
  { id: 'cream', bg: '#F4ECD8', text: '#3B2F20', label: 'Krem' },
  { id: 'gray', bg: '#4A4A4A', text: '#E8E8E8', label: 'Kulrang' },
  { id: 'black', bg: '#121212', text: '#D6D6D6', label: 'Qora' },
];

/* ═══════════════════════════════════════ HELPERS ═══════════════════════════════════════ */

function normalizeContent(content) {
  const normalized = normalizeLessonText(content);
  return normalized ? normalized.split(/\n\n+/) : [];
}

const IMAGE_MARKER_LINE_PATTERN = /^\[rasm(\d+)\]$/i;

function getImageSize(block) {
  return ['kichik', 'orta', 'katta'].includes(block.olcham) ? block.olcham : 'kichik';
}

function getImageKey(block, imageIndex) {
  const key = block.kalit ?? imageIndex;
  return String(key).trim();
}

function createImageGroup(imageBlocks, imagesStatus, includeEmptyAnchors = false) {
  const entries = imageBlocks.map(({ block, key }) => {
    const url = typeof block.url === 'string' ? block.url.trim() : '';
    return {
      key,
      url,
      izoh: block.izoh ? String(block.izoh).trim() : '',
      olcham: getImageSize(block),
      joy: ['yuqori', 'orta', 'past'].includes(block.joy || block.joylashuv)
        ? (block.joy || block.joylashuv)
        : 'yuqori',
    };
  });
  const images = entries.filter((image) => image.url && !imagesStatus[image.url]?.error);
  if (!images.length && !includeEmptyAnchors) return null;
  return {
    type: 'imageGroup',
    keys: entries.map((entry) => entry.key),
    images,
    joy: entries[0]?.joy || 'yuqori',
  };
}

/** Dars ma'lumotlarini ankerli rasm va matn paragraflariga ajratish */
function prepareLessonData(lesson, imagesStatus = {}, includeEmptyAnchors = false) {
  let blocks = lesson?.bloklar;
  if (!Array.isArray(blocks)) {
    blocks = lesson?.content ? [{ tur: 'matn', qiymat: lesson.content }] : [];
  }

  const imageBlocks = new Map();
  const imageKeysByBlock = new Map();
  let imageIndex = 0;
  blocks.forEach((block) => {
    if (block.tur !== 'rasm') return;
    imageIndex += 1;
    const key = getImageKey(block, imageIndex);
    imageKeysByBlock.set(block, key);
    if (!imageBlocks.has(key)) imageBlocks.set(key, { block, key });
  });

  const anchoredKeys = new Set();
  const textBlocks = new Map();
  blocks.forEach((block, blockIndex) => {
    if (block.tur !== 'matn') return;
    const paragraphs = normalizeContent(block.qiymat).map((paragraph) => {
      const marker = paragraph.match(IMAGE_MARKER_LINE_PATTERN);
      if (marker) anchoredKeys.add(String(Number(marker[1])));
      return marker
        ? { marker: String(Number(marker[1])) }
        : { paragraph };
    });
    textBlocks.set(blockIndex, paragraphs);
  });

  const units = [];
  let globalWordIndex = 0;
  let paraCounter = 0;
  const usedKeys = new Set();

  const addTextParagraph = (paragraph) => {
    const segments = paragraph.match(/\*\*[^*]+\*\*|\*[^*]+\*|[^*]+/g) || [paragraph];
    let wordInPara = 0;
    const words = segments.flatMap((segment) => {
      const bold = segment.startsWith('**') && segment.endsWith('**');
      const italic = !bold && segment.startsWith('*') && segment.endsWith('*');
      const content = bold ? segment.slice(2, -2) : italic ? segment.slice(1, -1) : segment;
      return content.split(/\s+/).filter(Boolean).map((word) => ({
        word,
        bold,
        italic,
        paraIndex: paraCounter,
        wordInPara: wordInPara++,
        globalWordIndex: globalWordIndex++,
      }));
    });
    if (words.length) {
      units.push({ type: 'paragraph', paraIndex: paraCounter, words });
      paraCounter += 1;
    }
  };

  blocks.forEach((block, blockIndex) => {
    if (block.tur === 'rasm') {
      const key = imageKeysByBlock.get(block);
      if (anchoredKeys.has(key)) return;
      const group = createImageGroup([{ block, key }], imagesStatus, includeEmptyAnchors);
      if (group) units.push(group);
      return;
    }
    if (block.tur !== 'matn') return;

    const paragraphs = textBlocks.get(blockIndex) || [];
    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length;) {
      const current = paragraphs[paragraphIndex];
      if (current.paragraph) {
        addTextParagraph(current.paragraph);
        paragraphIndex += 1;
        continue;
      }

      const consecutiveMarkers = [];
      while (paragraphIndex < paragraphs.length && paragraphs[paragraphIndex].marker) {
        consecutiveMarkers.push(paragraphs[paragraphIndex].marker);
        paragraphIndex += 1;
      }
      const anchoredImages = consecutiveMarkers
        .filter((key) => {
          if (usedKeys.has(key) || !imageBlocks.has(key)) return false;
          usedKeys.add(key);
          return true;
        })
        .map((key) => imageBlocks.get(key));
      for (let index = 0; index < anchoredImages.length; index += 3) {
        const group = createImageGroup(
          anchoredImages.slice(index, index + 3),
          imagesStatus,
          includeEmptyAnchors,
        );
        if (group) units.push(group);
      }
    }
  });

  return { lesson, units, totalWords: globalWordIndex };
}

function orderPageElements(elements) {
  const top = [];
  const flowing = [];
  const bottom = [];
  elements.forEach((element) => {
    if (element.type === 'imageGroup' && element.joy === 'yuqori') top.push(element);
    else if (element.type === 'imageGroup' && element.joy === 'past') bottom.push(element);
    else flowing.push(element);
  });
  return [...top, ...flowing, ...bottom];
}

/** Sahifalash: yashirin o'lchov elementi yordamida matn va rasmlarni sahifalarga bo'lish */
function paginateLessonUnits(lessonData, box, maxH, maxW, imagesStatus = {}) {
  const { units } = lessonData;
  if (!units?.length) return [];

  const pageH = maxH + PAD_TOP + PAD_BOTTOM + SAFETY;
  const maxImageHeight = (size) => {
    const ratio = size === 'katta' ? 0.4 : size === 'orta' ? 0.28 : 0.18;
    return Math.max(1, Math.min(Math.floor(pageH * ratio), maxH - 40));
  };

  const createMeasureImageElement = (group) => {
    const wrap = document.createElement('div');
    wrap.style.width = '100%';
    wrap.style.margin = '8px 0';
    wrap.style.display = 'flex';
    wrap.style.justifyContent = 'center';
    wrap.style.alignItems = 'flex-start';
    wrap.style.gap = group.images.length > 1 ? '8px' : '0';
    wrap.style.boxSizing = 'border-box';

    group.images.forEach((image) => {
      const status = imagesStatus[image.url];
      let renderedH = image.maxImgH;
      const imageWidth = maxW / group.images.length;
      if (status?.width && status?.height) {
        renderedH = Math.min(image.maxImgH, Math.round(imageWidth * (status.height / status.width)));
      }

      const item = document.createElement('div');
      item.style.flex = '1 1 0';
      item.style.minWidth = '0';
      item.style.textAlign = 'center';
      const img = document.createElement('div');
      img.style.width = '100%';
      img.style.height = `${renderedH}px`;
      item.appendChild(img);

      if (image.izoh) {
        const caption = document.createElement('div');
        caption.style.fontSize = '12px';
        caption.style.lineHeight = '1.3';
        caption.style.marginTop = '2px';
        caption.textContent = image.izoh;
        item.appendChild(caption);
      }
      wrap.appendChild(item);
    });
    return wrap;
  };

  const createMeasureParagraphElement = (words, cont) => {
    const paragraph = document.createElement('p');
    paragraph.style.margin = '0 0 4px';
    paragraph.style.textIndent = cont ? '0' : '1.5em';
    words.forEach((word, index) => {
      if (index > 0) paragraph.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.textContent = word.word;
      if (word.bold) span.style.fontWeight = '700';
      if (word.italic) span.style.fontStyle = 'italic';
      paragraph.appendChild(span);
    });
    return paragraph;
  };

  const testFit = (elements) => {
    box.textContent = '';
    orderPageElements(elements).forEach((element) => {
      if (element.type === 'imageGroup') {
        if (!element.images.length) return;
        box.appendChild(createMeasureImageElement(element));
      } else if (element.type === 'paragraph') {
        box.appendChild(createMeasureParagraphElement(element.words, element.cont));
      }
    });
    return box.offsetHeight <= maxH;
  };

  const finalizePage = (elements) => {
    let startWord = 0;
    let wordCount = 0;
    let foundWord = false;
    for (const element of elements) {
      if (element.type === 'paragraph' && element.words.length > 0) {
        if (!foundWord) {
          startWord = element.words[0].globalWordIndex;
          foundWord = true;
        }
        wordCount += element.words.length;
      }
    }
    return { elements: orderPageElements(elements), startWord, wordCount };
  };

  const pages = [];
  let currentPage = [];
  const finishCurrentPage = () => {
    if (currentPage.length) pages.push(finalizePage(currentPage));
    currentPage = [];
  };

  for (const unit of units) {
    if (unit.type === 'imageGroup') {
      const imageGroup = {
        ...unit,
        images: unit.images.map((image) => ({
          ...image,
          maxImgH: maxImageHeight(image.olcham),
        })),
      };
      if (imageGroup.images.length && !testFit([...currentPage, imageGroup]) && currentPage.length) {
        finishCurrentPage();
      }
      currentPage.push(imageGroup);
      continue;
    }

    let wordPointer = 0;
    while (wordPointer < unit.words.length) {
      const remainingWords = unit.words.slice(wordPointer);
      const cont = unit.cont || wordPointer > 0;
      const fitsWords = (count) => testFit([
        ...currentPage,
        { ...unit, cont, words: remainingWords.slice(0, count) },
      ]);

      if (!fitsWords(1)) {
        if (currentPage.length) {
          finishCurrentPage();
          continue;
        }
        currentPage.push({ ...unit, cont, words: [remainingWords[0]] });
        wordPointer += 1;
        continue;
      }

      let fittingCount = remainingWords.length;
      if (!fitsWords(fittingCount)) {
        let low = 1;
        let high = fittingCount;
        while (low < high) {
          const middle = Math.ceil((low + high) / 2);
          if (fitsWords(middle)) low = middle;
          else high = middle - 1;
        }
        fittingCount = low;
      }

      currentPage.push({ ...unit, cont, words: remainingWords.slice(0, fittingCount) });
      wordPointer += fittingCount;
      if (wordPointer < unit.words.length) finishCurrentPage();
    }
  }

  finishCurrentPage();
  box.textContent = '';
  return pages;
}

export function getImagePageNumbers(lesson, imagesStatus = {}) {
  if (typeof document === 'undefined') return {};
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    visibility: 'hidden',
    pointerEvents: 'none',
    boxSizing: 'content-box',
    width: '342px',
    display: 'flow-root',
    fontFamily: FONTS[0].family,
    fontSize: '18px',
    lineHeight: '1.4',
    textAlign: 'justify',
    textRendering: 'optimizeLegibility',
    hyphens: 'auto',
    WebkitHyphens: 'auto',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
  });
  document.body.appendChild(box);
  try {
    const pages = paginateLessonUnits(
      prepareLessonData(lesson, imagesStatus, true),
      box,
      844 - PAD_TOP - PAD_BOTTOM - SAFETY,
      390 - PAD_X * 2,
      imagesStatus,
    );
    const pageNumbers = {};
    pages.forEach((page, pageIndex) => {
      page.elements.forEach((element) => {
        if (element.type === 'imageGroup') {
          element.keys.forEach((key) => { pageNumbers[key] = pageIndex + 1; });
        }
      });
    });
    return pageNumbers;
  } finally {
    box.remove();
  }
}

/** O'ziga xos id yaratish */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ═══════════════════════════════════════ COVER ═══════════════════════════════════════ */

function LessonCover({ lesson, theme }) {
  const sarlavha = lesson?.sarlavha || lesson?.title || '';
  const muqovaSarlavha = lesson?.muqova?.sarlavha || sarlavha;
  const sarlavhaQismlari = muqovaSarlavha.split(/(\*[^*]+\*)/g);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: theme.bg }}>
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, top: '26%',
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 800,
          color: theme.text,
        }}
      >
        <div style={{ fontSize: 'clamp(34px, 11vw, 48px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {sarlavhaQismlari.map((part, index) => part.startsWith('*') && part.endsWith('*')
            ? <span key={index} style={{ color: ORANGE }}>{part.slice(1, -1)}</span>
            : <span key={index}>{part}</span>)}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 84,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 15,
          color: theme.text,
        }}
      >
        Tarix <span style={{ color: YELLOW }}>iy</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ SETTINGS POPOVER ═══════════════════════════════════════ */

function SettingsPopover({ settings, onChange, theme, onClose }) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const [fontListOpen, setFontListOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        !e.target.closest('[data-settings-btn]')
      ) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [onClose]);

  const fsIdx = FONT_SIZES.indexOf(settings.fontSize);

  return (
    <div
      ref={ref}
      data-settings-popover
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 8,
        width: 285,
        background: theme.bg,
        color: theme.text,
        border: `1px solid ${theme.text}22`,
        boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
        borderRadius: 18,
        padding: 16,
        zIndex: 1000002,
        fontFamily: SANS,
        fontSize: 14,
        animation: 'readerPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'top right',
      }}
    >
      {/* a) Yorug'lik */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sun size={14} strokeWidth={2} />
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={settings.brightness}
            onChange={(e) => onChange({ ...settings, brightness: parseFloat(e.target.value) })}
            style={{ flex: 1, accentColor: SLIDER_ORANGE }}
          />
          <Sun size={20} strokeWidth={2} />
        </div>
      </div>

      {/* b) Matn o'lchami */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button
          type="button"
          disabled={fsIdx <= 0}
          onClick={() => onChange({ ...settings, fontSize: FONT_SIZES[fsIdx - 1] })}
          style={{
            background: 'none', border: `1px solid ${theme.text}44`, borderRadius: 8,
            width: 44, height: 40, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            color: fsIdx <= 0 ? `${theme.text}33` : theme.text,
          }}
        >A</button>
        <span style={{ fontSize: 13, opacity: 0.6 }}>{settings.fontSize}px</span>
        <button
          type="button"
          disabled={fsIdx >= FONT_SIZES.length - 1}
          onClick={() => onChange({ ...settings, fontSize: FONT_SIZES[fsIdx + 1] })}
          style={{
            background: 'none', border: `1px solid ${theme.text}44`, borderRadius: 8,
            width: 44, height: 40, fontSize: 20, fontWeight: 700, cursor: 'pointer',
            color: fsIdx >= FONT_SIZES.length - 1 ? `${theme.text}33` : theme.text,
          }}
        >A</button>
      </div>

      {/* c) Shrift */}
      <div style={{ marginBottom: 18 }}>
        <div
          onClick={() => setFontListOpen(!fontListOpen)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', padding: '6px 0',
          }}
        >
          <span style={{ fontWeight: 600 }}>{t('Shrift')}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7 }}>
            {settings.fontFamily}
            <ChevronDown size={16} style={{ transform: fontListOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </span>
        </div>
        {fontListOpen && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FONTS.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => { onChange({ ...settings, fontFamily: f.name }); setFontListOpen(false); }}
                style={{
                  background: settings.fontFamily === f.name ? `${SLIDER_ORANGE}22` : 'transparent',
                  border: 'none', textAlign: 'left', padding: '7px 10px', borderRadius: 8,
                  fontFamily: f.family, fontSize: 15, cursor: 'pointer', color: theme.text,
                  fontWeight: settings.fontFamily === f.name ? 700 : 400,
                }}
              >
                {f.name}{f.type === 'sans-serif' ? ' (sans)' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* d) Fon rangi */}
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'center', gap: 12 }}>
        {BG_THEMES.map((themeOption) => (
          <button
            key={themeOption.id}
            type="button"
            onClick={() => onChange({ ...settings, bgTheme: themeOption.id, autoTheme: false })}
            aria-label={t(themeOption.label)}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: themeOption.bg,
              border: settings.bgTheme === themeOption.id ? `3px solid ${SLIDER_ORANGE}` : `2px solid ${theme.text}33`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: themeOption.text,
            }}
          >
            {settings.bgTheme === themeOption.id ? '✓' : ''}
          </button>
        ))}
      </div>

      {/* e) Avto */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13 }}>{t('Telefon rejimiga moslash')}</span>
        <button
          type="button"
          onClick={() => onChange({ ...settings, autoTheme: !settings.autoTheme })}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: settings.autoTheme ? SLIDER_ORANGE : `${theme.text}33`,
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3,
            left: settings.autoTheme ? 23 : 3,
            transition: 'left 0.2s',
          }} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ SAVED SHEET ═══════════════════════════════════════ */

function SavedSheet({ levelId, lessons, theme, onClose, onNavigate }) {
  const { language, t } = useLanguage();
  const items = getSaved(levelId);

  const handleDelete = (id) => {
    removeSaved(levelId, id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430, maxHeight: '65vh',
          background: theme.bg, color: theme.text,
          borderRadius: '20px 20px 0 0',
          padding: '16px 16px 24px', overflowY: 'auto',
          fontFamily: SANS,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{t('Saqlanganlar')}</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text }}>
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ fontSize: 14, opacity: 0.6, textAlign: 'center', lineHeight: 1.6, padding: '20px 0' }}>
            {t('Hali hech narsa saqlanmagan. Matnni uzoq bosib tanlang va «Saqlash» ni bosing.')}
          </p>
        ) : (
          items.map((item) => {
            const lessonTitle = lessons[item.lessonIndex]?.sarlavha || lessons[item.lessonIndex]?.title || '';
            return (
              <div
                key={item.id}
                style={{
                  padding: '10px 0', borderBottom: `1px solid ${theme.text}15`,
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}
              >
                <div
                  style={{ flex: 1, cursor: 'pointer' }}
                  onClick={() => { onNavigate(item.lessonIndex, item.startWord); onClose(); }}
                >
                  <div style={{
                    fontSize: 14, lineHeight: 1.5,
                    background: '#FFE06699', borderRadius: 4, padding: '2px 4px',
                    display: 'inline',
                  }}>
                    {item.text.length > 80 ? item.text.slice(0, 80) + '…' : item.text}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
                    {lessonTitle} · {new Date(item.createdAt).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text, opacity: 0.4, padding: 4 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ PROGRESS SLIDER ═══════════════════════════════════════ */

function ProgressSlider({ screenIndex, totalScreens, lessonCoverIndices = [], theme, onSeek }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const ratio = totalScreens > 1 ? screenIndex / (totalScreens - 1) : 0;

  const getIndexFromPos = (clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (totalScreens - 1));
  };

  const onPointerDown = (e) => {
    if (!trackRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    trackRef.current.setPointerCapture(e.pointerId);
    onSeek(getIndexFromPos(e.clientX));
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    e.stopPropagation();
    onSeek(getIndexFromPos(e.clientX));
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    setDragging(false);
  };

  const onPointerCancel = (e) => {
    e.stopPropagation();
    setDragging(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        padding: '0 4px',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{
          flex: 1,
          height: 28,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 3,
            borderRadius: 1.5,
            background: `${theme.text}26`,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 3,
            borderRadius: 1.5,
            width: `${ratio * 100}%`,
            background: SLIDER_ORANGE,
          }}
        />

        {lessonCoverIndices.map((ci) => {
          const dotRatio = totalScreens > 1 ? ci / (totalScreens - 1) : 0;
          const isPast = screenIndex >= ci;
          return (
            <div
              key={ci}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(ci);
              }}
              style={{
                position: 'absolute',
                left: `${dotRatio * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: isPast ? SLIDER_ORANGE : `${theme.text}44`,
                  transition: 'background 0.15s ease',
                }}
              />
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: `${ratio * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: SLIDER_ORANGE,
            zIndex: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ SAVE SELECTION BUTTON ═══════════════════════════════════════ */

function SaveButton({ position, onSave }) {
  const { t } = useLanguage();
  if (!position) return null;
  return (
    <button
      type="button"
      onClick={onSave}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y - 36,
        zIndex: 150,
        background: SLIDER_ORANGE,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '5px 14px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: SANS,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {t('Saqlash')}
    </button>
  );
}

/* ═══════════════════════════════════════ ERROR BOUNDARY ═══════════════════════════════════════ */

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: SANS,
          fontSize: 16, color: '#333', zIndex: 999999,
        }}>
          Xatolik yuz berdi
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════ MAIN: BookReader ═══════════════════════════════════════ */

export default function BookReader({ level, lessons, onClose, onFinish, ...props }) {
  return (
    <ErrorBoundary>
      <BookReaderInner
        level={level}
        lessons={lessons}
        onClose={onClose}
        onFinish={onFinish}
        {...props}
      />
    </ErrorBoundary>
  );
}

function BookReaderInner({ level, lessons, onClose, onFinish, ...props }) {
  const { language, t } = useLanguage();
  const areaRef = useRef(null);
  const measureRef = useRef(null);
  const rafRef = useRef(0);
  const touchRef = useRef(null);
  const debounceRef = useRef(null);
  const lastTouchTimeRef = useRef(0);
  const lastReadingInteractionRef = useRef(0);
  const pendingReadingSecondsRef = useRef(0);
  const readingFlushInFlightRef = useRef(false);
  const readingFlushRequestedRef = useRef(false);
  const readingFlushCallbackRef = useRef(null);
  const retryReadingFlushAtRef = useRef(0);

  useEffect(() => {
    lastReadingInteractionRef.current = Date.now();
  }, []);

  // ─── Settings ───
  const [settings, setSettings] = useState(() => getSettings());
  const theme = useMemo(() => BG_THEMES.find((t) => t.id === settings.bgTheme) || BG_THEMES[0], [settings.bgTheme]);
  const fontObj = useMemo(() => FONTS.find((f) => f.name === settings.fontFamily) || FONTS[0], [settings.fontFamily]);

  // ─── Darslar ro'yxatini aniqlash (umumiy shablon) ───
  const darslar = useMemo(() => {
    if (level && Array.isArray(level.darslar)) return level.darslar;
    if (Array.isArray(lessons)) return lessons;
    if (props.lesson) {
      return [{
        id: props.lesson.id || '1',
        fan: props.lesson.type || props.lesson.fan || 'jahon',
        sarlavha: props.lesson.title || props.lesson.sarlavha || 'Dars',
        bloklar: [{ tur: 'matn', qiymat: props.content || '' }],
      }];
    }
    return [];
  }, [level, lessons, props.lesson, props.content]);

  const levelId = level?.id || 1;

  // ─── Rasmlarni oldindan yuklash va holatini kuzatish ───
  const [imagesStatus, setImagesStatus] = useState({});

  useEffect(() => {
    const urls = [];
    darslar.forEach((d) => {
      (d.bloklar || []).forEach((b) => {
        if (b.tur === 'rasm' && b.url && typeof b.url === 'string' && b.url.trim()) {
          urls.push(b.url.trim());
        }
      });
    });

    if (urls.length === 0) return;

    let isMounted = true;
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (!isMounted) return;
        setImagesStatus((prev) => ({
          ...prev,
          [url]: { loaded: true, error: false, width: img.naturalWidth, height: img.naturalHeight },
        }));
      };
      img.onerror = () => {
        if (!isMounted) return;
        setImagesStatus((prev) => ({
          ...prev,
          [url]: { loaded: false, error: true },
        }));
      };
    });

    return () => {
      isMounted = false;
    };
  }, [darslar]);

  // ─── Data prep: har bir darsni unitlarga ajratish ───
  const lessonsData = useMemo(() => {
    return darslar.map((lesson) => prepareLessonData(lesson));
  }, [darslar]);

  // ─── EKRANLAR: har darsda [muqova + sahifalar] ───
  // screens = [ { type: 'cover', lessonIndex } | { type: 'text', lessonIndex, page } ]
  const [screens, setScreens] = useState([]);
  const [screenIndex, setScreenIndex] = useState(0);

  // Panel ko'rinishi
  const [panelVisible, setPanelVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveBtn, setSaveBtn] = useState(null); // { x, y } or null

  // Saved items uchun qayta-render trigger
  const [savedTrigger, setSavedTrigger] = useState(0);

  // ─── Saqlanganlar (highlights) ───
  const allSaved = useMemo(() => getSaved(levelId), [levelId, savedTrigger]);

  // ─── textStyle (settings ga bog'liq) ───
  const textStyle = useMemo(() => ({
    fontFamily: fontObj.family,
    fontSize: settings.fontSize,
    lineHeight: 1.4,
    color: theme.text,
    textAlign: 'justify',
    textRendering: 'optimizeLegibility',
    hyphens: 'auto',
    WebkitHyphens: 'auto',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    margin: 0,
    padding: 0,
  }), [fontObj.family, settings.fontSize, theme.text]);

  // ─── Sahifalarni hisoblash ───
  const compute = useCallback(() => {
    const area = areaRef.current;
    const box = measureRef.current;
    if (!area || !box) return;

    const w = area.clientWidth;
    const h = area.clientHeight;
    if (!w || !h) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => compute());
      return;
    }

    // O'lchov elementiga shrift va o'lcham berish
    Object.assign(box.style, {
      fontFamily: fontObj.family,
      fontSize: settings.fontSize + 'px',
      lineHeight: '1.4',
      textAlign: 'justify',
      textRendering: 'optimizeLegibility',
      hyphens: 'auto',
      WebkitHyphens: 'auto',
      overflowWrap: 'break-word',
      wordBreak: 'normal',
      width: `${w - PAD_X * 2}px`,
      display: 'flow-root',
    });

    const maxH = h - PAD_TOP - PAD_BOTTOM - SAFETY;
    const maxW = w - PAD_X * 2;

    const newScreens = [];
    lessonsData.forEach((ld, li) => {
      // 3. MUQOVA SAHIFASI (har dars boshida)
      newScreens.push({ type: 'cover', lessonIndex: li });

      // 4 & 5. MATN VA RASM SAHIFALARI
      const pages = paginateLessonUnits(ld, box, maxH, maxW, imagesStatus);
      pages.forEach((p) => newScreens.push({ type: 'text', lessonIndex: li, page: p }));
    });
    // 6. Level oxirgi darsining oxirida hech narsa qo'shma

    box.textContent = '';
    setScreens(newScreens);
    return newScreens;
  }, [lessonsData, fontObj.family, settings.fontSize, imagesStatus]);

  // ─── Saqlangan joyga o'tish (wordIndex bo'yicha) ───
  const findScreenByLessonAndWord = useCallback((scr, lessonIdx, wordIdx) => {
    if (wordIdx < 0) {
      const coverIdx = scr.findIndex((s) => s.type === 'cover' && s.lessonIndex === lessonIdx);
      return coverIdx >= 0 ? coverIdx : 0;
    }
    for (let i = 0; i < scr.length; i++) {
      const s = scr[i];
      if (s.type === 'text' && s.lessonIndex === lessonIdx && s.page) {
        const endWord = s.page.startWord + s.page.wordCount - 1;
        if (wordIdx >= s.page.startWord && wordIdx <= endWord) return i;
      }
    }
    const first = scr.findIndex((s) => s.type === 'text' && s.lessonIndex === lessonIdx);
    return first >= 0 ? first : 0;
  }, []);

  // ─── Birinchi compute + restore position ───
  useLayoutEffect(() => {
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const newScreens = compute();
      if (!newScreens || newScreens.length === 0) return;

      const saved = getProgress(levelId);
      if (saved) {
        const idx = findScreenByLessonAndWord(newScreens, saved.lessonIndex, saved.wordIndex);
        setScreenIndex(Math.max(0, idx));
      } else {
        setScreenIndex(0);
      }
    };

    run();

    const loadFonts = async () => {
      try {
        await document.fonts.load(`${settings.fontSize}px "${settings.fontFamily}"`);
        if (!cancelled) run();
      } catch { /* */ }
    };
    loadFonts();

    let ro;
    if (typeof ResizeObserver !== 'undefined' && areaRef.current) {
      ro = new ResizeObserver(() => { if (!cancelled) run(); });
      ro.observe(areaRef.current);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (ro) ro.disconnect();
    };
  }, [compute, levelId, findScreenByLessonAndWord, settings.fontSize, settings.fontFamily]);

  // ─── Settings o'zgarganda qayta hisoblash va joyni saqlash ───
  const handleSettingsChange = useCallback((newSettings) => {
    lastReadingInteractionRef.current = Date.now();
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const flushReadingSeconds = useCallback(async () => {
    if (readingFlushInFlightRef.current) {
      readingFlushRequestedRef.current = true;
      return;
    }
    if (pendingReadingSecondsRef.current < 1
      || Date.now() < retryReadingFlushAtRef.current) return;
    const sentSeconds = Math.min(60, pendingReadingSecondsRef.current);
    pendingReadingSecondsRef.current -= sentSeconds;
    readingFlushInFlightRef.current = true;
    try {
      await qoshFaollik(sentSeconds);
      retryReadingFlushAtRef.current = 0;
    } catch (error) {
      if (error?.message === 'Kirish talab qilinadi') {
        pendingReadingSecondsRef.current = 0;
      } else {
        pendingReadingSecondsRef.current += sentSeconds;
        retryReadingFlushAtRef.current = Date.now() + 20000;
        console.error('O‘qish faolligini yuborib bo‘lmadi:', error);
      }
    } finally {
      readingFlushInFlightRef.current = false;
      if (readingFlushRequestedRef.current && pendingReadingSecondsRef.current > 0) {
        readingFlushRequestedRef.current = false;
        window.setTimeout(() => readingFlushCallbackRef.current?.(), 0);
      }
    }
  }, []);

  useEffect(() => {
    readingFlushCallbackRef.current = flushReadingSeconds;
  }, [flushReadingSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastReadingInteractionRef.current > 60000) return;
      pendingReadingSecondsRef.current += 1;
      if (pendingReadingSecondsRef.current >= 20
        && Date.now() >= retryReadingFlushAtRef.current) {
        void flushReadingSeconds();
      }
    }, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (pendingReadingSecondsRef.current > 60) readingFlushRequestedRef.current = true;
        void flushReadingSeconds();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pendingReadingSecondsRef.current > 60) readingFlushRequestedRef.current = true;
      void flushReadingSeconds();
    };
  }, [flushReadingSeconds]);

  // ─── Auto theme ───
  useEffect(() => {
    if (!settings.autoTheme) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const newTheme = mq.matches ? 'black' : 'white';
      setSettings((s) => {
        if (s.bgTheme === newTheme) return s;
        const updated = { ...s, bgTheme: newTheme };
        saveSettings(updated);
        return updated;
      });
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.autoTheme]);

  // ─── Joyni saqlash (debounce) ───
  useEffect(() => {
    if (screens.length === 0) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const scr = screens[screenIndex];
      if (!scr) return;
      if (scr.type === 'cover') {
        saveProgress(levelId, { lessonIndex: scr.lessonIndex, wordIndex: -1 });
      } else if (scr.type === 'text' && scr.page) {
        saveProgress(levelId, { lessonIndex: scr.lessonIndex, wordIndex: scr.page.startWord });
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [screenIndex, screens, levelId]);

  // ─── Navigatsiya ───
  const totalScreens = screens.length;
  const goPrev = useCallback(() => setScreenIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => {
      lastReadingInteractionRef.current = Date.now();
      setScreenIndex((i) => Math.min(Math.max(totalScreens - 1, 0), i + 1));
    },
    [totalScreens]
  );

  // ─── Har bir darsning muqovasi ekrani indeksi (slider nuqtalari uchun) ───
  const lessonCoverIndices = useMemo(() => {
    const indices = [];
    screens.forEach((s, idx) => {
      if (s.type === 'cover') {
        indices.push(idx);
      }
    });
    return indices;
  }, [screens]);

  useEffect(() => {
    setSaveBtn(null);
  }, [screenIndex]);

  // ─── Klaviatura + brauzer orqaga ───
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    window.history.pushState({ bookOpen: true }, '');
    const onPop = () => onClose?.();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
    };
  }, [onClose, goPrev, goNext]);

  // ─── Matn tanlash va Saqlash tugmasi ───
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSaveBtn(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setSaveBtn({ x: rect.left + rect.width / 2 - 30, y: rect.top });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  const handleSaveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (!text) return;

    const scr = screens[screenIndex];
    if (!scr || scr.type !== 'text' || !scr.page) return;

    const anchorSpan = sel.anchorNode?.parentElement?.closest?.('[data-w]');
    const focusSpan = sel.focusNode?.parentElement?.closest?.('[data-w]');
    let startWord = anchorSpan ? parseInt(anchorSpan.dataset.w) : scr.page.startWord;
    let endWord = focusSpan ? parseInt(focusSpan.dataset.w) : scr.page.startWord + scr.page.wordCount - 1;
    if (startWord > endWord) [startWord, endWord] = [endWord, startWord];

    addSaved(levelId, {
      id: uid(),
      levelId,
      lessonIndex: scr.lessonIndex,
      startWord,
      endWord,
      text,
      createdAt: Date.now(),
    });

    sel.removeAllRanges();
    setSaveBtn(null);
    setSavedTrigger((t) => t + 1);
  }, [screens, screenIndex, levelId]);

  // ─── Tap va Swipe ───
  const hasSelection = useCallback(() => {
    const sel = window.getSelection();
    return sel && !sel.isCollapsed && sel.toString().trim().length > 0;
  }, []);

  const handleTap = useCallback(() => {
    if (hasSelection()) return;

    if (panelVisible) {
      setPanelVisible(false);
      setSettingsOpen(false);
      return;
    }

    setPanelVisible(true);
  }, [hasSelection, panelVisible]);

  const onTouchStart = (e) => {
    lastReadingInteractionRef.current = Date.now();
    if (hasSelection()) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };

  const onTouchEnd = (e) => {
    if (hasSelection()) return;
    const s = touchRef.current;
    touchRef.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const elapsed = Date.now() - s.time;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      lastReadingInteractionRef.current = Date.now();
      if (dx < 0) goNext();
      else goPrev();
      return;
    }

    if (elapsed < 300 && Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      lastTouchTimeRef.current = Date.now();
      handleTap();
    }
  };

  const onClick = () => {
    if (hasSelection()) return;
    if (Date.now() - lastTouchTimeRef.current < 450) return;
    handleTap();
  };

  // ─── Saved sheet dan navigatsiya ───
  const handleSavedNavigate = useCallback((lessonIdx, wordIdx) => {
    const idx = findScreenByLessonAndWord(screens, lessonIdx, wordIdx);
    setScreenIndex(Math.max(0, idx));
  }, [screens, findScreenByLessonAndWord]);

  // ─── Hozirgi ekran ───
  const currentScreen = screens[screenIndex] || null;

  // ─── Sahifa elementlarini (matn va rasm) render qilish ───
  const renderPageElements = (elements, lessonIndex) => {
    const lessonSaved = allSaved.filter((s) => s.lessonIndex === lessonIndex);

    const renderParagraph = (el, elIdx) => (
      <p
        key={`p-${elIdx}`}
        style={{
          ...textStyle,
          textIndent: el.cont ? 0 : '1.5em',
          margin: 0,
          marginBottom: 4,
          textAlign: 'justify',
        }}
      >
        {el.words.map((w, wi) => {
          const isHighlighted = lessonSaved.some(
            (s) => w.globalWordIndex >= s.startWord && w.globalWordIndex <= s.endWord
          );
          return (
            <React.Fragment key={wi}>
              {wi > 0 && ' '}
              <span
                data-w={w.globalWordIndex}
                style={{
                  ...(isHighlighted ? { background: 'rgba(255, 224, 102, 0.6)', borderRadius: 2 } : {}),
                  ...(w.bold ? { fontWeight: 700 } : {}),
                  ...(w.italic ? { fontStyle: 'italic' } : {}),
                }}
              >
                {w.word}
              </span>
            </React.Fragment>
          );
        })}
      </p>
    );

    const renderImageGroup = (group, elIdx) => (
      group.images.length > 0 && (
        <div
          key={`img-${elIdx}`}
          style={{
            width: '100%',
            margin: '8px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: group.images.length > 1 ? 8 : 0,
            boxSizing: 'border-box',
          }}
        >
          {group.images.map((image) => {
            const status = imagesStatus[image.url];
            if (status?.error) return null;
            return (
              <div key={image.key} style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>
                <img
                  src={image.url}
                  alt={image.izoh || ''}
                  onError={() => {
                    setImagesStatus((prev) => ({
                      ...prev,
                      [image.url]: { loaded: false, error: true },
                    }));
                  }}
                  style={{
                    width: 'auto',
                    maxWidth: '100%',
                    maxHeight: `${image.maxImgH}px`,
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 8,
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
                {image.izoh && (
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 12,
                      opacity: 0.65,
                      marginTop: 2,
                      textAlign: 'center',
                      lineHeight: 1.3,
                      color: theme.text,
                    }}
                  >
                    {image.izoh}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )
    );

    return elements.map((el, elIdx) => {
      if (el.type === 'imageGroup') return renderImageGroup(el, elIdx);
      if (el.type === 'paragraph') return renderParagraph(el, elIdx);
      return null;
    });
  };

  return createPortal((
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.45)',
      }}
    >
      <div
      lang={language}
      onPointerDownCapture={() => { lastReadingInteractionRef.current = Date.now(); }}
      onKeyDownCapture={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          lastReadingInteractionRef.current = Date.now();
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        width: 'min(100vw, 430px)',
        height: '100dvh',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: theme.bg,
        color: theme.text,
        userSelect: 'text',
        WebkitUserSelect: 'text',
      }}
    >
      {/* Sahifa maydoni */}
      <div
        ref={areaRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        {/* Yashirin o'lchov elementi */}
        <div
          ref={measureRef}
          lang={language}
          aria-hidden="true"
          style={{
            ...textStyle,
            position: 'absolute',
            left: PAD_X,
            top: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            boxSizing: 'content-box',
          }}
        />

        {currentScreen?.type === 'cover' && (
          <LessonCover
            lesson={lessonsData[currentScreen.lessonIndex]?.lesson}
            theme={theme}
          />
        )}

        {currentScreen?.type === 'text' && currentScreen.page && (
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              padding: `${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px`,
              overflow: 'hidden',
              maxWidth: '100%',
              position: 'relative',
            }}
          >
            {renderPageElements(currentScreen.page.elements, currentScreen.lessonIndex)}
            <SaveButton position={saveBtn} onSave={handleSaveSelection} />
          </div>
        )}
      </div>

      {/* Yorug'lik qoplamasi */}
      {settings.brightness < 1 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            background: '#000',
            opacity: (1 - settings.brightness) * 0.6,
            zIndex: 999998,
          }}
        />
      )}

      {/* ═══ CSS ANIMATSIYALAR ═══ */}
      <style>{`
        @keyframes readerPopIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ═══ TEPADAGI BAR (Orqaga, Sozlamalar, Saqlanganlar) ═══ */}
      <div
        data-panel-top
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: '50%',
          top: 0,
          width: '100%',
          maxWidth: 430,
          zIndex: 1000000,
          background: `${theme.bg}F5`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.text}14`,
          padding: `calc(env(safe-area-inset-top, 8px) + 6px) 14px 8px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transform: panelVisible ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          opacity: panelVisible ? 1 : 0,
          pointerEvents: panelVisible ? 'auto' : 'none',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          aria-label={t('Orqaga')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: theme.text, padding: 8,
            WebkitTapHighlightColor: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={22} strokeWidth={1.8} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          <button
            type="button"
            data-settings-btn
            onClick={(e) => {
              e.stopPropagation();
              setSettingsOpen((v) => !v);
            }}
            aria-label={t('Sozlamalar')}
            style={{
              background: settingsOpen ? `${SLIDER_ORANGE}22` : 'none',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: settingsOpen ? SLIDER_ORANGE : theme.text,
              padding: 8,
              WebkitTapHighlightColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <Settings size={22} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSettingsOpen(false);
              setSavedOpen(true);
            }}
            aria-label={t('Saqlanganlar')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: theme.text, padding: 8,
              WebkitTapHighlightColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Bookmark size={22} strokeWidth={1.8} />
          </button>

          {/* Settings popover */}
          {settingsOpen && (
            <SettingsPopover
              settings={settings}
              onChange={handleSettingsChange}
              theme={theme}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </div>
      </div>

      {/* ═══ PASTKI BAR (Sahifa almashish tugmalari) ═══ */}
      <div
        data-panel-bottom
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 12,
          left: '50%',
          transform: panelVisible ? 'translate(-50%, 0)' : 'translate(-50%, calc(100% + 16px))',
          width: 'calc(100% - 20px)',
          maxWidth: 390,
          zIndex: 1000000,
          background: `${theme.bg}F5`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.text}1C`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          borderRadius: 24,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxSizing: 'border-box',
          opacity: panelVisible ? 1 : 0,
          pointerEvents: panelVisible ? 'auto' : 'none',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease',
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          disabled={screenIndex <= 0}
          aria-label={t('Oldingi sahifa')}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            cursor: screenIndex <= 0 ? 'default' : 'pointer',
            color: theme.text,
            opacity: screenIndex <= 0 ? 0.25 : 0.9,
            padding: '12px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.15s ease, background 0.15s ease',
          }}
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={screenIndex >= totalScreens - 1}
          aria-label={t('Keyingi sahifa')}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            cursor: screenIndex >= totalScreens - 1 ? 'default' : 'pointer',
            color: theme.text,
            opacity: screenIndex >= totalScreens - 1 ? 0.25 : 0.9,
            padding: '12px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.15s ease, background 0.15s ease',
          }}
        >
          <ChevronRight size={24} strokeWidth={2.2} />
        </button>
      </div>

      {/* Saved bottom sheet */}
      {savedOpen && (
        <SavedSheet
          levelId={levelId}
          lessons={darslar}
          theme={theme}
          onClose={() => { setSavedOpen(false); setSavedTrigger((t) => t + 1); }}
          onNavigate={handleSavedNavigate}
        />
      )}
    </div>
    </div>
  ), document.body);
}