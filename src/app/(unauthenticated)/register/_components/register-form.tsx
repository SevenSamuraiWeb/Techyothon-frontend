'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import bcrypt from 'bcryptjs';
import { useRouter } from "next/navigation"

interface RegisterFormProps {
    name: string
    email: string
    password: string
    role: "user" | "admin"
}

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [formData, setFormData] = useState<RegisterFormProps>({
        name: "",
        email: "",
        password: "",
        role: "user",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const form = e.currentTarget
        const name = (form.elements.namedItem("name") as HTMLInputElement).value
        const email = (form.elements.namedItem("email") as HTMLInputElement).value
        const password = (form.elements.namedItem("password") as HTMLInputElement).value
        const role = (form.elements.namedItem("role") as HTMLSelectElement).value as "user" | "admin"

        const payload = new FormData()
        payload.append("name", name)
        payload.append("email", email)
        payload.append("password", password)
        payload.append("role", role)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/register`, {
                method: "POST",
                body: payload,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Registration failed")
            }

            const data = await response.json()
            console.log("Registration successful:", data)
            if (data.success === false) {
                alert(data.type)
                return
            }
            alert("Registration successful!")
            setTimeout(() => {
                router.push('/login')
            }, 1000)
            // Optionally reset form or redirect
        } catch (error) {
            console.error("Registration error:", error)
        } finally {
            setLoading(false)
        }

        // Update state for UI purposes if needed
        setFormData({
            name,
            email,
            password: password,
            role,
        })
    }


    useEffect(() => {
        console.log("Registering user:", formData)
    }, [formData])

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8 space-y-4" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center mb-4">
                                <h1 className="text-2xl font-bold">Welcome</h1>
                                <p className="text-muted-foreground text-balance">
                                    Create an Account
                                </p>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input id="name" name="name" type="text" placeholder="John Doe" required />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </Field>

                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="role">Role</FieldLabel>
                                <Select name="role" defaultValue="user">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
                            </Field>

                            <FieldDescription className="text-center">
                                Already have an account? <Link href="/login">Login</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>

                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/placeholder.avif"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
