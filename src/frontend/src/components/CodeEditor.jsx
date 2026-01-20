export default function CodeEditor({
  value = "",
  title = "Code Editor",
  placeholder = "",
  editable = true,
  onChange,
}) {
  const isEditable = editable !== false;

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
      <div className="flex-1 bg-runner-bg p-3">
        <textarea
          aria-label={title}
          className="h-full w-full resize-none rounded-lg border border-border bg-runner-bg p-3 font-mono text-sm text-text-light placeholder:text-text-dark focus:outline-none focus:ring-1 focus:ring-ctp-blue-400"
          value={value}
          onChange={(event) => {
            if (isEditable && onChange) {
              onChange(event.target.value);
            }
          }}
          placeholder={placeholder}
          readOnly={!isEditable}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
