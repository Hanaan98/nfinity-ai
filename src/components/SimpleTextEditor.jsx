import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";

const SimpleTextEditor = forwardRef(
  ({ value, onChange, placeholder, className }, ref) => {
    const editorRef = useRef(null);
    const isUpdatingRef = useRef(false);

    useImperativeHandle(ref, () => ({
      insertText: (text) => {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand("insertText", false, text);
        }
      },
      clear: () => {
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
          onChange?.("");
        }
      },
    }));

    useEffect(() => {
      if (editorRef.current && value && !isUpdatingRef.current) {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value;
        }
      }
    }, [value]);

    const handleInput = () => {
      if (editorRef.current && !isUpdatingRef.current) {
        isUpdatingRef.current = true;
        const html = editorRef.current.innerHTML;
        onChange?.(html);
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    };

    const formatText = (command, value = null) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      handleInput();
    };

    const toggleList = (listType) => {
      editorRef.current?.focus();

      // Check if we're already in a list
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let node = selection.anchorNode;

        // Traverse up to find if we're in a list
        while (node && node !== editorRef.current) {
          if (node.nodeName === "UL" || node.nodeName === "OL") {
            // Remove the list
            document.execCommand("insertHTML", false, node.textContent);
            handleInput();
            return;
          }
          node = node.parentNode;
        }
      }

      // Not in a list, create one
      document.execCommand(listType, false, null);
      handleInput();
    };

    const ToolbarButton = ({ onClick, children, title }) => (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        title={title}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-300"
      >
        {children}
      </button>
    );

    return (
      <div
        className={`bg-[#1a1f24] border border-[#293239] rounded-lg overflow-hidden ${
          className || ""
        }`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[#293239] flex-wrap">
          <div className="flex items-center gap-0.5 pr-2 border-r border-[#293239]">
            <ToolbarButton onClick={() => formatText("undo")} title="Undo">
              <Undo size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("redo")} title="Redo">
              <Redo size={14} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 px-2 border-r border-[#293239]">
            <ToolbarButton onClick={() => formatText("bold")} title="Bold">
              <Bold size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("italic")} title="Italic">
              <Italic size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("underline")}
              title="Underline"
            >
              <Underline size={14} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 px-2">
            <ToolbarButton
              onClick={() => toggleList("insertUnorderedList")}
              title="Bullet List"
            >
              <List size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => toggleList("insertOrderedList")}
              title="Numbered List"
            >
              <ListOrdered size={14} />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[120px] max-h-[300px] overflow-y-auto px-4 py-3 text-sm text-gray-200 focus:outline-none simple-text-editor"
          dir="ltr"
          lang="en"
          style={{
            caretColor: "#3b82f6",
            direction: "ltr",
            textAlign: "left",
          }}
          data-placeholder={placeholder || "Type your message here..."}
        />
      </div>
    );
  }
);

SimpleTextEditor.displayName = "SimpleTextEditor";

export default SimpleTextEditor;
