import CodeMirror from "@uiw/react-codemirror";
import { EditorView, placeholder as placeholderExtension } from "@codemirror/view";
import { python } from '@codemirror/lang-python';


export default function CodeEditor({
  value = "",
  title = "Code Editor",
  placeholder = "",
  editable = true,
  onChange,
}) {

  const isEditable = editable !== false;
  const extensions = [
    EditorView.theme({
      "&": {
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        fontSize: "0.875rem",
      },
      ".cm-content": {
        padding: "0.75rem",
      },
      ".cm-line": {
        padding: "0 0.25rem",
      },
    }),
  python()];

  if (placeholder) {
    extensions.push(placeholderExtension(placeholder));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-ctp-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-ctp-yellow-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-ctp-green-500" />
          </div>
          <span className="text-sm font-semibold text-text-light">{title}</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-dark">
          {isEditable ? "Editable" : "Read only"}
        </span>
      </div>
      <div className="flex-1 bg-runner-bg p-3 text-text-light">
        <CodeMirror
          aria-label={title}
          className="h-full w-full rounded-lg overflow-hidden  bg-black border-border focus-within:ring-1 focus-within:ring-ctp-blue-400"
          value={value}
          height="100%"
          extensions={extensions}
          editable={isEditable}
	      theme="dark"
          readOnly={!isEditable}
          basicSetup
          onChange={(nextValue) => {
            if (isEditable && onChange) {
              onChange(nextValue);
            }
          }}
        />
      </div>
    </div>
  );
}
