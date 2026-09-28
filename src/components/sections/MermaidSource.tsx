import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { architecture } from '../../data/architecture';

export function MermaidSource() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(architecture.mermaid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Mermaid Source</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Paste into{' '}
            <span className="font-mono text-ink">mermaid.live</span> or any Mermaid renderer.
          </p>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink hover:bg-surface-3 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#22c55e]" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-xl border border-line bg-surface-0 p-6 font-mono text-[12px] leading-relaxed text-ink-soft">
        {architecture.mermaid}
      </pre>
    </div>
  );
}
