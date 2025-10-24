'use client'

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowRightLeft, CheckCircle2, AlertCircle, Building2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const departments = [
    "Roads Department",
    "Sanitation Department",
    "Electricity Department",
    "Water Department",
    "Other"
]

const getDepartmentIcon = (dept: string) => {
    if (dept.toLowerCase().includes('road')) return '🛣️'
    if (dept.toLowerCase().includes('sanitation')) return '🧹'
    if (dept.toLowerCase().includes('electricity')) return '⚡'
    if (dept.toLowerCase().includes('water')) return '💧'
    return '📋'
}

export function ReassignPopover({ complaintId }: { complaintId: string }) {
    const [open, setOpen] = useState(false)
    const [selectedDept, setSelectedDept] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleReassign = async () => {
        if (!selectedDept) {
            setError("Please select a department first")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/assign/${complaintId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        department: selectedDept,
                        assigned_by: "admin_user",
                    }),
                }
            )

            if (!res.ok) throw new Error("Failed to reassign complaint")

            setSuccess(true)
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                setSelectedDept(null)
            }, 1500)
        } catch (err) {
            console.error(err)
            setError("Failed to reassign complaint. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!loading) {
            setOpen(newOpen)
            if (!newOpen) {
                setError(null)
                setSuccess(false)
                setSelectedDept(null)
            }
        }
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                >
                    <ArrowRightLeft className="w-4 h-4" />
                    Reassign
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-lg border-slate-200" align="end">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">Reassign Complaint</h4>
                            <p className="text-xs text-slate-600">Transfer to another department</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Success Message */}
                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 font-medium">
                                Complaint reassigned successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert className="bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Department Selection */}
                    {!success && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-sm font-medium text-slate-700">
                                    Select Department
                                </Label>
                                <Select onValueChange={(value) => {
                                    setSelectedDept(value)
                                    setError(null)
                                }} value={selectedDept || undefined}>
                                    <SelectTrigger
                                        id="department"
                                        className={`w-full ${error ? 'border-red-300' : ''}`}
                                    >
                                        <SelectValue placeholder="Choose a department..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d} value={d} className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span>{getDepartmentIcon(d)}</span>
                                                    <span>{d}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Department Preview */}
                            {selectedDept && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-slate-600 mb-1">Reassigning to:</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getDepartmentIcon(selectedDept)}</span>
                                        <span className="font-medium text-slate-900 text-sm">{selectedDept}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReassign}
                                    disabled={loading || !selectedDept}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Reassigning...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Confirm
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}