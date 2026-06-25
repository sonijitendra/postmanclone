'use client';

import React from 'react';
import { KeyValuePair } from '../../types';
import { Trash2, CheckSquare, Square } from 'lucide-react';

interface KeyValueTableProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export default function KeyValueTable({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueTableProps) {
  
  // Ensure we always have at least one empty row at the end
  const resolvedPairs = [...pairs];
  if (resolvedPairs.length === 0 || resolvedPairs[resolvedPairs.length - 1].key !== '' || resolvedPairs[resolvedPairs.length - 1].value !== '') {
    resolvedPairs.push({ key: '', value: '', enabled: true });
  }

  const handleUpdate = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = resolvedPairs.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: val };
      }
      return p;
    });

    // Clean up empty rows at the end if there are multiples
    const filtered = updated.filter((p, idx) => {
      // Keep row if it has content, or if it is the only empty row at the end
      if (p.key.trim() !== '' || p.value.trim() !== '') return true;
      return idx === updated.length - 1;
    });

    onChange(filtered);
  };

  const handleDelete = (index: number) => {
    const updated = resolvedPairs.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <table className="kv-table text-xs">
      <thead>
        <tr>
          <th className="w-[30px] text-center"></th>
          <th className="w-[220px]">Key</th>
          <th>Value</th>
          <th className="w-[45px] text-center"></th>
        </tr>
      </thead>
      <tbody>
        {resolvedPairs.map((pair, idx) => (
          <tr key={idx} className="group hover:bg-[var(--bg-hover)]/10">
            {/* Checkbox enabled toggle */}
            <td className="text-center">
              <button
                type="button"
                onClick={() => handleUpdate(idx, 'enabled', !pair.enabled)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {pair.enabled ? (
                  <CheckSquare className="h-3.5 w-3.5 text-[var(--pm-orange)]" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </button>
            </td>
            {/* Key input */}
            <td>
              <input
                type="text"
                value={pair.key}
                onChange={(e) => handleUpdate(idx, 'key', e.target.value)}
                placeholder={keyPlaceholder}
                className="w-full text-xs font-mono"
              />
            </td>
            {/* Value input */}
            <td>
              <input
                type="text"
                value={pair.value}
                onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                placeholder={valuePlaceholder}
                className="w-full text-xs font-mono"
              />
            </td>
            {/* Delete row */}
            <td className="text-center">
              {idx !== resolvedPairs.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="rounded p-1 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-[var(--bg-active)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
