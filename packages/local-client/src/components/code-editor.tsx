import { useRef } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import prettier from 'prettier';
import { parse } from '@babel/parser';
import parser from 'prettier/parser-babel';
import traverse from '@babel/traverse';
import MonacoJSXHighlighter from 'monaco-jsx-highlighter';
import './code-editor.css';
import './syntax.css';

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });

    const defaultOptions = {
      parser: 'babel', // for reference only, only babel is supported right now
      isHighlightGlyph: false, // if JSX elements should decorate the line number gutter
      iShowHover: false, // if JSX types should  tooltip with their type info
      isUseSeparateElementStyles: false, // if opening elements and closing elements have different styling
      isThrowJSXParseErrors: false, // Only JSX Syntax Errors are not thrown by default when parsing, true will throw like any other parsign error
    };

    const babelParse = (code: string) => {
      return parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
      });
    };

    const monacoJSXHighlighter = new MonacoJSXHighlighter(
      //@ts-expect-error
      window.monaco,
      babelParse,
      traverse,
      editor,
      defaultOptions,
    );

    // Activate highlighting (debounceTime default: 100ms)
    monacoJSXHighlighter.highLightOnDidChangeModelContent(100);
    // Activate JSX commenting
    monacoJSXHighlighter.addJSXCommentCommand();
  };

  function onFormatClick() {
    const unformatted = editorRef.current.getValue();

    const formatted = prettier
      .format(unformatted, {
        parser: 'babel',
        plugins: [parser],
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
      })
      .replace(/\n$/, '');

    editorRef.current.setValue(formatted);
  }

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format Code
      </button>
      <MonacoEditor
        value={initialValue}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        language="javascript"
        height="100%"
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
