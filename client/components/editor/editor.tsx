import { useEditorState } from "../../hooks/use-editor-state";
import ProgramEditor from "../program-editor/program-editor";
import Header from "../header/header";
import Scene from "../scene/scene";
import styles from "./editor.module.css";
import ProgramTitle from "../program-title/program-title";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../hooks/use-auth-context";
import Toolbar, { ToolbarLeftGroup, ToolbarRightGroup } from "../toolbar/toolbar";
import TabBar, { Tab } from "../tabs/tabs";
import { ShaderType } from "../scene/webgl/shaders";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import * as ProgramsService from "../../services/programs-service";
import { useState, type ReactElement } from "react";
import IconButton from "../form-controls/icon-button";
import { createNewProgram } from "../../utils/new-program";
import NotFound from "../not-found/not-found";
import type { ProgramData } from "../../../common/api-types";
import { Loader, isLoaded, isLoading } from "../../hooks/use-loader";
import { isError } from "../../../common/result";
import { unsavedChangesModal } from "../unsaved-changes-modal/unsaved-changes-modal";
import { useNavBlocker } from "../../hooks/use-nav-blocker";
import ModalContainer from "react-modal-promise";
import Modal from "../modal/modal";
import InfoCard from "../info-card/info-card";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Editor(): ReactElement {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const params = useParams();
  const programId = params.id || "new";

  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const [editorState, dispatch, EditorContextProvider] = useEditorState();

  const [program] = Loader.useLoader<ProgramData>(async () => {
    let program: ProgramData | undefined;

    if (programId === "new") {
      program = createNewProgram(programId);
    } else {
      // If we aren't creating a new program, go fetch it.
      const result = await ProgramsService.getById(programId);
      if (isError(result)) return result;
      program = result;
    }

    dispatch({ action: "load-program", program: program });
    return program;
  }, [programId]);

  const unblock = useNavBlocker(
    ({ confirm, cancel }) => unsavedChangesModal().then(confirm).catch(cancel),
    editorState.programHasUnsavedChanges && !isLoading(program),
  );

  async function handleSave(): Promise<void> {
    if (!isLoaded(user) || !isLoaded(program)) return;

    if (user.value && editorState.isNewProgram) {
      const result = await ProgramsService.create(editorState.program);

      if (isError(result)) {
        console.log(result);
        return;
      }

      dispatch({ action: "load-program", program: result });
      unblock();
      navigate(`/program/${result.id}`, { replace: true });
    } else if (user.value && user.value.id === editorState.program.userId) {
      const result = await ProgramsService.update(editorState.program);

      if (isError(result)) {
        console.log(result);
        return;
      }

      dispatch({ action: "load-program", program: result });
    } else if (!user.value && editorState.isNewProgram) {
      window.sessionStorage.setItem("programToSave", JSON.stringify(editorState.program));

      const searchParams = new URLSearchParams();
      searchParams.set("redirect", "/save-program");

      unblock();
      navigate(`/auth?${searchParams.toString()}`);
    }
  }

  function handleRevert(): void {
    dispatch({ action: "revert" });
  }

  const isOwnProgram =
    editorState.isNewProgram || (Loader.isLoaded(user) && user.value?.id === editorState.program.userId);

  let content: ReactElement = <></>;
  if (Loader.isLoaded(program)) {
    content = (
      <>
        <Toolbar style={{ gridArea: "toolbar" }}>
          <ToolbarLeftGroup className={styles.toolBarLeft}>
            <TabBar>
              <Tab
                title="program.vert"
                active={editorState.activeTab === ShaderType.Vertex}
                error={editorState.vertexShaderHasErrors || editorState.linkerHasErrors}
                onClick={() => dispatch({ action: "set-tab", tab: ShaderType.Vertex })}
              />
              <Tab
                title="program.frag"
                active={editorState.activeTab === ShaderType.Fragment}
                error={editorState.fragmentShaderHasErrors || editorState.linkerHasErrors}
                onClick={() => dispatch({ action: "set-tab", tab: ShaderType.Fragment })}
              />
            </TabBar>
            <div className={styles.buttonGroup}>
              <IconButton onClick={() => setInfoModalOpen(true)}>
                <InfoOutlinedIcon />
              </IconButton>
              <IconButton onClick={handleRevert} disabled={!editorState.programHasUnsavedChanges}>
                <RestoreIcon />
              </IconButton>
              {isOwnProgram && (
                <IconButton
                  onClick={handleSave}
                  disabled={!editorState.programHasUnsavedChanges && !editorState.isNewProgram}
                >
                  <SaveIcon />
                </IconButton>
              )}
            </div>
          </ToolbarLeftGroup>
          <ToolbarRightGroup className={styles.toolBarRight}>
            <a href="https://github.com/davidqnz/glsl-playground">
              <GitHubIcon />
            </a>
          </ToolbarRightGroup>
        </Toolbar>
        <ProgramEditor style={{ gridArea: "editor" }} />
        <Scene style={{ gridArea: "scene" }} />
      </>
    );
  } else if (Loader.isLoading(program)) {
    content = <></>;
  } else if (Loader.loadingDidError(program)) {
    content = <NotFound className={styles.contentArea} />;
  }

  return (
    <EditorContextProvider value={[editorState, dispatch]}>
      <div className={styles.layout}>
        <Header style={{ gridArea: "header" }}>
          {Loader.isLoaded(program) && (
            <ProgramTitle
              editable={isOwnProgram}
              unsavedChanges={editorState.programHasUnsavedChanges}
              title={editorState.program.title}
              onChange={(title) => dispatch({ action: "set-title", title })}
            />
          )}
        </Header>
        {content}
      </div>
      <Modal open={infoModalOpen} onClickOut={() => setInfoModalOpen(false)}>
        <InfoCard onDismiss={() => setInfoModalOpen(false)} />
      </Modal>
      <ModalContainer />
    </EditorContextProvider>
  );
}
