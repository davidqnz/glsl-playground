import { type FormEvent, type ReactElement, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import type { UserToken } from "../../../../common/api-types";
import { type Result, isError } from "../../../../common/result";
import { useAuthContext } from "../../hooks/use-auth-context";
import { Loader } from "../../hooks/use-loader";
import { logIn, signUp } from "../../services/auth-service";
import { classes } from "../../utils/style-utils";
import Button from "../form-controls/button";
import Input from "../form-controls/input";
import css from "./auth-form.module.css";

export type AuthMethod = "log-in" | "sign-up";

export default function AuthForm(): ReactElement {
  const { user, setUser } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [searchParams, setSearchParams] = useSearchParams();

  const authMethod: AuthMethod = searchParams.get("method") === "sign-up" ? "sign-up" : "log-in";
  const redirect: string = searchParams.get("redirect") || "/";

  if (Loader.isLoaded(user) && !!user.value) {
    return <Navigate to={redirect} replace={true} />;
  }

  const [actionPhrase, alternativePhrase, alternativeMethod, authFunction] = derivedValues[authMethod];

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email: string = formData.get("email") as string;
    const password: string = formData.get("password") as string;

    const result = await authFunction(email, password);
    if (isError(result)) {
      setErrorMessage(result.message);
    } else {
      setUser(result);
    }
  }

  function handleSwitchAuthMethod(): void {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("method", alternativeMethod);
    setSearchParams(newParams);
  }

  return (
    <div className={css.layout}>
      <form className={css.form} onSubmit={handleSubmit}>
        <div>
          <h1 className={css.bigText}>{actionPhrase}</h1>
        </div>
        <label>
          <span className={css.mediumText}>Email</span>
          <Input className={css.smallText} name="email" type="email" required />
        </label>
        <label>
          <span className={css.mediumText}>Password</span>
          <Input className={css.smallText} name="password" type="password" required minLength={6} />
        </label>
        <span className={`${css.smallText} ${css.error}`}>{errorMessage}</span>
        <div className={css.grow} />
        <Button className={css.mediumText} type="submit">
          {actionPhrase}
        </Button>
        <span className={classes(css.smallText, css.fakeLink)} onClick={handleSwitchAuthMethod}>
          {alternativePhrase}
        </span>
      </form>
    </div>
  );
}

type AuthFunction = (email: string, password: string) => Promise<Result<UserToken>>;
const derivedValues: Record<AuthMethod, [string, string, AuthMethod, AuthFunction]> = {
  "log-in": ["Log In", "Need to create an account? Sign up.", "sign-up", logIn],
  "sign-up": ["Sign Up", "Already have an account? Log in.", "log-in", signUp],
};
