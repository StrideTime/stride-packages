/**
 * Example usage of Stride logo components
 *
 * These examples demonstrate how to use the logo components
 * in different scenarios across your app.
 */

import { LogoProfile, LogoSquare, LogoHorizontal, LogoStacked, LogoMark, LogoText } from "./index";

export function LogoExamples() {
  return (
    <div className="p-8 space-y-12">
      {/* Navigation Bar Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">Navigation Bar</h2>
        <nav className="bg-white border rounded-lg p-4">
          <LogoHorizontal variant="light" width={200} height={80} />
        </nav>
      </section>

      {/* Dark Navigation Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">Dark Navigation Bar</h2>
        <nav className="bg-gray-900 rounded-lg p-4">
          <LogoHorizontal variant="dark" width={200} height={80} />
        </nav>
      </section>

      {/* Sidebar Icon Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">Sidebar (Collapsed)</h2>
        <aside className="bg-gray-800 rounded-lg p-4 w-16">
          <LogoMark variant="white" size={32} />
        </aside>
      </section>

      {/* App Icon Grid Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">App Icons</h2>
        <div className="flex gap-4">
          <LogoProfile size={64} />
          <LogoSquare size={64} />
        </div>
      </section>

      {/* Loading Screen Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">Loading Screen</h2>
        <div className="bg-white border rounded-lg h-64 flex items-center justify-center">
          <LogoStacked variant="light" size={200} />
        </div>
      </section>

      {/* Footer Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">Footer</h2>
        <footer className="bg-gray-800 text-white rounded-lg p-6">
          <LogoText variant="dark" width={150} height={40} />
          <p className="text-sm text-gray-400 mt-2">© 2024 Stride. All rights reserved.</p>
        </footer>
      </section>

      {/* All Variants Showcase */}
      <section>
        <h2 className="text-xl font-bold mb-4">All Logo Variants</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoProfile</p>
            <LogoProfile size={100} />
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoSquare</p>
            <LogoSquare size={100} />
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoHorizontal (Light)</p>
            <LogoHorizontal variant="light" width={250} height={100} />
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-white">LogoHorizontal (Dark)</p>
            <LogoHorizontal variant="dark" width={250} height={100} />
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoStacked (Light)</p>
            <LogoStacked variant="light" size={150} />
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-white">LogoStacked (Dark)</p>
            <LogoStacked variant="dark" size={150} />
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoMark (Primary)</p>
            <LogoMark variant="primary" size={100} />
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-white">LogoMark (White)</p>
            <LogoMark variant="white" size={100} />
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoText (Light)</p>
            <LogoText variant="light" width={200} height={50} />
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-white">LogoText (Dark)</p>
            <LogoText variant="dark" width={200} height={50} />
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">LogoText (Primary)</p>
            <LogoText variant="primary" width={200} height={50} />
          </div>
        </div>
      </section>
    </div>
  );
}
