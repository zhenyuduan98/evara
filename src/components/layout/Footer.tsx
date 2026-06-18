'use client';

export default function Footer() {
  const columns = [
    {
      title: 'Get to Know Us',
      links: ['Careers', 'Blog', 'About Evara', 'Investor Relations', 'Evara Devices', 'Evara Science'],
    },
    {
      title: 'Make Money with Us',
      links: ['Sell products on Evara', 'Sell on Evara Business', 'Sell apps on Evara', 'Become an Affiliate', 'Advertise Your Products', 'Self-Publish with Us'],
    },
    {
      title: 'Evara Payment Products',
      links: ['Evara Business Card', 'Shop with Points', 'Reload Your Balance', 'Evara Currency Converter'],
    },
    {
      title: 'Let Us Help You',
      links: ['Evara and COVID-19', 'Your Account', 'Your Orders', 'Shipping Rates & Policies', 'Returns & Replacements', 'Help'],
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto" role="contentinfo">
      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm py-3 text-center"
      >
        Back to top
      </button>

      {/* Main footer columns */}
      <div className="bg-amazon-light text-white dark:bg-gray-800">
        <div className="max-w-screen-xl mx-auto px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-bold mb-3 text-base">{col.title}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {col.links.map((link) => (
                  <li key={link} className="hover:underline cursor-pointer">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-amazon-dark text-white border-t border-gray-700 dark:bg-black">
        <div className="max-w-screen-xl mx-auto px-8 py-6 flex flex-col items-center gap-4">
          <div className="text-xl font-bold">
            <span className="text-amazon-orange">Eva</span>
            <span>ra</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <button className="border border-gray-500 rounded px-3 py-1 hover:border-white hover:text-white" aria-label="Select language">
              🌐 English
            </button>
            <button className="border border-gray-500 rounded px-3 py-1 hover:border-white hover:text-white" aria-label="Select currency">
              $ USD
            </button>
            <button className="border border-gray-500 rounded px-3 py-1 hover:border-white hover:text-white" aria-label="Select country">
              🇺🇸 United States
            </button>
          </div>
          <p className="text-xs text-gray-400">© 2024 Evara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
