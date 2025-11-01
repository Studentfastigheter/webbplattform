export default function SiteFooter() {
    return (
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CampusLyan</p>
          <nav className="flex gap-4">
            <a href="/privacy" className="hover:underline">Integritet</a>
            <a href="/contact" className="hover:underline">Kontakt</a>
          </nav>
        </div>
      </footer>
    );
  }