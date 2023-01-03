import NextAuth, { User } from "next-auth"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"
import connectMongo from '../../../lib/dbConnect';
import CredentialProvider from "next-auth/providers/credentials"
import { compare } from 'bcryptjs';
import Users from "../../../models/user";
import { ObjectId } from "mongodb";


// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),


  providers: [


    CredentialProvider({

      name: "credentials",
      credentials: {
        email: { label: "Email Address", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        await connectMongo();
        let user = await Users.findOne({ email: credentials!.email });
        if (!user) {
          throw new Error('No user found')
        }

        const checkPassword = await compare(credentials!.password, user.password)

        if (!checkPassword) {
          throw new Error('Password is incorrect')
        }

        return Promise.resolve({
          _id: user._id,
          username: user.username,
          email: user.email,
        }) as any
      },
    })
  ],
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({}) {
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
   
    jwt: ({ token, user }) => {
      if (user) {
        token = {
          ...user
        }
      }
      return token
    },
    session: ({ token, session }) => {
      session.user = {
        ...token
      }
      return session
    }
  }
})