import ShopSlotTitle from './ShopSlotTitle';
import Link from 'next/link';

function SlotContent({ icon, title }) {
  return (
    <span className="relative block transition-transform duration-200 group-hover:-translate-y-2">
      <img src="/images/shared/shop_slot.png" alt="" aria-hidden="true" className="h-full w-full object-contain" />
      <span className="absolute left-1/2 top-[35%] h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2">
        <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-contain" />
      </span>
      <span className="absolute left-1/2 top-[83%] w-full -translate-x-1/2 -translate-y-1/2 px-4">
        <ShopSlotTitle title={title} />
      </span>
    </span>
  );
}

export default function ShopSlot({ href, icon, title }) {
  const className = 'group block text-center focus:outline-none';

  if (href) {
    return (
      <Link href={href} className={className}>
        <SlotContent icon={icon} title={title} />
      </Link>
    );
  }

  return (
    <span className={className}>
      <SlotContent icon={icon} title={title} />
    </span>
  );
}
