import { useSelector } from "react-redux";

export default function useAuth() {
  const { user, loading, error, initializing } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    loading,
    error,
    initializing,
    isAuthenticated: !!user,
  };
}