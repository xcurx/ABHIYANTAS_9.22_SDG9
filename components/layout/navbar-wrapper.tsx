import { auth, signOut } from "@/auth"
import { Navbar } from "./navbar"

export async function NavbarWrapper() {
    const session = await auth()

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/sign-in" })
    }

    return (
        <Navbar 
            user={session?.user} 
            signOutAction={signOutAction} 
        />
    )
}
