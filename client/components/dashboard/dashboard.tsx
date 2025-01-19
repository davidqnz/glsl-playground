import { type ReactElement, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { ProgramData } from "../../../common/api-types";
import Confirmation from "../../confirmation/confirmation";
import { useAuthContext } from "../../hooks/use-auth-context";
import { Loader } from "../../hooks/use-loader";
import * as ProgramsService from "../../services/programs-service";
import Button from "../form-controls/button";
import Modal from "../modal/modal";
import ProgramsTable from "../programs-table/programs-table";
import styles from "./dashboard.module.css";

export default function Dashboard(): ReactElement {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [programs, setPrograms] = Loader.useLoader<Array<ProgramData>>(async () => {
    return (await ProgramsService.getUsersPrograms()) || [];
  }, []);
  const [programToDelete, setProgramToDelete] = useState<ProgramData | null>(null);

  if (Loader.isLoaded(user) && !user.value) {
    return <Navigate to="/auth" replace={true} />;
  }

  async function handleDelete(): Promise<void> {
    if (!Loader.isLoaded(programs) || !programToDelete) return;

    const result = await ProgramsService.deleteProgram(programToDelete.id);
    if (!result) return;

    setPrograms(programs.value.filter((p) => p.id !== programToDelete.id));
    setProgramToDelete(null);
  }

  function handleDeleteButtonPressed(programId: string): void {
    if (!Loader.isLoaded(programs)) return;

    const program = programs.value.find((p) => p.id === programId);
    if (!program) return;

    setProgramToDelete(program);
  }

  function handleEdit(programId: string): void {
    navigate(`/program/${programId}`);
  }

  return (
    <div className={styles.layout}>
      {Loader.isLoaded(programs) && (
        <section className={styles.section}>
          <div>
            <h2 className={styles.heading}>Your Programs</h2>
          </div>
          {programs.value.length !== 0 ? (
            <ProgramsTable programs={programs.value} handleDelete={handleDeleteButtonPressed} handleEdit={handleEdit} />
          ) : (
            <p>You don't have any programs yet.</p>
          )}
          <Button className={styles.newProgramButton} onClick={() => navigate("/")}>
            New Program
          </Button>
        </section>
      )}
      <Modal open={!!programToDelete}>
        <Confirmation
          message={`Are you sure you want to delete "${programToDelete?.title}"?`}
          onConfirm={() => handleDelete()}
          onCancel={() => setProgramToDelete(null)}
          destructive
        />
      </Modal>
    </div>
  );
}
