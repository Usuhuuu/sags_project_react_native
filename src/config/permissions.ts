export type Role = "admin" | "contractor" | "user";

export type Permission =
  | "hall:create"
  | "hall:edit"
  | "hall:delete"
  | "booking:create"
  | "booking:view"
  | "booking:manage"
  | "review:create"
  | "review:delete";

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "hall:create",
    "hall:edit",
    "hall:delete",
    "booking:create",
    "booking:view",
    "booking:manage",
    "review:create",
    "review:delete",
  ],
  contractor: [
    "hall:create",
    "hall:edit",
    "booking:create",
    "booking:view",
    "booking:manage",
    "review:create",
    "review:delete",
  ],
  user: [
    "booking:create",
    "booking:view",
    "booking:manage",
    "review:create",
    "review:delete",
  ],
};
