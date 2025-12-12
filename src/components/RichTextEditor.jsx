import React, { useEffect, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
  $getRoot,
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Strikethrough,
  Quote,
} from "lucide-react";

// Toolbar plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);
  const [isCode, setIsCode] = React.useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const formatStrikethrough = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  };

  const formatCode = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  const insertLink = () => {
    // Disable link button for now - requires additional link plugin configuration
    // Users can still type URLs directly and they'll be clickable
    return;
  };

  const formatBulletList = () => {
    // Insert list command will be handled by list plugin when properly configured
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText("\n• ");
      }
    });
  };

  const formatNumberedList = () => {
    // Insert list command will be handled by list plugin when properly configured
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText("\n1. ");
      }
    });
  };

  const formatAlignLeft = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  };

  const formatAlignCenter = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  };

  const formatAlignRight = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors ${
        active
          ? "bg-blue-600/20 text-blue-400"
          : "text-gray-400 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-[#293239] flex-wrap">
      <div className="flex items-center gap-0.5 pr-2 border-r border-[#293239]">
        <ToolbarButton onClick={undo} title="Undo (Ctrl+Z)">
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={redo} title="Redo (Ctrl+Y)">
          <Redo size={14} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-0.5 px-2 border-r border-[#293239]">
        <ToolbarButton
          onClick={formatBold}
          active={isBold}
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatItalic}
          active={isItalic}
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatUnderline}
          active={isUnderline}
          title="Underline (Ctrl+U)"
        >
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatStrikethrough}
          active={isStrikethrough}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={formatCode} active={isCode} title="Code">
          <Code size={14} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-0.5 px-2 border-r border-[#293239]">
        <ToolbarButton onClick={insertLink} title="Insert Link">
          <Link size={14} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-0.5 px-2 border-r border-[#293239]">
        <ToolbarButton onClick={formatBulletList} title="Bullet List">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={formatNumberedList} title="Numbered List">
          <ListOrdered size={14} />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-0.5 px-2">
        <ToolbarButton onClick={formatAlignLeft} title="Align Left">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={formatAlignCenter} title="Align Center">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={formatAlignRight} title="Align Right">
          <AlignRight size={14} />
        </ToolbarButton>
      </div>
    </div>
  );
}

// Clear editor plugin
function ClearEditorPlugin({ shouldClear, onCleared }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (shouldClear) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
      onCleared?.();
    }
  }, [shouldClear, editor, onCleared]);

  return null;
}

// Set initial HTML plugin
function SetInitialHTMLPlugin({ html }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (html) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        nodes.forEach((node) => root.append(node));
      });
    }
  }, [html, editor]);

  return null;
}

// Plugin to force LTR direction
function ForceLTRPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.update(() => {
        const root = $getRoot();
        const direction = root.getDirection();
        if (direction !== "ltr") {
          root.setDirection("ltr");
        }
      });
    });
  }, [editor]);

  return null;
}

// Plugin to expose editor methods
function EditorRefPlugin({ editorRef }) {
  const [editor] = useLexicalComposerContext();

  React.useImperativeHandle(editorRef, () => ({
    insertText: (text) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
        }
      });
    },
    clear: () => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
    },
  }));

  return null;
}

// Main RichTextEditor component
const RichTextEditor = React.forwardRef(
  ({ value, onChange, placeholder, className }, ref) => {
    const [shouldClear, setShouldClear] = React.useState(false);

    const initialConfig = {
      namespace: "TicketReplyEditor",
      editorState: null,
      editable: true,
      theme: {
        ltr: "ltr:text-left",
        rtl: "rtl:text-right",
        paragraph: "text-gray-200 mb-1 ltr",
        text: {
          bold: "font-bold",
          italic: "italic",
          underline: "underline",
          strikethrough: "line-through",
          code: "bg-gray-700 px-1 py-0.5 rounded text-sm font-mono",
        },
        link: "text-blue-400 hover:text-blue-300 underline cursor-pointer",
        list: {
          ul: "list-disc list-inside ml-4 text-gray-200",
          ol: "list-decimal list-inside ml-4 text-gray-200",
          listitem: "mb-0.5",
        },
        root: "ltr",
      },
      onError: (error) => {
        console.error("Lexical error:", error);
      },
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        LinkNode,
        AutoLinkNode,
      ],
    };

    const handleChange = useCallback(
      (editorState, editor) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor);
          onChange?.(htmlString);
        });
      },
      [onChange]
    );

    const handleClearComplete = useCallback(() => {
      setShouldClear(false);
    }, []);

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div
          className={`bg-[#1a1f24] border border-[#293239] rounded-lg overflow-hidden ${
            className || ""
          }`}
          dir="ltr"
          style={{ direction: "ltr" }}
        >
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[120px] max-h-[300px] overflow-y-auto px-4 py-3 text-sm text-gray-200 focus:outline-none force-ltr-text"
                style={{
                  caretColor: "#3b82f6",
                  direction: "ltr",
                  textAlign: "left",
                  unicodeBidi: "normal",
                  writingMode: "horizontal-tb",
                }}
                dir="ltr"
                lang="en"
              />
            }
            placeholder={
              <div className="text-sm text-gray-500 px-4 py-3">
                {placeholder || "Type your message here..."}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <ListPlugin />
          <LinkPlugin />
          <ForceLTRPlugin />
          <EditorRefPlugin editorRef={ref} />
          <ClearEditorPlugin
            shouldClear={shouldClear}
            onCleared={handleClearComplete}
          />
          {value && <SetInitialHTMLPlugin html={value} />}
        </div>
      </LexicalComposer>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
