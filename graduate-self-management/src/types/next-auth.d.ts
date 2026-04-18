import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    avatar?: string | null
    backgroundImage?: string | null
  }

  interface Account {}

  interface Session {
    user: User
    expires: ISODateString
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    avatar?: string | null
    backgroundImage?: string | null
  }
}
