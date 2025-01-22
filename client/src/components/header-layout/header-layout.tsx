import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import Header from "../header/header";
import styles from "./header-layout.module.css";

// This layout component is for any route which doesn't need to do anything special with the header. It just renders
// the header and its outlet into a simple grid layout with 100vh min-height.
export default function HeaderLayout(): ReactElement {
  return (
    <div className={styles.layout}>
      <Header />
      <Outlet />
    </div>
  );
}
