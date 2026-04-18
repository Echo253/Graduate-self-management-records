import "next-auth"

declare module "next-auth" {
  interface User {
    studentId?: string | null
    avatar?: string | null
    backgroundImage?: string | null
  }
  interface Session {
    user: User & {
      id: string
      studentId: string | null
      avatar: string | null
      backgroundImage: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    studentId?: string | null
    avatar?: string | null
    backgroundImage?: string | null
  }
}
