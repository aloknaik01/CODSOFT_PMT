"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "../../features/auth/authSlice";
 
export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
 
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);
 
  return children;
}