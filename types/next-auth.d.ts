import NextAuth from "next-auth"
import { ObjectId } from "mongodb"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface User {
    /** The user's postal address. */
    _id: ObjectId,
    name: string,
    email: string,

  }
}