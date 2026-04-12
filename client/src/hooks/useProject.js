
import { useSelector } from "react-redux";

export default function useProject() {
  const { list, current, members, loading, membersLoading, error } =
    useSelector((state) => state.projects);

  return {
    projects: list,
    currentProject: current,
    members,
    loading,
    membersLoading,
    error,
  };
}