
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Clock, Trash2, Download, TrendingUp, TrendingDown } from './icons';
import { getAnalysisHistory, deleteAnalysisFromHistory, type AnalysisHistory } from '../utils/storageUtils';
import type { AnalysisResult } from '../types';

interface HistoryPanelProps {
  onLoadAnalysis: (analysis: AnalysisResult, config: AnalysisHistory['config']) => void;
  onClose: () => void;
}

export function HistoryPanel({ onLoadAnalysis, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getAnalysisHistory());
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this analysis from history?')) {
      deleteAnalysisFromHistory(id);
      loadHistory();
    }
  };

  const handleLoad = (item: AnalysisHistory) => {
    onLoadAnalysis(item.result, item.config);
    onClose();
  };

  const filteredHistory = filter
    ? history.filter(item =>
        item.config.websiteUrl.toLowerCase().includes(filter.toLowerCase()) ||
        item.config.keywords.some(k => k.toLowerCase().includes(filter.toLowerCase())) ||
        item.config.targetAudience.toLowerCase().includes(filter.toLowerCase())
      )
    : history;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700 flex flex-col">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Analysis History ({history.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <input
            type="text"
            placeholder="Search history..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-4 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analysis history found</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-200 truncate">
                        {item.config.websiteUrl || item.result.imageFileName || 'Untitled'}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${
                          item.result.overallSeoScore >= 70
                            ? 'border-green-500 text-green-400'
                            : item.result.overallSeoScore >= 50
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-red-500 text-red-400'
                        }`}
                      >
                        {item.result.overallSeoScore >= 70 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {item.result.overallSeoScore}/100
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-400 space-y-1">
                      <p>
                        <span className="text-slate-500">Audience:</span> {item.config.targetAudience}
                      </p>
                      <p>
                        <span className="text-slate-500">Keywords:</span>{' '}
                        {item.config.keywords.slice(0, 3).join(', ')}
                        {item.config.keywords.length > 3 && ` +${item.config.keywords.length - 3} more`}
                      </p>
                      <p>
                        <span className="text-slate-500">Analyzed:</span>{' '}
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-slate-500">Sections:</span> {item.result.sections.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoad(item)}
                      className="whitespace-nowrap"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="whitespace-nowrap border-red-700 text-red-400 hover:bg-red-950"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
