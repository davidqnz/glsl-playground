import { type IAnnotation, type IMarker } from 'react-ace';
import { type CSSProperties, useState, ReactElement } from 'react';
import styles from './editor.module.css';
import { EditorState, useEditorStateContext } from '../../hooks/editor-state';
import { ShaderType } from '../scene/webgl/shaders';
import GLSLEditor from './glsl-editor';
import TabBar from './tab-bar';
import Tab from './tab';

type Props = {
  style?: CSSProperties
};

export default function Editor({ style }: Props): ReactElement {
  const [state, dispatch] = useEditorStateContext();
  const [activeTab, setActiveTab] = useState<ShaderType>(ShaderType.Vertex);

  const [markers, annotations] = collectAnnotationsAndMarkers(state, activeTab);

  const vertexShaderHasErrors = state.errors.vertexShaderErrors.length !== 0;
  const fragmentShaderHasErrors = state.errors.fragmentShaderErrors.length !== 0;
  const linkerHasErrors = state.errors.linkerErrors.length !== 0;
  const combinedLinkerErrorMessage = state.errors.linkerErrors.map(error => error.message).join('\n');

  return (
    <div className={styles.editor} style={style} >
      <TabBar>
        <Tab
          title='example.vert'
          active={activeTab === ShaderType.Vertex}
          error={vertexShaderHasErrors || linkerHasErrors}
          onClick={() => setActiveTab(ShaderType.Vertex)}
        />
        <Tab
          title='example.frag'
          active={activeTab === ShaderType.Fragment}
          error={fragmentShaderHasErrors || linkerHasErrors}
          onClick={() => setActiveTab(ShaderType.Fragment)}
        />
      </TabBar>
      <GLSLEditor
        source={state.vertexSource}
        onChange={source => dispatch({ action: 'set-sources', vertexSource: source })}
        active={activeTab === ShaderType.Vertex}
        annotations={activeTab === ShaderType.Vertex ? annotations : []}
        markers={activeTab === ShaderType.Vertex ? markers : []}
      />
      <GLSLEditor
        source={state.fragmentSource}
        onChange={source => dispatch({ action: 'set-sources', fragmentSource: source })}
        active={activeTab === ShaderType.Fragment}
        annotations={activeTab === ShaderType.Fragment ? annotations : []}
        markers={activeTab === ShaderType.Fragment ? markers : []}
      />
      {
        linkerHasErrors
        && <div className={styles.errorOverlay}>LINKER: {combinedLinkerErrorMessage}</div>
      }
    </div>
  );
}

function collectAnnotationsAndMarkers(state: EditorState, activeTab: ShaderType): [Array<IMarker>, Array<IAnnotation>] {
  const source = activeTab === ShaderType.Vertex
    ? state.vertexSource
    : state.fragmentSource;
  const compilationErrors = activeTab === ShaderType.Vertex
    ? state.errors.vertexShaderErrors
    : state.errors.fragmentShaderErrors;

  const markers = new Map<number, IMarker>();
  const annotations = new Map<number, IAnnotation>();

  for (const error of compilationErrors) {
    const rowNumber = error.lineNumber - 1; // Ace uses zero-based indices for its rows.

    // Add a marker on this line if one doesn't already exist.
    if (!markers.has(rowNumber)) {
      const span = getFullLineSpan(source, rowNumber);
      if (span) {
        markers.set(rowNumber, {
          startRow: rowNumber,
          startCol: span[0],
          endRow: rowNumber,
          endCol: span[1],
          className: styles.errorMarker,
          type: 'text'
        });
      }
    }

    // Add an annotation for this line or fold this error into the existing annotation.
    if (!annotations.has(rowNumber)) {
      annotations.set(rowNumber, { row: rowNumber, column: 0, type: 'error', text: error.message });
    } else {
      const annotation = annotations.get(rowNumber)!;
      annotation.text += '\n' + error.message;
    }
  }

  return [[...markers.values()], [...annotations.values()]];
}

function getFullLineSpan(source: string, rowNumber: number): [number, number] | undefined {
  const line = source.split('\n')[rowNumber];
  if (!line) return;

  const match = /\s*(.*)\s*/d.exec(line);
  if (!match) return;

  // I don't know why typescript doesn't know about the indices property...
  return (match as any).indices[1];
}
