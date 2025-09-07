import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export default function useAuthReady() {
  const q = useQuery({
    queryKey: ["auth:ready"],
    queryFn: async () => (await client.get("/settings")).data,
    retry: false
  });
  return q;
}
