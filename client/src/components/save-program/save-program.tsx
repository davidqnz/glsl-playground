import { type ReactElement, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ProgramData } from "../../../../common/api-types";
import { isError } from "../../../../common/result";
import * as ProgramsService from "../../services/programs-service";

export default function SaveProgram(): ReactElement {
  const navigate = useNavigate();

  // NOTE: In this instance it's convenient to do a non-idempotent operation in an effect (creating the new program).
  //       Strict mode is designed to suss out effects like this for the eventual react concurrent mode by running them
  //       twice. Luckily, changes to a ref are observable between the two runs, so we can use it as a flag to keep
  //       effect idempotent. This system might need to be revisited if updating to a version of react with concurrent
  //       mode.
  const effectHasRun = useRef<boolean>(false);

  useEffect(() => {
    if (effectHasRun.current) return;
    effectHasRun.current = true;

    const localProgram = window.sessionStorage.getItem("programToSave");
    window.sessionStorage.removeItem("programToSave");

    if (!localProgram) {
      navigate("/", { replace: true });
      return;
    }

    ProgramsService.create(JSON.parse(localProgram) as ProgramData).then((result) => {
      if (!isError(result)) {
        const program: ProgramData = result;
        navigate(`/program/${program.id}`, { replace: true });
      } else {
        console.error(result);
        navigate("/", { replace: true });
      }
    });
  }, []);

  return <></>;
}
