import Link from "next/link"

export default function OrganizationNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-2 text-lg text-gray-600">Organization not found</p>
                <p className="mt-1 text-sm text-gray-500">
                    The organization you're looking for doesn't exist or you don't have access to it.
                </p>
                <Link
                    href="/organizations"
                    className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    Back to Organizations
                </Link>
            </div>
        </div>
    )
}
