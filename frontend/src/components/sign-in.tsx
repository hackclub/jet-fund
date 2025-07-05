import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useState } from "react"

export default function SignIn() {
    
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    
    async function handleCreateRow() {
        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch("/api/airtable/create-row", {
                method: "POST",
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setMessage("Airtable row created!")
            } else {
                setMessage(data.error || "Failed to create row.")
            }
        } catch (err) {
            setMessage("Network error.")
        } finally {
            setLoading(false)
        }
    }
    if (session?.user) {
        return (
            <div className="flex flex-col gap-2">
                <Button onClick={() => signOut()}>Sign out</Button>
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
                <Button onClick={handleCreateRow} disabled={loading} variant="secondary">
                    {loading ? "Creating..." : "Create Airtable Row"}
                </Button>
                {message && <span className="text-xs text-muted-foreground">{message}</span>}
            </div>
        )
    }
  return (
    <Button onClick={() => signIn("slack")}>Sign in with Slack</Button>
  )
}
