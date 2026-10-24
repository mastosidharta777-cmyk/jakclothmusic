import './globals.css'

export const metadata = {
  title: 'JakCloth Music',
  description: 'Official Demo Web App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-neutral-950 text-white">{children}</body>
    </html>
  )
}