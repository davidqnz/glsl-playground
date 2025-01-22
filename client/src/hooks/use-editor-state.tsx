import { type Dispatch, createContext, useContext, useReducer } from "react";
import type { ProgramData } from "../../../common/api-types";
import { type ProgramCompilationErrors, ShaderType } from "../components/scene/webgl/shaders";

interface CoreEditorState {
  program: ProgramData;
  lastSavedProgram: ProgramData;
  activeTab: ShaderType;
  errors: ProgramCompilationErrors;
}

export interface EditorState extends CoreEditorState {
  programHasUnsavedChanges: boolean;
  isNewProgram: boolean;
  vertexShaderHasErrors: boolean;
  fragmentShaderHasErrors: boolean;
  linkerHasErrors: boolean;
}

type EditorActionLoadProgram = {
  action: "load-program";
  program: ProgramData;
};
type EditorActionRevert = {
  action: "revert";
};
type EditorStateSetTitle = {
  action: "set-title";
  title: string;
};
type EditorStateSetActiveTab = {
  action: "set-tab";
  tab: ShaderType;
};
type EditorActionSetSources = {
  action: "set-sources";
  vertexSource?: string;
  fragmentSource?: string;
};
type EditorActionSetErrors = {
  action: "set-errors";
  errors?: ProgramCompilationErrors;
};

type EditorAction =
  | EditorActionLoadProgram
  | EditorActionRevert
  | EditorStateSetTitle
  | EditorStateSetActiveTab
  | EditorActionSetSources
  | EditorActionSetErrors;

function reducer(state: EditorState, action: EditorAction): EditorState {
  // First, update the state values which can't be derived.
  let nextCoreState: CoreEditorState | undefined;

  switch (action.action) {
    case "load-program":
      nextCoreState = {
        ...state,
        program: action.program,
        lastSavedProgram: action.program,
      };
      break;
    case "revert":
      nextCoreState = {
        ...state,
        program: { ...state.lastSavedProgram },
      };
      break;
    case "set-title":
      nextCoreState = {
        ...state,
        program: {
          ...state.program,
          title: action.title,
        },
      };
      break;
    case "set-tab":
      nextCoreState = {
        ...state,
        activeTab: action.tab,
      };
      break;
    case "set-sources":
      nextCoreState = {
        ...state,
        program: {
          ...state.program,
          vertexSource: action.vertexSource || state.program.vertexSource,
          fragmentSource: action.fragmentSource || state.program.fragmentSource,
        },
      };
      break;
    case "set-errors": {
      nextCoreState = {
        ...state,
        program: {
          ...state.program,
        },
        errors: action.errors || { vertexShaderErrors: [], fragmentShaderErrors: [], linkerErrors: [] },
      };
      break;
    }
  }

  // Now update all the derived state.
  const nextState: EditorState = {
    ...nextCoreState,
    programHasUnsavedChanges: !areProgramsEqual(nextCoreState.program, nextCoreState.lastSavedProgram),
    isNewProgram: nextCoreState.program.id === "new",
    vertexShaderHasErrors: nextCoreState.errors.vertexShaderErrors.length !== 0,
    fragmentShaderHasErrors: nextCoreState.errors.fragmentShaderErrors.length !== 0,
    linkerHasErrors: nextCoreState.errors.linkerErrors.length !== 0,
  };

  // The type checker can't help out on this one. When adding more state, make sure to watch out for cases like this.
  nextState.program.didCompile =
    !nextState.vertexShaderHasErrors && !nextState.fragmentShaderHasErrors && !nextState.linkerHasErrors;

  return nextState;
}

type EditorContextValue = [EditorState, Dispatch<EditorAction>];

export const EditorContext = createContext<EditorContextValue>([createInitialState(), () => {}]);

export function useEditorState(): [...EditorContextValue, typeof EditorContext.Provider] {
  const [state, dispatch] = useReducer<typeof reducer>(reducer, createInitialState());
  return [state, dispatch, EditorContext.Provider];
}

export function useEditorStateContext(): EditorContextValue {
  return useContext(EditorContext);
}

function createInitialState(): EditorState {
  const blankProgram = {
    id: "",
    userId: "",
    title: "",
    vertexSource: "",
    fragmentSource: "",
    didCompile: false,
    createdAt: "",
    modifiedAt: "",
  };
  return {
    program: blankProgram,
    lastSavedProgram: blankProgram,
    programHasUnsavedChanges: false,
    isNewProgram: true,
    activeTab: ShaderType.Vertex,
    errors: {
      vertexShaderErrors: [],
      fragmentShaderErrors: [],
      linkerErrors: [],
    },
    vertexShaderHasErrors: false,
    fragmentShaderHasErrors: false,
    linkerHasErrors: false,
  };
}

function areProgramsEqual(a: ProgramData, b: ProgramData): boolean {
  return a.vertexSource === b.vertexSource && a.fragmentSource === b.fragmentSource && a.title === b.title;
}
