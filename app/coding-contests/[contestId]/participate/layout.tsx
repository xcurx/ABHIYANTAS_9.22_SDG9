export default function ParticipateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* Override parent layout's pt-16 padding and hide navbar using CSS */}
            <style>{`
                /* Hide navbar on participate page */
                nav.fixed {
                    display: none !important;
                }
                /* Remove top padding from parent layout */
                body > div.pt-16 {
                    padding-top: 0 !important;
                }
            `}</style>
            {children}
        </>
    )
}
