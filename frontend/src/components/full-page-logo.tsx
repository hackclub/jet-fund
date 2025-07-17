import Image from 'next/image';

export function FullPageLogo() {
  return (
    <div className="w-full">
      <Image
        src="/assets/Jet_Fund.png"
        alt="Jet Fund Logo Full Page"
        width={1920}
        height={1080}
        className="w-full h-auto object-contain"
        priority
      />
    </div>
  );
} 