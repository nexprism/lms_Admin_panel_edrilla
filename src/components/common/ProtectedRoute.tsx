import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from "../../store/slices/authslice"; // adjust path if needed

interface ProtectedRouteProps {
  /**
   * When provided, the route group is additionally gated on the authenticated
   * user's role. The role is read from verified server state (the Redux
   * auth.user populated from the /me response) rather than mutable
   * localStorage. Leave undefined to gate on authentication only (default).
   */
  allowedRoles?: string[];
  /**
   * Where to send an authenticated-but-unauthorized user. Defaults to "/news",
   * the landing route restricted roles are redirected to on login.
   */
  redirectTo?: string;
}

const ProtectedRoute = ({
  allowedRoles,
  redirectTo = "/news",
}: ProtectedRouteProps = {}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Not signed in -> bounce to sign in.
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Role-aware guard (defense in depth). Only enforced when an allowedRoles
  // list is supplied; otherwise this behaves exactly like an auth-only guard.
  if (allowedRoles && allowedRoles.length > 0) {
    const role = user?.role ? String(user.role).trim() : null;
    const isAllowed = role
      ? allowedRoles.some(
          (allowed) => allowed.toLowerCase() === role.toLowerCase()
        )
      : false;

    if (!isAllowed) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
