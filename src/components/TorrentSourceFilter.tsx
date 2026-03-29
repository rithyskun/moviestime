"use client";

import React, { useState } from "react";

interface TorrentSourceFilterProps {
  onSourceChange: (sources: string[]) => void;
  selectedSources: string[];
}

const AVAILABLE_SOURCES = [
  { id: "thepiratebay", name: "The Pirate Bay", emoji: "🏴‍☠️" },
  { id: "1337x", name: "1337x", emoji: "🔥" },
  { id: "kickass", name: "Kickass", emoji: "💥" },
  { id: "rarbg", name: "RARBG", emoji: "🎬" },
];

export default function TorrentSourceFilter({
  onSourceChange,
  selectedSources,
}: TorrentSourceFilterProps) {
  const toggleSource = (sourceId: string) => {
    const updated = selectedSources.includes(sourceId)
      ? selectedSources.filter((s) => s !== sourceId)
      : [...selectedSources, sourceId];

    // Ensure at least one source is selected
    if (updated.length === 0) {
      onSourceChange([sourceId]);
    } else {
      onSourceChange(updated);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Search Sources
      </h3>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SOURCES.map((source) => (
          <button
            key={source.id}
            onClick={() => toggleSource(source.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSources.includes(source.id)
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>{source.emoji}</span> {source.name}
          </button>
        ))}
      </div>
    </div>
  );
}
