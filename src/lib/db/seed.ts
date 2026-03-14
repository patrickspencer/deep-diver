import { db } from "./index";
import { users, userSettings } from "./schema";
import { hashPassword } from "../auth";

export function seedDefaultUser() {
  const existing = db.select().from(users).get();
  if (existing) return;

  const result = db
    .insert(users)
    .values({
      email: "admin@deepdiver.local",
      name: "Admin",
      passwordHash: hashPassword("admin"),
    })
    .returning({ id: users.id })
    .get();

  db.insert(userSettings)
    .values({ userId: result.id, key: "theme", value: "dark" })
    .run();
}
