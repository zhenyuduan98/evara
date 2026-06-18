import Link from 'next/link';
import Image from 'next/image';

interface ContentBlockProps {
  block: {
    id: string;
    type: string;
    title: string | null;
    config: any;
    position: number;
    isActive: boolean;
  };
}

export default function ContentBlockRenderer({ block }: ContentBlockProps) {
  const { type, title, config } = block;

  switch (type) {
    case 'banner':
      return (
        <div className="relative w-full">
          {config.linkUrl ? (
            <Link href={config.linkUrl}>
              {config.imageUrl ? (
                <div className="w-full h-[300px] md:h-[400px] relative bg-gradient-to-r from-cyan-700 to-blue-900">
                  <Image src={config.imageUrl} alt={config.altText || 'Banner'} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-r from-cyan-700 to-blue-900 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{title || 'Banner'}</span>
                </div>
              )}
            </Link>
          ) : (
            <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-r from-cyan-700 to-blue-900 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{title || 'Banner'}</span>
            </div>
          )}
        </div>
      );

    case 'text_block':
      return (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-6">
            {title && <h2 className="text-xl font-bold mb-3">{title}</h2>}
            <div className="prose" dangerouslySetInnerHTML={{ __html: config.content || '' }} />
          </div>
        </div>
      );

    case 'featured_products':
      return (
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-3">{title || 'Featured Products'}</h2>
            <p className="text-gray-500">Products loaded dynamically</p>
          </div>
        </div>
      );

    case 'category_grid':
      return (
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-3">{title || 'Categories'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(config.categories || []).map((cat: any, i: number) => (
                <Link key={i} href={cat.link || '#'} className="bg-gray-50 rounded p-4 text-center hover:shadow">
                  <span className="text-3xl">{cat.icon || '📦'}</span>
                  <p className="mt-2 text-sm font-medium">{cat.name || 'Category'}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      );

    case 'deal_section':
      return (
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-red-600 mb-3">{title || '🔥 Deals'}</h2>
            <p className="text-gray-500">Deals loaded dynamically</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-400">Unknown block type: {type}</p>
          </div>
        </div>
      );
  }
}
