import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/clerk-react";

export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />;
}