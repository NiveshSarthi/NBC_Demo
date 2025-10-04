'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Link, List, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newText = selectedText || placeholder;
    const newValue =
      value.substring(0, start) +
      before +
      newText +
      after +
      value.substring(end);

    onChange(newValue);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + newText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    // Basic markdown rendering (simplified)
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold">{line.substring(4)}</h3>;
        }

        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links
        line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

        // Lists
        if (line.startsWith('- ')) {
          return <li key={index} dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
          return <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
        }

        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }

        return <p key={index} dangerouslySetInnerHTML={{ __html: line }} />;
      });
  };

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('**', '**', 'bold text')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('*', '*', 'italic text')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('[', '](url)', 'link text')}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('- ', '', 'list item')}
          title="List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('> ', '', 'quote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant={!isPreview ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(false)}
          >
            Write
          </Button>
          <Button
            type="button"
            variant={isPreview ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="min-h-[300px]">
        {isPreview ? (
          <div className="p-4 prose prose-sm max-w-none">
            {renderMarkdown(value)}
          </div>
        ) : (
          <textarea
            id="content-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[300px] p-4 text-sm font-mono resize-none focus:outline-none"
            style={{ fontFamily: 'monospace' }}
          />
        )}
      </div>
    </div>
  );
}