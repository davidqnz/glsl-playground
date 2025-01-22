import type { ReactElement } from "react";
import { create as createPromisifiedModal } from "react-modal-promise";
import Confirmation from "../../confirmation/confirmation";
import Modal from "../modal/modal";

type PromiseModalProps = {
  isOpen: boolean;
  onResolve: () => void;
  onReject: () => void;
};

function UnsavedChangedModal({ isOpen, onResolve, onReject }: PromiseModalProps): ReactElement {
  return (
    <Modal open={isOpen} onClickOut={onReject}>
      <Confirmation
        message="This program has unsaved changes. Are you sure you want to leave?"
        onConfirm={onResolve}
        onCancel={onReject}
        destructive={true}
      />
    </Modal>
  );
}

export const unsavedChangesModal = createPromisifiedModal(UnsavedChangedModal);
