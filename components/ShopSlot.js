import Link from 'next/link';
import ShopSlotTitle from './ShopSlotTitle';

export default function ShopSlot({ href, icon, title }) {
  return (
    <Link href={href} className="group block text-center focus:outline-none">
      <span className="relative block transition-transform duration-200 group-hover:-translate-y-2">
        {/* <span className="relative block aspect-square border border-line bg-paper p-3 shadow-panel transition-colors group-hover:border-bronze"> */}
          <img src="/images/shared/shop_slot.png" alt="" aria-hidden="true" className="h-full w-full object-contain" />
          <span className="absolute left-1/2 top-[35%] h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2">
            <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-contain" />
          </span>
          <span className="absolute left-1/2 top-[83%] w-full -translate-x-1/2 -translate-y-1/2 px-4">
            <ShopSlotTitle title={title} />
          </span>
        {/* </span> */}
      </span>
    </Link>
  );
}