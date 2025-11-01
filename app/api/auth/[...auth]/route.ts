// app/api/auth/[...auth]/route.ts
import { handlers } from "@/app/auth"; // Assuming @ alias works, or use ../../auth
export const { GET, POST } = handlers;