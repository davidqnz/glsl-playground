import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isError } from "../../../../common/result";
import { useAuthContext } from "../../hooks/use-auth-context";
import { Loader } from "../../hooks/use-loader";
import navigationLinks from "../../navigation-links";
import { logOut } from "../../services/auth-service";
import type { AuthMethod } from "../auth-form/auth-form";
import Button from "../form-controls/button";
import Menu, { MenuDivider, MenuItem, MenuTitle } from "../menu/menu";
import styles from "./header.module.css";

type Props = {
  style?: CSSProperties;
  children?: ReactNode;
};

export default function Header({ style, children }: Props): ReactElement {
  const { user, setUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  async function handleLogOut(): Promise<void> {
    const result = await logOut();
    if (!isError(result)) {
      setUser(null);
    } else {
      console.error(result);
    }
  }

  function handleAuthButtonClick(method: AuthMethod): void {
    // If we're already on the auth page, we should preserve the current search params when switching methods.
    if (location.pathname !== "/auth") {
      navigate(`/auth?method=${method}`);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("method", method);
      setSearchParams(newParams);
    }
  }

  const navigationLinksToShow = navigationLinks.filter((nl) => !nl.hidePattern.exec(location.pathname));

  let userSlot: ReactNode = <></>;
  if (Loader.isLoaded(user) && user.value) {
    userSlot = (
      <Menu>
        <MenuTitle>{`Signed in as ${user.value.email}`}</MenuTitle>
        <MenuDivider />
        {navigationLinksToShow.map((nl) => (
          <MenuItem key={nl.path} onClick={() => navigate(nl.path)}>
            {nl.text}
          </MenuItem>
        ))}
        <MenuItem onClick={handleLogOut}>
          <span className={styles.redText}>Log Out</span>
        </MenuItem>
      </Menu>
    );
  } else if (Loader.isLoaded(user) && !user.value) {
    userSlot = (
      <>
        <Button className={styles.headerButton} onClick={() => handleAuthButtonClick("sign-up")}>
          Sign Up
        </Button>
        <Button className={styles.headerButton} onClick={() => handleAuthButtonClick("log-in")}>
          Log In
        </Button>
      </>
    );
  }

  return (
    <div className={styles.header} style={style}>
      <div className={styles.left}>
        <Link className={styles.siteName} to="/">
          GLSL Playground
        </Link>
      </div>
      <div>{children}</div>
      <div className={styles.right}>{userSlot}</div>
    </div>
  );
}
