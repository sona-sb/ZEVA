import React, { Fragment, useState } from "react";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMatches(sentence, keyVocabulary) {
  const matches = [];
  keyVocabulary
    .filter((item) => item && typeof item.word === "string" && item.word.trim())
    .forEach((item) => {
      const expression = new RegExp("\\b" + escapeRegExp(item.word.trim()) + "\\b", "gi");
      let match = expression.exec(sentence);
      while (match) {
        matches.push({ start: match.index, end: match.index + match[0].length, vocabulary: item });
        match = expression.exec(sentence);
      }
    });
  return matches
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .filter((match, index, all) => index === 0 || match.start >= all[index - 1].end);
}

export default function InteractiveUpgradeText({ sentence = "", keyVocabulary = [] }) {
  const [hovered, setHovered] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  if (!sentence || !Array.isArray(keyVocabulary) || keyVocabulary.length === 0) return <>{sentence}</>;

  const matches = findMatches(sentence, keyVocabulary);
  if (matches.length === 0) return <>{sentence}</>;
  const parts = [];
  let cursor = 0;
  const showTooltip = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 224;
    const gap = 8;
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, gap), window.innerWidth - width - gap);
    const top = Math.max(gap, rect.top - 96);
    setTooltipPosition({ left, top });
    setHovered(index);
  };
  matches.forEach((match, index) => {
    if (match.start > cursor) parts.push(<Fragment key={"text-" + index}>{sentence.slice(cursor, match.start)}</Fragment>);
    parts.push(
      <span
        key={"word-" + index}
        className="border-b border-dotted border-[#FDA4AF] text-[#FDA4AF]/95 cursor-help relative inline-block"
        onMouseEnter={(event) => showTooltip(event, index)}
        onMouseLeave={() => { setHovered(null); setTooltipPosition(null); }}
      >
        {sentence.slice(match.start, match.end)}
        {hovered === index && (
          <span
            className="fixed bg-[#140A0E] border border-[#9F1239]/70 text-white shadow-xl rounded-lg p-2.5 w-56 z-50 pointer-events-none"
            style={tooltipPosition || undefined}
          >
            <span className="flex items-center justify-between gap-2">
              <strong className="text-[#FDA4AF]">{match.vocabulary.word}</strong>
              {match.vocabulary.level && <span className="text-[10px] rounded-full border border-[#FDA4AF]/50 px-1.5 py-0.5 text-[#FDA4AF]">{match.vocabulary.level}</span>}
            </span>
            <span className="block text-xs text-gray-200 leading-relaxed mt-1">{match.vocabulary.definition}</span>
          </span>
        )}
      </span>,
    );
    cursor = match.end;
  });
  if (cursor < sentence.length) parts.push(<Fragment key="text-end">{sentence.slice(cursor)}</Fragment>);
  return <>{parts}</>;
}
