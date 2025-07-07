import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function SignIn() {
    const { data: session } = useSession()
    if (session?.user) {
        return (
            <div className="flex flex-col gap-2">
                <Button onClick={() => signOut()}>Sign out</Button>
                {/* <span className="text-sm text-muted-foreground">{session.user.email}</span> */}
            </div>
        )
    }
    return (
        <Button onClick={() => signIn("slack")}>Sign in with Slack</Button>
    )
}
