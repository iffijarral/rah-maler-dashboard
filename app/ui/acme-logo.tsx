import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white font-bold`}
    >
      {/* <PaintBrushIcon className="h-12 w-12" /> */}
      <p className="text-xl">RAH Maler</p>
    </div>
  );
}
