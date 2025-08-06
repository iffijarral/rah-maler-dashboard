import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import bcrypt from 'bcryptjs'; // bcryptjs is fine too
import { prisma } from './app/lib/prisma';

async function getUser(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('Failed to parse credentials');
          return null;
        }

        const { email, password } = parsedCredentials.data;
        const user = await getUser(email);

        if (!user) {
          console.log('No user found');
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          console.log('Password mismatch');
          return null;
        }

        // Only return the fields you want to store in session/jwt
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});


// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "./app/lib/prisma";
// import { z } from "zod";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// async function getUser(email: string) {
//   return await prisma.user.findUnique({
//     where: { email }, 
//   });
// }
// console.log("Decoded JWT Test:", jwt.decode(process.env.NEXTAUTH_SECRET || ""));
// export const { auth, signIn, signOut } = NextAuth({  
//   debug: true,
//   secret: process.env.NEXTAUTH_SECRET,  
  
//   providers: [
//     CredentialsProvider({
//       async authorize(credentials) {
//         const parsedCredentials = z
//           .object({ email: z.string().email(), password: z.string().min(6) })
//           .safeParse(credentials);

//         if (!parsedCredentials.success) return null;

//         const { email, password } = parsedCredentials.data;
//         const user = await getUser(email);
//         console.log("User fetched:", user);
//         if (!user) return null;

//         const passwordsMatch = await bcrypt.compare(password, user.password);
//         if (!passwordsMatch) return null;

//         return user;
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
  
// });
