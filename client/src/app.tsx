import { type ReactElement, Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HeaderLayout from "./components/header-layout/header-layout";
import { AuthContextProvider } from "./hooks/use-auth-context";

const Editor = lazy(() => import("./components/editor/editor"));
const AuthForm = lazy(() => import("./components/auth-form/auth-form"));
const Dashboard = lazy(() => import("./components/dashboard/dashboard"));
const SaveProgram = lazy(() => import("./components/save-program/save-program"));
const NotFound = lazy(() => import("./components/not-found/not-found"));

export default function App(): ReactElement {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense>
                <Editor />
              </Suspense>
            }
          />
          <Route
            path="/program/:id"
            element={
              <Suspense>
                <Editor />
              </Suspense>
            }
          />
          <Route element={<HeaderLayout />}>
            <Route
              path="/auth"
              element={
                <Suspense>
                  <AuthForm />
                </Suspense>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Suspense>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/save-program"
              element={
                <Suspense>
                  <SaveProgram />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  );
}
